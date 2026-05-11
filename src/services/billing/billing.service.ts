import { createClient } from '@/lib/supabase/client';
import type { SaasInvoice, UsageMetrics, PlanFeature } from '@/types/phase2';
import type { Subscription, Plan } from '@/types';
import { generateId } from '@/utils';

const supabase = createClient();

// ============================================================
// PLAN FEATURE GATES
// ============================================================

export const PLAN_LIMITS: Record<string, Record<string, number | string | boolean>> = {
  free:         { max_students: 100,   max_teachers: 5,   max_branches: 1,  max_storage_gb: 1,  sms: false, custom_domain: false, api_access: false },
  starter:      { max_students: 500,   max_teachers: 25,  max_branches: 1,  max_storage_gb: 5,  sms: false, custom_domain: false, api_access: false },
  professional: { max_students: 2000,  max_teachers: 100, max_branches: 3,  max_storage_gb: 20, sms: true,  custom_domain: false, api_access: false },
  enterprise:   { max_students: -1,    max_teachers: -1,  max_branches: -1, max_storage_gb: 100,sms: true,  custom_domain: true,  api_access: true  },
};

export const PLAN_PRICES_BDT = {
  free:         { monthly: 0,    yearly: 0     },
  starter:      { monthly: 999,  yearly: 9990  },
  professional: { monthly: 2499, yearly: 24990 },
  enterprise:   { monthly: 5999, yearly: 59990 },
};

// ============================================================
// BILLING SERVICE
// ============================================================

export const billingService = {

  // ── Subscriptions ─────────────────────────────────────────

  async getSubscription(schoolId: string): Promise<Subscription & { plan: Plan } | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as (Subscription & { plan: Plan }) | null;
  },

  async upgradePlan(
    schoolId: string,
    newPlan: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<Subscription> {
    // Deactivate current subscription
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Get plan
    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('name', newPlan)
      .single();

    if (!plan) throw new Error('Plan not found');

    const prices = PLAN_PRICES_BDT[newPlan as keyof typeof PLAN_PRICES_BDT];
    const amount = billingCycle === 'yearly' ? prices.yearly : prices.monthly;
    const expires = new Date();
    if (billingCycle === 'yearly') expires.setFullYear(expires.getFullYear() + 1);
    else expires.setMonth(expires.getMonth() + 1);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        school_id: schoolId,
        plan_id: plan.id,
        status: 'active',
        billing_cycle: billingCycle,
        amount_paid: amount,
        expires_at: expires.toISOString(),
        auto_renew: true,
      })
      .select()
      .single();

    if (error) throw error;
    return subscription as Subscription;
  },

  // ── Invoices ──────────────────────────────────────────────

  async generateSaasInvoice(
    schoolId: string,
    subscriptionId: string,
    amount: number,
    periodStart: string,
    periodEnd: string
  ): Promise<SaasInvoice> {
    const invoiceNumber = `SINV-${generateId()}`;
    const due = new Date();
    due.setDate(due.getDate() + 7);

    const { data, error } = await supabase
      .from('saas_invoices')
      .insert({
        school_id: schoolId,
        subscription_id: subscriptionId,
        invoice_number: invoiceNumber,
        source: 'subscription',
        amount,
        tax_amount: 0,
        total_amount: amount,
        currency: 'BDT',
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        due_date: due.toISOString().split('T')[0],
        status: 'unpaid',
      })
      .select()
      .single();

    if (error) throw error;
    return data as SaasInvoice;
  },

  async getSaasInvoices(schoolId: string, page = 1, perPage = 20) {
    const from = (page - 1) * perPage;
    const { data, error, count } = await supabase
      .from('saas_invoices')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;
    return { data: data as SaasInvoice[], count: count || 0 };
  },

  // ── Feature Gating ────────────────────────────────────────

  async checkFeatureAccess(schoolId: string, feature: string): Promise<boolean> {
    const sub = await this.getSubscription(schoolId);
    if (!sub) return false;

    const planName = sub.plan?.name;
    if (!planName) return false;

    const limits = PLAN_LIMITS[planName];
    if (!limits) return false;

    const value = limits[feature];
    if (value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (value === -1) return true; // unlimited
    return true;
  },

  async checkStudentLimit(schoolId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const sub = await this.getSubscription(schoolId);
    const planName = sub?.plan?.name || 'free';
    const limit = Number(PLAN_LIMITS[planName]?.max_students ?? 100);

    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .is('deleted_at', null);

    const current = count || 0;
    return {
      allowed: limit === -1 || current < limit,
      current,
      limit,
    };
  },

  // ── Usage Tracking ────────────────────────────────────────

  async syncUsageMetrics(schoolId: string): Promise<UsageMetrics> {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: students },
      { count: staff },
      { count: branches },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true).is('deleted_at', null),
      supabase.from('staff').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('is_active', true),
      supabase.from('branches').select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId).eq('status', 'active'),
    ]);

    const { data, error } = await supabase
      .from('usage_metrics')
      .upsert({
        school_id: schoolId,
        metric_date: today,
        active_students: students || 0,
        active_staff: staff || 0,
        total_branches: branches || 0,
      }, { onConflict: 'school_id,metric_date' })
      .select()
      .single();

    if (error) throw error;
    return data as UsageMetrics;
  },

  async getUsageHistory(schoolId: string, days = 30): Promise<UsageMetrics[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('school_id', schoolId)
      .gte('metric_date', since.toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (error) throw error;
    return data as UsageMetrics[];
  },

  // ── Super Admin: Platform Revenue ────────────────────────

  async getPlatformRevenue(year: number) {
    const { data, error } = await supabase
      .from('saas_invoices')
      .select('total_amount, paid_at, billing_period_start')
      .eq('status', 'paid')
      .gte('paid_at', `${year}-01-01`)
      .lte('paid_at', `${year}-12-31`);

    if (error) throw error;

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      invoice_count: 0,
    }));

    for (const inv of (data || [])) {
      const m = new Date(inv.paid_at!).getMonth();
      monthly[m].revenue += Number(inv.total_amount);
      monthly[m].invoice_count++;
    }

    return monthly;
  },

  async getSchoolsByPlan() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan:plans(name), school_id')
      .eq('status', 'active');

    if (error) throw error;

    const dist: Record<string, number> = { free: 0, starter: 0, professional: 0, enterprise: 0 };
    for (const sub of (data || [])) {
      const planName = (sub.plan as any)?.name;
      if (planName && dist[planName] !== undefined) dist[planName]++;
    }
    return dist;
  },
};
