import { createClient } from '@/lib/supabase/client';
import type { Invoice, Payment, FeeStructure, PaginatedResponse, QueryParams } from '@/types';
import { generateId } from '@/utils';

const supabase = createClient();

export const feesService = {
  // Fee Structures
  async getFeeStructures(schoolId: string): Promise<FeeStructure[]> {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*, class:classes(id, name)')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as FeeStructure[];
  },

  async createFeeStructure(schoolId: string, data: Omit<FeeStructure, 'id' | 'school_id' | 'created_at' | 'updated_at'>): Promise<FeeStructure> {
    const { data: result, error } = await supabase
      .from('fee_structures')
      .insert({ ...data, school_id: schoolId })
      .select()
      .single();

    if (error) throw error;
    return result as FeeStructure;
  },

  // Invoices
  async getInvoices(schoolId: string, params: QueryParams = {}): Promise<PaginatedResponse<Invoice>> {
    const { page = 1, per_page = 20, search, filters = {} } = params;
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let query = supabase
      .from('invoices')
      .select(`
        *,
        student:students(id, full_name, student_id, class:classes(name), section:sections(name))
      `, { count: 'exact' })
      .eq('school_id', schoolId);

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%`);
    }
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.student_id) query = query.eq('student_id', filters.student_id);
    if (filters.month) query = query.eq('month', filters.month);
    if (filters.year) query = query.eq('year', filters.year);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Invoice[],
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        student:students(*, class:classes(name), section:sections(name)),
        items:invoice_items(*),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice;
  },

  async generateInvoice(
    schoolId: string,
    studentId: string,
    feeStructureIds: string[],
    dueDate: string,
    discount = 0,
    generatedBy?: string
  ): Promise<Invoice> {
    // Fetch fee structures
    const { data: feeStructures, error: fsError } = await supabase
      .from('fee_structures')
      .select('*')
      .in('id', feeStructureIds);

    if (fsError) throw fsError;

    const subtotal = feeStructures?.reduce((sum, fs) => sum + Number(fs.amount), 0) || 0;
    const total = subtotal - discount;
    const invoiceNumber = `INV-${generateId()}`;
    const now = new Date();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        invoice_number: invoiceNumber,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        issue_date: now.toISOString().split('T')[0],
        due_date: dueDate,
        subtotal,
        discount,
        total,
        paid_amount: 0,
        status: 'unpaid',
        generated_by: generatedBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Create invoice items
    const items = (feeStructures || []).map((fs) => ({
      invoice_id: invoice.id,
      fee_structure_id: fs.id,
      description: fs.name,
      type: fs.type,
      amount: Number(fs.amount),
      discount: 0,
    }));

    await supabase.from('invoice_items').insert(items);

    return invoice as Invoice;
  },

  // Payments
  async recordPayment(
    schoolId: string,
    invoiceId: string,
    studentId: string,
    amount: number,
    method: string,
    collectedBy?: string,
    transactionId?: string
  ): Promise<Payment> {
    const paymentNumber = `PAY-${generateId()}`;

    const { data, error } = await supabase
      .from('payments')
      .insert({
        school_id: schoolId,
        invoice_id: invoiceId,
        student_id: studentId,
        payment_number: paymentNumber,
        amount,
        payment_method: method,
        payment_date: new Date().toISOString(),
        transaction_id: transactionId,
        collected_by: collectedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async getRevenueStats(schoolId: string, year: number) {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('school_id', schoolId)
      .gte('payment_date', `${year}-01-01`)
      .lte('payment_date', `${year}-12-31`);

    if (error) throw error;

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));

    for (const payment of data || []) {
      const month = new Date(payment.payment_date).getMonth();
      monthly[month].revenue += Number(payment.amount);
    }

    return monthly;
  },

  async getOutstandingFees(schoolId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('balance, status')
      .eq('school_id', schoolId)
      .in('status', ['unpaid', 'partial', 'overdue']);

    if (error) throw error;

    return {
      total: data?.reduce((sum, inv) => sum + Number(inv.balance), 0) || 0,
      count: data?.length || 0,
      overdue: data?.filter((i) => i.status === 'overdue').length || 0,
    };
  },
};
