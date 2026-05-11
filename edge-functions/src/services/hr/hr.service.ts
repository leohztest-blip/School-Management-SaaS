import { createClient } from '@/lib/supabase/client';
import type { Department, Position, LeaveRequest, LeaveBalance, LeavePolicy } from '@/types/phase2';
import type { PaginatedResponse, QueryParams } from '@/types';

const supabase = createClient();

export const hrService = {

  // ── Departments ───────────────────────────────────────────

  async getDepartments(schoolId: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*, head_staff:staff(id, full_name, designation)')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as Department[];
  },

  async createDepartment(schoolId: string, payload: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ ...payload, school_id: schoolId })
      .select()
      .single();
    if (error) throw error;
    return data as Department;
  },

  // ── Positions ─────────────────────────────────────────────

  async getPositions(schoolId: string, departmentId?: string): Promise<Position[]> {
    let query = supabase
      .from('positions')
      .select('*, department:departments(name)')
      .eq('school_id', schoolId);

    if (departmentId) query = query.eq('department_id', departmentId);

    const { data, error } = await query.order('title');
    if (error) throw error;
    return data as Position[];
  },

  // ── Leave Policies ────────────────────────────────────────

  async getLeavePolicies(schoolId: string): Promise<LeavePolicy[]> {
    const { data, error } = await supabase
      .from('leave_policies')
      .select('*')
      .eq('school_id', schoolId)
      .order('leave_type');
    if (error) throw error;
    return data as LeavePolicy[];
  },

  async upsertLeavePolicy(schoolId: string, policy: Partial<LeavePolicy>): Promise<LeavePolicy> {
    const { data, error } = await supabase
      .from('leave_policies')
      .upsert({ ...policy, school_id: schoolId }, { onConflict: 'school_id,leave_type,applicable_to' })
      .select()
      .single();
    if (error) throw error;
    return data as LeavePolicy;
  },

  // ── Leave Balances ────────────────────────────────────────

  async getLeaveBalances(schoolId: string, staffId: string, year: number): Promise<LeaveBalance[]> {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('school_id', schoolId)
      .eq('staff_id', staffId)
      .eq('year', year)
      .order('leave_type');
    if (error) throw error;
    return data as LeaveBalance[];
  },

  async initLeaveBalances(schoolId: string, staffId: string, year: number): Promise<void> {
    const policies = await this.getLeavePolicies(schoolId);
    const inserts = policies.map(p => ({
      school_id: schoolId,
      staff_id: staffId,
      leave_type: p.leave_type,
      year,
      allocated: p.days_allowed,
      used: 0,
      carried_forward: 0,
    }));

    const { error } = await supabase
      .from('leave_balances')
      .upsert(inserts, { onConflict: 'school_id,staff_id,leave_type,year' });

    if (error) throw error;
  },

  // ── Leave Requests ────────────────────────────────────────

  async getLeaveRequests(schoolId: string, params: QueryParams = {}): Promise<PaginatedResponse<LeaveRequest>> {
    const { page = 1, per_page = 20, filters = {} } = params;
    const from = (page - 1) * per_page;

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        staff:staff(id, full_name, staff_id, designation, photo_url),
        substitute_staff:staff!leave_requests_substitute_staff_id_fkey(id, full_name)
      `, { count: 'exact' })
      .eq('school_id', schoolId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.staff_id) query = query.eq('staff_id', filters.staff_id);
    if (filters.leave_type) query = query.eq('leave_type', filters.leave_type);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + per_page - 1);

    if (error) throw error;
    return {
      data: data as LeaveRequest[],
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };
  },

  async submitLeaveRequest(
    schoolId: string,
    staffId: string,
    payload: Partial<LeaveRequest>
  ): Promise<LeaveRequest> {
    // Validate balance
    const year = new Date(payload.start_date!).getFullYear();
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('remaining')
      .eq('school_id', schoolId)
      .eq('staff_id', staffId)
      .eq('leave_type', payload.leave_type)
      .eq('year', year)
      .single();

    const days = Math.ceil(
      (new Date(payload.end_date!).getTime() - new Date(payload.start_date!).getTime())
      / (1000 * 60 * 60 * 24)
    ) + 1;

    if (balance && Number(balance.remaining) < days && payload.leave_type !== 'unpaid') {
      throw new Error(`Insufficient ${payload.leave_type} leave balance. Available: ${balance.remaining} days`);
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ ...payload, school_id: schoolId, staff_id: staffId, status: 'pending' })
      .select()
      .single();

    if (error) throw error;
    return data as LeaveRequest;
  },

  async approveLeaveRequest(
    requestId: string,
    reviewedBy: string,
    approved: boolean,
    note?: string
  ): Promise<LeaveRequest> {
    const { data: request } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Leave request not found');

    const status = approved ? 'approved' : 'rejected';

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_note: note,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Deduct balance if approved
    if (approved) {
      const year = new Date(request.start_date).getFullYear();
      await supabase.rpc('exec', {
        query: `
          UPDATE leave_balances
          SET used = used + $1, updated_at = NOW()
          WHERE school_id = $2 AND staff_id = $3
          AND leave_type = $4 AND year = $5
        `,
        params: [request.days, request.school_id, request.staff_id, request.leave_type, year],
      }).maybeSingle();
    }

    return data as LeaveRequest;
  },

  async getLeaveCalendar(schoolId: string, month: number, year: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        id, start_date, end_date, leave_type, status,
        staff:staff(id, full_name, photo_url, designation)
      `)
      .eq('school_id', schoolId)
      .eq('status', 'approved')
      .or(`start_date.gte.${start},end_date.lte.${end}`)
      .order('start_date');

    if (error) throw error;
    return data || [];
  },

  // ── Staff Directory ───────────────────────────────────────

  async getStaffDirectory(schoolId: string, branchId?: string) {
    let query = supabase
      .from('staff')
      .select(`
        *,
        department:departments(name),
        position:positions(title, grade)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (branchId) {
      const { data: branchStaff } = await supabase
        .from('branch_staff')
        .select('staff_id')
        .eq('branch_id', branchId);
      const staffIds = (branchStaff || []).map((bs: any) => bs.staff_id);
      if (staffIds.length) query = query.in('id', staffIds);
    }

    const { data, error } = await query.order('full_name');
    if (error) throw error;
    return data || [];
  },
};
