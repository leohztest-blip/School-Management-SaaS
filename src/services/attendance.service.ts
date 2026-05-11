import { createClient } from '@/lib/supabase/client';
import type { Attendance, AttendanceStatus, AttendanceSummary } from '@/types';
import { format } from 'date-fns';

const supabase = createClient();

export const attendanceService = {
  async getByDate(schoolId: string, date: string, sectionId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`*, student:students(id, full_name, student_id, photo_url, roll_number)`)
      .eq('school_id', schoolId)
      .eq('date', date)
      .eq('section_id', sectionId);

    if (error) throw error;
    return data as Attendance[];
  },

  async markBulk(
    schoolId: string,
    sectionId: string,
    classId: string,
    date: string,
    records: { student_id: string; status: AttendanceStatus; remarks?: string }[],
    markedBy: string
  ): Promise<void> {
    const upsertData = records.map((r) => ({
      school_id: schoolId,
      student_id: r.student_id,
      class_id: classId,
      section_id: sectionId,
      date,
      status: r.status,
      remarks: r.remarks,
      marked_by: markedBy,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(upsertData, { onConflict: 'school_id,student_id,date' });

    if (error) throw error;
  },

  async getSummary(schoolId: string, startDate: string, endDate: string): Promise<AttendanceSummary[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('school_id', schoolId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const grouped: Record<string, AttendanceSummary> = {};
    for (const row of data || []) {
      if (!grouped[row.date]) {
        grouped[row.date] = { date: row.date, present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0 };
      }
      grouped[row.date].total++;
      grouped[row.date][row.status as AttendanceStatus]++;
    }

    return Object.values(grouped).map((s) => ({
      ...s,
      rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));
  },

  async getStudentSummary(studentId: string, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: data?.length || 0 };
    for (const row of data || []) {
      summary[row.status as keyof typeof summary]++;
    }

    return {
      ...summary,
      rate: summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0,
    };
  },

  async getTodaySummary(schoolId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('school_id', schoolId)
      .eq('date', today);

    if (error) throw error;
    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: data?.length || 0 };
    for (const row of data || []) {
      summary[row.status as keyof typeof summary]++;
    }
    return summary;
  },
};
