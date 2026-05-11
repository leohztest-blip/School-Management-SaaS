import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { formatCurrency } from '@/utils';

const supabase = createClient();

// ============================================================
// REPORT DEFINITIONS
// ============================================================

export type ReportType =
  | 'student_list'
  | 'attendance_summary'
  | 'attendance_detail'
  | 'fee_collection'
  | 'fee_outstanding'
  | 'payroll_summary'
  | 'payroll_detail'
  | 'exam_result'
  | 'exam_marksheet'
  | 'income_expense'
  | 'branch_summary'
  | 'student_performance';

export interface ReportFilter {
  school_id: string;
  branch_id?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  start_date?: string;
  end_date?: string;
  month?: number;
  year?: number;
  staff_id?: string;
  exam_id?: string;
  format?: 'json' | 'csv' | 'pdf';
}

export interface ReportResult {
  title: string;
  subtitle?: string;
  generated_at: string;
  filters: Record<string, string>;
  columns: { key: string; label: string; width?: number; align?: 'left' | 'right' | 'center' }[];
  rows: Record<string, string | number>[];
  summary?: Record<string, string | number>;
  metadata?: Record<string, unknown>;
}

// ============================================================
// REPORT SERVICE
// ============================================================

export const reportingService = {

  async generateReport(type: ReportType, filter: ReportFilter): Promise<ReportResult> {
    switch (type) {
      case 'student_list': return this.studentListReport(filter);
      case 'attendance_summary': return this.attendanceSummaryReport(filter);
      case 'fee_collection': return this.feeCollectionReport(filter);
      case 'fee_outstanding': return this.feeOutstandingReport(filter);
      case 'payroll_summary': return this.payrollSummaryReport(filter);
      case 'income_expense': return this.incomeExpenseReport(filter);
      default: throw new Error(`Unknown report type: ${type}`);
    }
  },

  // ── Student List ──────────────────────────────────────────

  async studentListReport(filter: ReportFilter): Promise<ReportResult> {
    let query = supabase
      .from('students')
      .select(`
        student_id, full_name, gender, date_of_birth, blood_group,
        admission_date, roll_number, is_scholarship,
        class:classes(name), section:sections(name),
        student_guardians(guardian:guardians(full_name, phone))
      `)
      .eq('school_id', filter.school_id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('full_name');

    if (filter.class_id) query = query.eq('class_id', filter.class_id);
    if (filter.section_id) query = query.eq('section_id', filter.section_id);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []).map((s: any) => ({
      student_id: s.student_id,
      name: s.full_name,
      class: `${s.class?.name || ''} - ${s.section?.name || ''}`,
      roll: s.roll_number || '–',
      gender: s.gender,
      dob: s.date_of_birth ? format(new Date(s.date_of_birth), 'dd/MM/yyyy') : '–',
      blood_group: s.blood_group || '–',
      guardian: s.student_guardians?.[0]?.guardian?.full_name || '–',
      guardian_phone: s.student_guardians?.[0]?.guardian?.phone || '–',
      scholarship: s.is_scholarship ? 'Yes' : 'No',
      admission_date: s.admission_date ? format(new Date(s.admission_date), 'dd/MM/yyyy') : '–',
    }));

    return {
      title: 'Student List Report',
      generated_at: new Date().toISOString(),
      filters: { class: filter.class_id || 'All Classes' },
      columns: [
        { key: 'student_id', label: 'Student ID', width: 100 },
        { key: 'name', label: 'Name', width: 200 },
        { key: 'class', label: 'Class/Section', width: 120 },
        { key: 'roll', label: 'Roll', width: 60, align: 'center' },
        { key: 'gender', label: 'Gender', width: 80 },
        { key: 'dob', label: 'Date of Birth', width: 110 },
        { key: 'guardian', label: 'Guardian', width: 150 },
        { key: 'guardian_phone', label: 'Phone', width: 120 },
        { key: 'scholarship', label: 'Scholarship', width: 90, align: 'center' },
      ],
      rows,
      summary: { total_students: rows.length },
    };
  },

  // ── Attendance Summary ────────────────────────────────────

  async attendanceSummaryReport(filter: ReportFilter): Promise<ReportResult> {
    const start = filter.start_date || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = filter.end_date || format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        student_id, status,
        student:students(student_id, full_name, class:classes(name), section:sections(name))
      `)
      .eq('school_id', filter.school_id)
      .gte('date', start)
      .lte('date', end);

    if (error) throw error;

    // Aggregate by student
    const byStudent: Record<string, { name: string; class: string; section: string; present: number; absent: number; late: number; total: number }> = {};

    for (const row of (data || [])) {
      const student = (row as any).student;
      if (!byStudent[row.student_id]) {
        byStudent[row.student_id] = {
          name: student?.full_name || 'Unknown',
          class: student?.class?.name || '',
          section: student?.section?.name || '',
          present: 0, absent: 0, late: 0, total: 0,
        };
      }
      byStudent[row.student_id].total++;
      byStudent[row.student_id][row.status as 'present' | 'absent' | 'late']++;
    }

    const rows = Object.entries(byStudent).map(([id, s]) => ({
      student_id: id,
      name: s.name,
      class_section: `${s.class}-${s.section}`,
      present: s.present,
      absent: s.absent,
      late: s.late,
      total: s.total,
      rate: s.total > 0 ? `${Math.round((s.present / s.total) * 100)}%` : '0%',
    }));

    return {
      title: 'Attendance Summary Report',
      subtitle: `${format(new Date(start), 'dd MMM yyyy')} – ${format(new Date(end), 'dd MMM yyyy')}`,
      generated_at: new Date().toISOString(),
      filters: { period: `${start} to ${end}` },
      columns: [
        { key: 'name', label: 'Student Name', width: 200 },
        { key: 'class_section', label: 'Class', width: 100 },
        { key: 'present', label: 'Present', width: 80, align: 'center' },
        { key: 'absent', label: 'Absent', width: 80, align: 'center' },
        { key: 'late', label: 'Late', width: 80, align: 'center' },
        { key: 'total', label: 'Total', width: 80, align: 'center' },
        { key: 'rate', label: 'Rate', width: 80, align: 'right' },
      ],
      rows,
      summary: {
        total_students: rows.length,
        avg_rate: rows.length > 0
          ? Math.round(rows.reduce((s, r) => s + parseInt(r.rate as string), 0) / rows.length) + '%'
          : '0%',
      },
    };
  },

  // ── Fee Collection ────────────────────────────────────────

  async feeCollectionReport(filter: ReportFilter): Promise<ReportResult> {
    const start = filter.start_date || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = filter.end_date || format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('payments')
      .select(`
        payment_number, amount, payment_method, payment_date, transaction_id,
        student:students(full_name, student_id, class:classes(name)),
        invoice:invoices(invoice_number)
      `)
      .eq('school_id', filter.school_id)
      .gte('payment_date', start)
      .lte('payment_date', `${end}T23:59:59`)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    const rows = (data || []).map((p: any) => ({
      receipt: p.payment_number,
      invoice: p.invoice?.invoice_number || '–',
      student: p.student?.full_name || '–',
      student_id: p.student?.student_id || '–',
      class: p.student?.class?.name || '–',
      amount: formatCurrency(p.amount),
      method: p.payment_method,
      txn_id: p.transaction_id || '–',
      date: format(new Date(p.payment_date), 'dd/MM/yyyy HH:mm'),
    }));

    const totalCollected = (data || []).reduce((s: number, p: any) => s + Number(p.amount), 0);

    return {
      title: 'Fee Collection Report',
      subtitle: `${format(new Date(start), 'dd MMM yyyy')} – ${format(new Date(end), 'dd MMM yyyy')}`,
      generated_at: new Date().toISOString(),
      filters: { period: `${start} to ${end}` },
      columns: [
        { key: 'receipt', label: 'Receipt No.', width: 140 },
        { key: 'student', label: 'Student', width: 180 },
        { key: 'class', label: 'Class', width: 100 },
        { key: 'amount', label: 'Amount', width: 100, align: 'right' },
        { key: 'method', label: 'Method', width: 100 },
        { key: 'date', label: 'Date', width: 140 },
      ],
      rows,
      summary: {
        total_transactions: rows.length,
        total_collected: formatCurrency(totalCollected),
      },
    };
  },

  // ── Fee Outstanding ───────────────────────────────────────

  async feeOutstandingReport(filter: ReportFilter): Promise<ReportResult> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        invoice_number, total, paid_amount, balance, due_date, status, month, year,
        student:students(full_name, student_id, class:classes(name), section:sections(name),
          student_guardians(guardian:guardians(phone)))
      `)
      .eq('school_id', filter.school_id)
      .in('status', ['unpaid', 'partial', 'overdue'])
      .order('due_date', { ascending: true });

    if (error) throw error;

    const rows = (data || []).map((inv: any) => ({
      invoice: inv.invoice_number,
      student: inv.student?.full_name || '–',
      student_id: inv.student?.student_id || '–',
      class: `${inv.student?.class?.name || ''}-${inv.student?.section?.name || ''}`,
      phone: inv.student?.student_guardians?.[0]?.guardian?.phone || '–',
      total: formatCurrency(inv.total),
      paid: formatCurrency(inv.paid_amount),
      balance: formatCurrency(inv.balance),
      due_date: format(new Date(inv.due_date), 'dd/MM/yyyy'),
      status: inv.status.toUpperCase(),
    }));

    const totalOutstanding = (data || []).reduce((s: number, i: any) => s + Number(i.balance), 0);

    return {
      title: 'Outstanding Fees Report',
      generated_at: new Date().toISOString(),
      filters: {},
      columns: [
        { key: 'invoice', label: 'Invoice No.', width: 140 },
        { key: 'student', label: 'Student', width: 180 },
        { key: 'class', label: 'Class', width: 100 },
        { key: 'phone', label: 'Phone', width: 120 },
        { key: 'total', label: 'Total', width: 100, align: 'right' },
        { key: 'paid', label: 'Paid', width: 100, align: 'right' },
        { key: 'balance', label: 'Balance', width: 100, align: 'right' },
        { key: 'due_date', label: 'Due Date', width: 100 },
        { key: 'status', label: 'Status', width: 90, align: 'center' },
      ],
      rows,
      summary: {
        total_invoices: rows.length,
        total_outstanding: formatCurrency(totalOutstanding),
      },
    };
  },

  // ── Payroll Summary ───────────────────────────────────────

  async payrollSummaryReport(filter: ReportFilter): Promise<ReportResult> {
    const month = filter.month || new Date().getMonth() + 1;
    const year = filter.year || new Date().getFullYear();

    const { data, error } = await supabase
      .from('payroll')
      .select('*, staff:staff(full_name, staff_id, designation, department:departments(name))')
      .eq('school_id', filter.school_id)
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = (data || []).map((p: any) => ({
      staff_id: p.staff?.staff_id || '–',
      name: p.staff?.full_name || '–',
      designation: p.staff?.designation || '–',
      department: p.staff?.department?.name || '–',
      basic: formatCurrency(p.basic_salary),
      allowances: formatCurrency(p.house_allowance + p.medical_allowance + p.transport_allowance + p.other_allowance),
      gross: formatCurrency(p.gross_salary),
      deductions: formatCurrency(p.total_deduction),
      net: formatCurrency(p.net_salary),
      status: p.status.toUpperCase(),
    }));

    const totals = (data || []).reduce((acc: any, p: any) => ({
      gross: acc.gross + Number(p.gross_salary),
      net: acc.net + Number(p.net_salary),
      deductions: acc.deductions + Number(p.total_deduction),
    }), { gross: 0, net: 0, deductions: 0 });

    return {
      title: 'Payroll Summary Report',
      subtitle: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
      generated_at: new Date().toISOString(),
      filters: { month: String(month), year: String(year) },
      columns: [
        { key: 'name', label: 'Employee', width: 180 },
        { key: 'designation', label: 'Designation', width: 150 },
        { key: 'basic', label: 'Basic', width: 110, align: 'right' },
        { key: 'allowances', label: 'Allowances', width: 110, align: 'right' },
        { key: 'gross', label: 'Gross', width: 110, align: 'right' },
        { key: 'deductions', label: 'Deductions', width: 110, align: 'right' },
        { key: 'net', label: 'Net Salary', width: 110, align: 'right' },
        { key: 'status', label: 'Status', width: 90, align: 'center' },
      ],
      rows,
      summary: {
        total_employees: rows.length,
        total_gross: formatCurrency(totals.gross),
        total_net: formatCurrency(totals.net),
        total_deductions: formatCurrency(totals.deductions),
      },
    };
  },

  // ── Income vs Expense ─────────────────────────────────────

  async incomeExpenseReport(filter: ReportFilter): Promise<ReportResult> {
    const year = filter.year || new Date().getFullYear();

    const [{ data: payments }, { data: expenses }] = await Promise.all([
      supabase.from('payments').select('amount, payment_date, payment_method')
        .eq('school_id', filter.school_id)
        .gte('payment_date', `${year}-01-01`)
        .lte('payment_date', `${year}-12-31`),
      supabase.from('expenses').select('amount, expense_date, category')
        .eq('school_id', filter.school_id)
        .gte('expense_date', `${year}-01-01`)
        .lte('expense_date', `${year}-12-31`),
    ]);

    const months = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      const income = (payments || [])
        .filter((p: any) => p.payment_date?.startsWith(`${year}-${m}`))
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      const expense = (expenses || [])
        .filter((e: any) => e.expense_date?.startsWith(`${year}-${m}`))
        .reduce((s: number, e: any) => s + Number(e.amount), 0);

      return {
        month: new Date(year, i).toLocaleString('default', { month: 'long' }),
        income: formatCurrency(income),
        expenses: formatCurrency(expense),
        net: formatCurrency(income - expense),
        _income: income,
        _expense: expense,
      };
    });

    const totalIncome = months.reduce((s, m) => s + m._income, 0);
    const totalExpense = months.reduce((s, m) => s + m._expense, 0);

    return {
      title: 'Income & Expense Report',
      subtitle: `Year ${year}`,
      generated_at: new Date().toISOString(),
      filters: { year: String(year) },
      columns: [
        { key: 'month', label: 'Month', width: 100 },
        { key: 'income', label: 'Income', width: 130, align: 'right' },
        { key: 'expenses', label: 'Expenses', width: 130, align: 'right' },
        { key: 'net', label: 'Net', width: 130, align: 'right' },
      ],
      rows: months.map(m => ({ month: m.month, income: m.income, expenses: m.expenses, net: m.net })),
      summary: {
        total_income: formatCurrency(totalIncome),
        total_expenses: formatCurrency(totalExpense),
        net_surplus: formatCurrency(totalIncome - totalExpense),
      },
    };
  },

  // ── Export Helpers ────────────────────────────────────────

  resultToCSV(result: ReportResult): string {
    const header = result.columns.map(c => `"${c.label}"`).join(',');
    const rows = result.rows.map(row =>
      result.columns.map(col => `"${row[col.key] ?? ''}"`).join(',')
    );
    const footer = result.summary
      ? [Object.entries(result.summary).map(([k, v]) => `"${k}: ${v}"`).join(',')]
      : [];

    return [header, ...rows, '', ...footer].join('\n');
  },

  downloadCSV(result: ReportResult): void {
    const csv = this.resultToCSV(result);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Schedule Background Report ────────────────────────────

  async scheduleReport(
    schoolId: string,
    type: ReportType,
    filter: ReportFilter,
    email?: string
  ): Promise<void> {
    await supabase.from('job_queue').insert({
      school_id: schoolId,
      job_type: 'generate_report',
      payload: { type, filter, email },
      priority: 7,
      scheduled_at: new Date().toISOString(),
    });
  },
};
