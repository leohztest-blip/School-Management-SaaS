import { createClient } from '@/lib/supabase/client';
import type { AnalyticsSnapshot, AiInsight, StudentPerformanceSnapshot, PlatformStats } from '@/types/phase2';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const supabase = createClient();

export const analyticsService = {

  // ── Daily Snapshots ───────────────────────────────────────

  async getSchoolSnapshots(
    schoolId: string,
    type: string,
    days = 30
  ): Promise<AnalyticsSnapshot[]> {
    const since = format(subDays(new Date(), days), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('school_id', schoolId)
      .eq('snapshot_type', type)
      .gte('snapshot_date', since)
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data as AnalyticsSnapshot[];
  },

  async triggerDailySnapshot(schoolId: string, date?: string): Promise<void> {
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    await supabase.from('job_queue').insert({
      school_id: schoolId,
      job_type: 'compute_analytics',
      payload: { school_id: schoolId, date: targetDate, type: 'daily' },
      priority: 6,
      scheduled_at: new Date().toISOString(),
    });
  },

  // ── School Analytics ──────────────────────────────────────

  async getSchoolAnalytics(schoolId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const last30 = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const [
      { count: totalStudents },
      { count: activeStudents },
      { count: totalStaff },
      { count: pendingLeave },
      { data: monthlyAttendance },
      { data: revenueData },
      { data: expenseData },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).is('deleted_at', null),
      supabase.from('students').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true).is('deleted_at', null),
      supabase.from('staff').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true),
      supabase.from('leave_requests').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('status', 'pending'),
      supabase.from('attendance').select('status')
        .eq('school_id', schoolId).gte('date', monthStart).lte('date', monthEnd),
      supabase.from('payments').select('amount, payment_date')
        .eq('school_id', schoolId).gte('payment_date', last30),
      supabase.from('expenses').select('amount, expense_date')
        .eq('school_id', schoolId).gte('expense_date', last30),
    ]);

    const attendanceSummary = (monthlyAttendance || []).reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      },
      {}
    );

    const totalRevenue = (revenueData || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
    const totalExpenses = (expenseData || []).reduce((s: number, e: any) => s + Number(e.amount), 0);

    return {
      students: { total: totalStudents || 0, active: activeStudents || 0 },
      staff: { total: totalStaff || 0 },
      leave: { pending: pendingLeave || 0 },
      attendance: {
        present: attendanceSummary.present || 0,
        absent: attendanceSummary.absent || 0,
        total: attendanceSummary.total || 0,
        rate: attendanceSummary.total
          ? Math.round(((attendanceSummary.present || 0) / attendanceSummary.total) * 100)
          : 0,
      },
      finance: {
        revenue_30d: totalRevenue,
        expenses_30d: totalExpenses,
        net_30d: totalRevenue - totalExpenses,
      },
    };
  },

  // ── Student Performance ───────────────────────────────────

  async getAtRiskStudents(schoolId: string, threshold = 0.6): Promise<StudentPerformanceSnapshot[]> {
    const { data, error } = await supabase
      .from('student_performance_snapshots')
      .select('*, student:students(id, full_name, student_id, class:classes(name), section:sections(name))')
      .eq('school_id', schoolId)
      .gte('risk_score', threshold)
      .order('risk_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as StudentPerformanceSnapshot[];
  },

  async getStudentPerformanceTrend(studentId: string, academicYearId: string) {
    const { data, error } = await supabase
      .from('student_performance_snapshots')
      .select('*')
      .eq('student_id', studentId)
      .eq('academic_year_id', academicYearId)
      .order('snapshot_month', { ascending: true });

    if (error) throw error;
    return data as StudentPerformanceSnapshot[];
  },

  async computeStudentSnapshot(
    schoolId: string,
    studentId: string,
    academicYearId: string,
    month: number
  ): Promise<StudentPerformanceSnapshot> {
    const year = new Date().getFullYear();
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');

    // Attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)
      .gte('date', monthStart)
      .lte('date', monthEnd);

    const totalDays = attendance?.length || 0;
    const presentDays = attendance?.filter((a: any) => a.status === 'present').length || 0;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Fees
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, paid_amount')
      .eq('student_id', studentId)
      .eq('month', month);

    const totalFees = invoices?.reduce((s: number, i: any) => s + Number(i.total), 0) || 0;
    const paidFees = invoices?.reduce((s: number, i: any) => s + Number(i.paid_amount), 0) || 0;
    const feePaymentRate = totalFees > 0 ? (paidFees / totalFees) * 100 : 100;

    // Marks
    const { data: results } = await supabase
      .from('exam_results')
      .select('marks_obtained, full_marks')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    const avgMarks = results?.length
      ? results.reduce((s: number, r: any) => s + (Number(r.marks_obtained) / Number(r.full_marks)) * 100, 0) / results.length
      : 0;

    // Assignments
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('status')
      .eq('student_id', studentId);

    const totalAssignments = submissions?.length || 0;
    const completedAssignments = submissions?.filter((s: any) => s.status !== 'submitted' || s.submitted_at).length || 0;
    const assignmentRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 100;

    // Risk score (computed server-side via DB function ideally)
    let riskScore = 0;
    if (attendanceRate < 75) riskScore += 0.4;
    else if (attendanceRate < 85) riskScore += 0.2;
    if (feePaymentRate < 50) riskScore += 0.3;
    else if (feePaymentRate < 75) riskScore += 0.15;
    if (avgMarks < 33) riskScore += 0.3;
    else if (avgMarks < 50) riskScore += 0.15;

    const flags: string[] = [];
    if (attendanceRate < 75) flags.push('critical_attendance');
    else if (attendanceRate < 85) flags.push('low_attendance');
    if (feePaymentRate < 50) flags.push('fee_defaulter');
    if (avgMarks < 33) flags.push('failing_grades');

    const { data, error } = await supabase
      .from('student_performance_snapshots')
      .upsert({
        school_id: schoolId,
        student_id: studentId,
        academic_year_id: academicYearId,
        snapshot_month: month,
        attendance_rate: Math.round(attendanceRate * 100) / 100,
        average_marks: Math.round(avgMarks * 100) / 100,
        fee_payment_rate: Math.round(feePaymentRate * 100) / 100,
        assignment_completion_rate: Math.round(assignmentRate * 100) / 100,
        risk_score: Math.min(riskScore, 1),
        flags,
      }, { onConflict: 'student_id,academic_year_id,snapshot_month' })
      .select()
      .single();

    if (error) throw error;
    return data as StudentPerformanceSnapshot;
  },

  // ── AI Insights ───────────────────────────────────────────

  async getInsights(schoolId: string, unreadOnly = false): Promise<AiInsight[]> {
    let query = supabase
      .from('ai_insights')
      .select('*')
      .eq('school_id', schoolId)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(20);

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) throw error;
    return data as AiInsight[];
  },

  async generateInsights(schoolId: string): Promise<void> {
    // Enqueue AI insight computation job
    await supabase.from('job_queue').insert({
      school_id: schoolId,
      job_type: 'compute_analytics',
      payload: { school_id: schoolId, type: 'ai_insights' },
      priority: 8,
      scheduled_at: new Date().toISOString(),
    });
  },

  async markInsightRead(insightId: string): Promise<void> {
    await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);
  },

  // ── Platform Analytics (Super Admin) ─────────────────────

  async getPlatformStats(): Promise<PlatformStats> {
    const [
      { count: totalSchools },
      { count: activeSchools },
      { count: totalStudents },
      { count: totalStaff },
    ] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
      supabase.from('staff').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const { data: monthlyRevenue } = await supabase
      .from('saas_invoices')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('paid_at', currentMonth);

    const mrr = (monthlyRevenue || []).reduce((s: number, i: any) => s + Number(i.total_amount), 0);

    const planDist = await billingServiceCompat.getSchoolsByPlan();

    return {
      total_schools: totalSchools || 0,
      active_schools: activeSchools || 0,
      total_students: totalStudents || 0,
      total_staff: totalStaff || 0,
      monthly_revenue: mrr,
      monthly_new_schools: 0, // compute separately
      plan_distribution: planDist,
      revenue_by_plan: {},
      churn_rate: 0,
      avg_students_per_school: totalSchools ? Math.round((totalStudents || 0) / totalSchools) : 0,
    };
  },

  // ── Branch Analytics ──────────────────────────────────────

  async getBranchStats(schoolId: string) {
    const { data: branches, error } = await supabase
      .from('branches')
      .select('id, name')
      .eq('school_id', schoolId)
      .eq('status', 'active');

    if (error) throw error;
    if (!branches?.length) return [];

    const stats = await Promise.all(
      branches.map(async (branch: any) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [{ count: students }, { count: staff }, { data: todayAttendance }] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true })
            .eq('school_id', schoolId),
          supabase.from('branch_staff').select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id),
          supabase.from('attendance').select('status')
            .eq('school_id', schoolId).eq('date', today),
        ]);

        const presentCount = (todayAttendance || []).filter((a: any) => a.status === 'present').length;
        const totalCount = todayAttendance?.length || 0;

        return {
          branch_id: branch.id,
          branch_name: branch.name,
          total_students: students || 0,
          total_staff: staff || 0,
          attendance_rate: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
          monthly_revenue: 0,
          pending_fees: 0,
        };
      })
    );

    return stats;
  },
};

// Compatibility shim to avoid circular dep
const billingServiceCompat = {
  async getSchoolsByPlan() {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan:plans(name)')
      .eq('status', 'active');

    const dist: Record<string, number> = { free: 0, starter: 0, professional: 0, enterprise: 0 };
    for (const sub of (data || [])) {
      const name = (sub.plan as any)?.name;
      if (name && dist[name] !== undefined) dist[name]++;
    }
    return dist;
  },
};
