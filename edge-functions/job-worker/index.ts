// ============================================================
// Supabase Edge Function: Job Worker
// Deploy: supabase functions deploy job-worker
// Trigger: Supabase cron every 30 seconds OR webhook
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const WORKER_ID = `edge-${crypto.randomUUID().slice(0, 8)}`;

Deno.serve(async (req) => {
  // Validate secret
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let processed = 0;
  let failed = 0;

  // Process up to 10 jobs per invocation
  for (let i = 0; i < 10; i++) {
    const claimed = await claimAndProcessJob();
    if (!claimed) break;
    if (claimed === 'ok') processed++;
    if (claimed === 'error') failed++;
  }

  return Response.json({
    worker_id: WORKER_ID,
    processed,
    failed,
    timestamp: new Date().toISOString(),
  });
});

async function claimAndProcessJob(): Promise<'ok' | 'error' | null> {
  // Atomically claim next pending job
  const { data: jobs } = await supabase
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const job = jobs?.[0];
  if (!job) return null;

  // Mark as running
  const { error: claimError } = await supabase
    .from('job_queue')
    .update({ status: 'running', started_at: new Date().toISOString(), worker_id: WORKER_ID })
    .eq('id', job.id)
    .eq('status', 'pending'); // Optimistic lock

  if (claimError) return null; // Another worker claimed it

  try {
    await executeJob(job);
    await supabase.from('job_queue').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', job.id);
    return 'ok';
  } catch (err) {
    const isMaxRetries = job.retry_count >= job.max_retries;
    const backoffMs = Math.min(60000 * Math.pow(2, job.retry_count), 3600000); // Exponential, max 1hr

    await supabase.from('job_queue').update({
      status: isMaxRetries ? 'failed' : 'retrying',
      retry_count: job.retry_count + 1,
      failed_at: isMaxRetries ? new Date().toISOString() : null,
      scheduled_at: isMaxRetries ? null : new Date(Date.now() + backoffMs).toISOString(),
      error_message: err instanceof Error ? err.message : String(err),
      worker_id: null,
    }).eq('id', job.id);
    return 'error';
  }
}

async function executeJob(job: Record<string, any>) {
  const { job_type, payload, school_id } = job;

  switch (job_type) {
    case 'send_sms':
      await processSMSBatch(school_id, payload);
      break;

    case 'send_email':
      await processEmailBatch(school_id, payload);
      break;

    case 'compute_analytics':
      await computeAnalytics(school_id, payload);
      break;

    case 'generate_invoice':
      await generateMonthlyInvoices(school_id, payload);
      break;

    case 'sync_usage_metrics':
      await syncUsageMetrics(school_id);
      break;

    case 'compute_payroll':
      await computePayroll(school_id, payload);
      break;

    default:
      throw new Error(`Unknown job_type: ${job_type}`);
  }
}

// ── SMS Processing ─────────────────────────────────────────

async function processSMSBatch(schoolId: string, payload: Record<string, any>) {
  const { campaign_id } = payload;

  const { data: logs } = await supabase
    .from('message_logs')
    .select('id, recipient_contact, body')
    .eq('school_id', schoolId)
    .eq('campaign_id', campaign_id)
    .eq('status', 'queued')
    .limit(50); // Process 50 at a time

  const smsApiKey = Deno.env.get('SMS_API_KEY');
  const smsSenderId = Deno.env.get('SMS_SENDER_ID') || 'SHIKSHA';

  for (const log of (logs || [])) {
    try {
      // SSL Wireless SMS API
      const response = await fetch('https://sms.sslwireless.com/pushapi/dynamic/server.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_token: smsApiKey || '',
          sid: smsSenderId,
          sms: log.body,
          msisdn: log.recipient_contact.replace(/^\+880/, '0').replace(/[^0-9]/g, ''),
          csms_id: log.id,
        }),
      });

      const result = await response.text();
      const delivered = result.includes('success') || response.ok;

      await supabase.from('message_logs').update({
        status: delivered ? 'sent' : 'failed',
        sent_at: delivered ? new Date().toISOString() : null,
        failed_at: delivered ? null : new Date().toISOString(),
        provider_response: { raw: result },
      }).eq('id', log.id);
    } catch (err) {
      await supabase.from('message_logs').update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'SMS send failed',
      }).eq('id', log.id);
    }

    // Rate limiting: 10 SMS per second
    await new Promise(r => setTimeout(r, 100));
  }

  // Update campaign stats
  const { count: sent } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign_id)
    .eq('status', 'sent');

  const { count: failedCount } = await supabase
    .from('message_logs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign_id)
    .eq('status', 'failed');

  await supabase.from('message_campaigns').update({
    sent_count: sent || 0,
    failed_count: failedCount || 0,
    status: 'sent',
    sent_at: new Date().toISOString(),
  }).eq('id', campaign_id);
}

