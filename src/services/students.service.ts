import { createClient } from '@/lib/supabase/client';
import type { Student, StudentFormData, PaginatedResponse, QueryParams } from '@/types';

const supabase = createClient();

export const studentsService = {
  async getAll(schoolId: string, params: QueryParams = {}): Promise<PaginatedResponse<Student>> {
    const { page = 1, per_page = 20, search, sort_by = 'created_at', sort_order = 'desc', filters = {} } = params;
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let query = supabase
      .from('students')
      .select(`
        *,
        class:classes(id, name),
        section:sections(id, name),
        academic_year:academic_years(id, name)
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .is('deleted_at', null);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (filters.class_id) query = query.eq('class_id', filters.class_id);
    if (filters.section_id) query = query.eq('section_id', filters.section_id);
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
    if (filters.academic_year_id) query = query.eq('academic_year_id', filters.academic_year_id);

    query = query.order(sort_by, { ascending: sort_order === 'asc' }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Student[],
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };
  },

  async getById(id: string): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(*),
        section:sections(*),
        academic_year:academic_years(*),
        student_guardians(
          guardian:guardians(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Student;
  },

  async create(schoolId: string, formData: StudentFormData): Promise<Student> {
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        school_id: schoolId,
        student_id: formData.student_id,
        full_name: formData.full_name,
        full_name_bn: formData.full_name_bn,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        blood_group: formData.blood_group,
        religion: formData.religion,
        address: formData.address,
        district: formData.district,
        class_id: formData.class_id,
        section_id: formData.section_id,
        academic_year_id: formData.academic_year_id,
        admission_date: formData.admission_date,
      })
      .select()
      .single();

    if (error) throw error;

    // Create guardian
    const { data: guardian, error: gErr } = await supabase
      .from('guardians')
      .insert({
        school_id: schoolId,
        full_name: formData.guardian_name,
        phone: formData.guardian_phone,
        relation: formData.guardian_relation,
        is_primary: true,
      })
      .select()
      .single();

    if (gErr) throw gErr;

    // Link guardian to student
    await supabase.from('student_guardians').insert({
      student_id: student.id,
      guardian_id: guardian.id,
      is_primary: true,
    });

    return student as Student;
  },

  async update(id: string, data: Partial<Student>): Promise<Student> {
    const { data: updated, error } = await supabase
      .from('students')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated as Student;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async getStats(schoolId: string) {
    const { count: total } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .is('deleted_at', null);

    const { data: byClass } = await supabase
      .from('students')
      .select('class_id, classes(name)')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .is('deleted_at', null);

    return { total: total || 0, byClass: byClass || [] };
  },
};
