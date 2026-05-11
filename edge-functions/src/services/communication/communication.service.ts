import { createClient } from '@/lib/supabase/client';
import type { MessageCampaign, MessageTemplate, MessageChannel, MessageLog } from '@/types/phase2';

const supabase = createClient();

// ============================================================
// PROVIDER CONFIGS
// ============================================================

export const SMS_PROVIDERS = {
  ssl_wireless: {
    name: 'SSL Wireless',
    baseUrl: 'https://sms.sslwireless.com/pushapi/dynamic/server.php',
    charset: 'utf-8',
  },
  twilio: {
    name: 'Twilio',
    baseUrl: 'https://api.twilio.com/2010-04-01',
  },
} as const;

export const PUSH_PROVIDERS = {
  fcm: { name: 'Firebase Cloud Messaging' },
  onesignal: { name: 'OneSignal' },
} as const;

// ============================================================
// COMMUNICATION SERVICE
// ============================================================

export const communicationService = {

  // ── Templates ────────────────────────────────────────────

  async getTemplates(schoolId: string, channel?: MessageChannel): Promise<MessageTemplate[]> {
    let query = supabase
      .from('message_templates')
      .select('*')
      .or(`school_id.eq.${schoolId},school_id.is.null`)
      .eq('is_active', true)
      .order('name');

    if (channel) query = query.eq('channel', channel);

    const { data, error } = await query;
    if (error) throw error;
    return data as MessageTemplate[];
  },

  interpolateTemplate(body: string, vars: Record<string, string>): string {
    return body.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
  },

  // ── Campaigns ────────────────────────────────────────────

  async getCampaigns(schoolId: string, page = 1, perPage = 20) {
    const from = (page - 1) * perPage;
    const { data, error, count } = await supabase
      .from('message_campaigns')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;
    return { data: data as MessageCampaign[], count: count || 0 };
  },

  async createCampaign(
    schoolId: string,
    payload: Omit<MessageCampaign, 'id' | 'school_id' | 'created_at' | 'sent_at' | 'sent_count' | 'delivered_count' | 'failed_count'>,
    createdBy: string
  ): Promise<MessageCampaign> {
    const { data, error } = await supabase
      .from('message_campaigns')
      .insert({ ...payload, school_id: schoolId, created_by: createdBy })
      .select()
      .single();

    if (error) throw error;
    return data as MessageCampaign;
  },

  async sendCampaign(campaignId: string, schoolId: string): Promise<void> {
    // Enqueue job for background processing
    await supabase.from('job_queue').insert({
      school_id: schoolId,
      job_type: 'send_sms',
      payload: { campaign_id: campaignId },
      priority: 3,
      scheduled_at: new Date().toISOString(),
    });

    await supabase
      .from('message_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);
  },

  // ── Quick send (single message) ──────────────────────────

  async sendQuickSMS(
    schoolId: string,
    recipientIds: string[],
    body: string,
    templateVars: Record<string, string> = {}
  ): Promise<void> {
    const resolvedBody = this.interpolateTemplate(body, templateVars);

    // Fetch recipient phone numbers
    const { data: users } = await supabase
      .from('users')
      .select('id, phone')
      .in('id', recipientIds)
      .not('phone', 'is', null);

    const logs = (users || []).map(u => ({
      school_id: schoolId,
      channel: 'sms' as MessageChannel,
      recipient_id: u.id,
      recipient_contact: u.phone,
      body: resolvedBody,
      status: 'queued' as const,
    }));

    if (logs.length > 0) {
      await supabase.from('message_logs').insert(logs);
    }
  },

  async sendAttendanceAlert(
    schoolId: string,
    absentStudentIds: string[],
    date: string
  ): Promise<void> {
    // Get guardians of absent students
    const { data: studentGuardians } = await supabase
      .from('student_guardians')
      .select(`
        guardian:guardians(id, phone, full_name),
        student:students(full_name, class:classes(name), section:sections(name))
      `)
      .in('student_id', absentStudentIds);

    const logs = (studentGuardians || []).map((sg: any) => ({
      school_id: schoolId,
      channel: 'sms' as MessageChannel,
      recipient_id: sg.guardian.id,
      recipient_contact: sg.guardian.phone,
      body: `Dear ${sg.guardian.full_name}, your child ${sg.student.full_name} (${sg.student.class?.name}-${sg.student.section?.name}) was absent on ${date}. Shiksha ERP`,
      status: 'queued' as const,
    }));

    if (logs.length > 0) {
      await supabase.from('message_logs').insert(logs);
      // Enqueue SMS job
      await supabase.from('job_queue').insert({
        school_id: schoolId,
        job_type: 'send_sms',
        payload: { log_ids: logs.map((_: any, i: number) => i) },
        priority: 2,
        scheduled_at: new Date().toISOString(),
      });
    }
  },

  async sendFeeReminder(schoolId: string, invoiceIds: string[]): Promise<void> {
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, balance, due_date,
        student:students(
          full_name,
          student_guardians(guardian:guardians(phone, full_name))
        )
      `)
      .in('id', invoiceIds)
      .in('status', ['unpaid', 'partial', 'overdue']);

    for (const inv of (invoices || [])) {
      const student = (inv.student as any);
      const guardian = student?.student_guardians?.[0]?.guardian;
      if (!guardian?.phone) continue;

      await supabase.from('message_logs').insert({
        school_id: schoolId,
        channel: 'sms',
        recipient_id: guardian.id || 'unknown',
        recipient_contact: guardian.phone,
        body: `Dear ${guardian.full_name}, ৳${inv.balance} is due for ${student.full_name} (Invoice: ${inv.invoice_number}). Due date: ${inv.due_date}. Please pay to avoid late fees. Shiksha ERP`,
        status: 'queued',
      });
    }
  },

  // ── Logs ─────────────────────────────────────────────────

  async getLogs(schoolId: string, page = 1, perPage = 50) {
    const from = (page - 1) * perPage;
    const { data, error, count } = await supabase
      .from('message_logs')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;
    return { data: data as MessageLog[], count: count || 0 };
  },

  async getDeliveryStats(schoolId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('message_logs')
      .select('channel, status')
      .eq('school_id', schoolId)
      .gte('created_at', since.toISOString());

    const stats: Record<string, Record<string, number>> = {};
    for (const log of (data || [])) {
      if (!stats[log.channel]) stats[log.channel] = { sent: 0, delivered: 0, failed: 0, total: 0 };
      stats[log.channel].total++;
      if (['sent', 'delivered'].includes(log.status)) stats[log.channel].sent++;
      if (log.status === 'delivered') stats[log.channel].delivered++;
      if (log.status === 'failed') stats[log.channel].failed++;
    }
    return stats;
  },
};