// ── Email Processing ───────────────────────────────────────

async function processEmailBatch(schoolId: string, payload: Record<string, any>) {
  const { campaign_id } = payload;

  const { data: logs } = await supabase
    .from('message_logs')
    .select('id, recipient_contact, subject, body')
    .eq('school_id', schoolId)
    .eq('campaign_id', campaign_id)
    .eq('status', 'queued')
    .eq('channel', 'email')
    .limit(100);

  const resendKey = Deno.env.get('RESEND_API_KEY');

  for (const log of (logs || [])) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Shiksha ERP <noreply@shiksha-erp.com>',
          to: [log.recipient_contact],
          subject: log.subject || 'Notification from your school',
          html: log.body,
        }),
      });

      const result = await response.json();
      await supabase.from('message_logs').update({
        status: response.ok ? 'sent' : 'failed',
        provider_message_id: result.id,
        sent_at: response.ok ? new Date().toISOString() : null,
      }).eq('id', log.id);
    } catch (err) {
      await supabase.from('message_logs').update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Email send failed',
      }).eq('id', log.id);
    }

    await new Promise(r => setTimeout(r, 50)); // Rate limit
  }
}

// ── Analytics Computation ──────────────────────────────────

async function computeAnalytics(schoolId: string, payload: Record<string, any>) {
  const date = payload.date || new Date().toISOString().split('T')[0];

  // Daily snapshot
  await supabase.rpc('compute_daily_snapshot', {
    p_school_id: schoolId,
    p_date: date,
  });

  // Update usage metrics
  await syncUsageMetrics(schoolId);
}

// ── Invoice Generation ─────────────────────────────────────

async function generateMonthlyInvoices(schoolId: string, payload: Record<string, any>) {
  const { month, year } = payload;

  const { data: students } = await supabase
    .from('students')
    .select('id, class_id')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (!students?.length) return;

  const dueDate = new Date(year, month - 1, 10).toISOString().split('T')[0];

  for (const student of students) {
    // Check if invoice already exists
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id)
      .eq('month', month)
      .eq('year', year);

    if ((count || 0) > 0) continue;

    // Get applicable fee structures
    const { data: feeStructures } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_mandatory', true)
      .eq('is_active', true)
      .eq('frequency', 'monthly')
      .or(`class_id.is.null,class_id.eq.${student.class_id}`);

    const subtotal = (feeStructures || []).reduce((s: number, fs: any) => s + Number(fs.amount), 0);
    const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${student.id.slice(0, 8).toUpperCase()}`;

    await supabase.from('invoices').insert({
      school_id: schoolId,
      student_id: student.id,
      invoice_number: invoiceNumber,
      month,
      year,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      subtotal,
      discount: 0,
      total: subtotal,
      paid_amount: 0,
      status: 'unpaid',
    });
  }
}

// ── Usage Metrics ──────────────────────────────────────────

async function syncUsageMetrics(schoolId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [{ count: students }, { count: staff }, { count: branches }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId).eq('is_active', true).is('deleted_at', null),
    supabase.from('staff').select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId).eq('is_active', true),
    supabase.from('branches').select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId).eq('status', 'active'),
  ]);

  await supabase.from('usage_metrics').upsert({
    school_id: schoolId,
    metric_date: today,
    active_students: students || 0,
    active_staff: staff || 0,
    total_branches: branches || 0,
  }, { onConflict: 'school_id,metric_date' });
}

// ── Payroll Computation ────────────────────────────────────

async function computePayroll(schoolId: string, payload: Record<string, any>) {
  const { month, year } = payload;

  const { data: staffList } = await supabase
    .from('staff')
    .select('id, salary')
    .eq('school_id', schoolId)
    .eq('is_active', true);

  for (const member of (staffList || [])) {
    const { count } = await supabase
      .from('payroll')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('staff_id', member.id)
      .eq('month', month)
      .eq('year', year);

    if ((count || 0) > 0) continue;

    const basicSalary = Number(member.salary) || 0;
    const houseAllowance = basicSalary * 0.2;
    const medicalAllowance = 1500;
    const transportAllowance = 1000;

    await supabase.from('payroll').insert({
      school_id: schoolId,
      staff_id: member.id,
      month,
      year,
      basic_salary: basicSalary,
      house_allowance: houseAllowance,
      medical_allowance: medicalAllowance,
      transport_allowance: transportAllowance,
      other_allowance: 0,
      tax_deduction: 0,
      provident_fund: basicSalary * 0.05,
      other_deduction: 0,
      working_days: 26,
      status: 'pending',
    });
  }
}
