import { createClient } from '@/lib/supabase/client';
import type { DashboardStats } from '@/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const supabase = createClient();

export const dashboardService = {
  async getStats(schoolId: string): Promise<DashboardStats> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const [
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalStaff },
      { count: totalClasses },
      { data: attendanceToday },
      { data: monthlyPayments },
      { data: outstandingInvoices },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true).is('deleted_at', null),
      supabase.from('staff').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('role', 'teacher').eq('is_active', true),
      supabase.from('staff').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true),
      supabase.from('attendance').select('status')
        .eq('school_id', schoolId).eq('date', today),
      supabase.from('payments').select('amount')
        .eq('school_id', schoolId)
        .gte('payment_date', monthStart)
        .lte('payment_date', monthEnd),
      supabase.from('invoices').select('balance')
        .eq('school_id', schoolId)
        .in('status', ['unpaid', 'partial', 'overdue']),
    ]);

    const presentToday = attendanceToday?.filter((a) => a.status === 'present').length || 0;
    const attendanceRate = attendanceToday?.length
      ? Math.round((presentToday / attendanceToday.length) * 100)
      : 0;

    const monthlyRevenue = monthlyPayments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
    const pendingFees = outstandingInvoices?.reduce((s, i) => s + Number(i.balance), 0) || 0;

    return {
      total_students: totalStudents || 0,
      total_teachers: totalTeachers || 0,
      total_staff: totalStaff || 0,
      total_classes: totalClasses || 0,
      attendance_today: presentToday,
      attendance_rate: attendanceRate,
      monthly_revenue: monthlyRevenue,
      monthly_expenses: 0,
      pending_fees: pendingFees,
      overdue_invoices: outstandingInvoices?.filter((i) => i.balance > 0).length || 0,
    };
  },

  async getRecentPayments(schoolId: string, limit = 5) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, payment_method, payment_date, payment_number,
        student:students(full_name, student_id)
      `)
      .eq('school_id', schoolId)
      .order('payment_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getAttendanceTrend(schoolId: string, days = 7) {
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    const { data } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('school_id', schoolId)
      .in('date', dates);

    return dates.map((date) => {
      const records = data?.filter((r) => r.date === date) || [];
      const present = records.filter((r) => r.status === 'present').length;
      return {
        date,
        present,
        absent: records.filter((r) => r.status === 'absent').length,
        total: records.length,
        rate: records.length ? Math.round((present / records.length) * 100) : 0,
      };
    });
  },

  async getRevenueVsExpenses(schoolId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('school_id', schoolId)
      .gte('payment_date', `${year}-01-01`)
      .lte('payment_date', `${year}-12-31`);

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, expense_date')
      .eq('school_id', schoolId)
      .gte('expense_date', `${year}-01-01`)
      .lte('expense_date', `${year}-12-31`);

    return months.map((month) => {
      const monthStr = String(month).padStart(2, '0');
      const revenue = payments
        ?.filter((p) => p.payment_date.startsWith(`${year}-${monthStr}`))
        .reduce((s, p) => s + Number(p.amount), 0) || 0;
      const expense = expenses
        ?.filter((e) => e.expense_date.startsWith(`${year}-${monthStr}`))
        .reduce((s, e) => s + Number(e.amount), 0) || 0;

      return { month, revenue, expenses: expense, profit: revenue - expense };
    });
  },

  async getClassDistribution(schoolId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('class_id, classes(name)')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (error) throw error;

    const dist: Record<string, { name: string; count: number }> = {};
    for (const s of data || []) {
      const key = s.class_id || 'unknown';
      const className = (s.classes as unknown as { name: string })?.name || 'Unknown';
      if (!dist[key]) dist[key] = { name: className, count: 0 };
      dist[key].count++;
    }

    return Object.values(dist);
  },
};
