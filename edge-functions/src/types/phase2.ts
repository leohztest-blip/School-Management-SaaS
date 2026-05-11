// ============================================================
// SHIKSHA ERP — PHASE 2 TYPES
// Enterprise multi-branch, HR, library, transport, billing
// ============================================================

import type { School, Staff, Student, UserRole } from './index';

// ============================================================
// BRANCH TYPES
// ============================================================

export type BranchStatus = 'active' | 'inactive' | 'setup' | 'suspended';

export interface Branch {
  id: string;
  school_id: string;
  name: string;
  code: string;
  status: BranchStatus;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  principal_id?: string;
  established_date?: string;
  max_students?: number;
  logo_url?: string;
  settings: Record<string, unknown>;
  is_headquarters: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  // relations
  principal?: Staff;
  student_count?: number;
  staff_count?: number;
}

// ============================================================
// HR TYPES
// ============================================================

export interface Department {
  id: string;
  school_id: string;
  branch_id?: string;
  name: string;
  head_staff_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  head_staff?: Staff;
  staff_count?: number;
}

export interface Position {
  id: string;
  school_id: string;
  department_id?: string;
  title: string;
  grade?: string;
  min_salary?: number;
  max_salary?: number;
  is_teaching: boolean;
  description?: string;
  created_at: string;
  department?: Department;
}

export interface StaffEmploymentHistory {
  id: string;
  staff_id: string;
  school_id: string;
  branch_id?: string;
  department_id?: string;
  position_id?: string;
  start_date: string;
  end_date?: string;
  salary: number;
  reason_for_change?: string;
  approved_by?: string;
  created_at: string;
}

// ============================================================
// LEAVE TYPES
// ============================================================

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'withdrawn';
export type LeaveType = 'casual' | 'sick' | 'annual' | 'maternity' | 'paternity' | 'unpaid' | 'compensatory' | 'emergency';

export interface LeavePolicy {
  id: string;
  school_id: string;
  leave_type: LeaveType;
  days_allowed: number;
  carry_forward: boolean;
  max_carry_forward?: number;
  applicable_to: string;
  requires_document: boolean;
  min_notice_days: number;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  school_id: string;
  staff_id: string;
  leave_type: LeaveType;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
  carried_forward: number;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  school_id: string;
  staff_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  half_day: boolean;
  reason: string;
  status: LeaveStatus;
  substitute_staff_id?: string;
  document_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
  // relations
  staff?: Staff;
  substitute_staff?: Staff;
  reviewer?: Staff;
}

// ============================================================
// LIBRARY TYPES
// ============================================================

export type BookStatus = 'available' | 'issued' | 'reserved' | 'lost' | 'damaged' | 'maintenance';

export interface LibraryCategory {
  id: string;
  school_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export interface Book {
  id: string;
  school_id: string;
  branch_id?: string;
  category_id?: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  year_published?: number;
  language: string;
  total_copies: number;
  available_copies: number;
  rack_number?: string;
  cover_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  category?: LibraryCategory;
}

export interface BookIssue {
  id: string;
  school_id: string;
  book_id: string;
  borrower_type: 'student' | 'staff';
  borrower_id: string;
  issued_date: string;
  due_date: string;
  returned_date?: string;
  fine_amount: number;
  fine_paid: boolean;
  status: BookStatus;
  issued_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  book?: Book;
}

// ============================================================
// TRANSPORT TYPES
// ============================================================

export type VehicleStatus = 'active' | 'maintenance' | 'retired';

export interface TransportRoute {
  id: string;
  school_id: string;
  branch_id?: string;
  name: string;
  description?: string;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
  stops?: TransportStop[];
  student_count?: number;
}

export interface TransportStop {
  id: string;
  route_id: string;
  name: string;
  stop_order: number;
  pickup_time?: string;
  drop_time?: string;
  landmark?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  school_id: string;
  registration_number: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  route_id?: string;
  driver_staff_id?: string;
  helper_staff_id?: string;
  insurance_expiry?: string;
  fitness_expiry?: string;
  status: VehicleStatus;
  current_mileage: number;
  gps_device_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  route?: TransportRoute;
  driver?: Staff;
}

// ============================================================
// HOSTEL TYPES
// ============================================================

export type HostelRoomType = 'single' | 'double' | 'triple' | 'dormitory';
export type HostelRoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Hostel {
  id: string;
  school_id: string;
  branch_id?: string;
  name: string;
  gender: 'male' | 'female' | 'mixed';
  warden_id?: string;
  address?: string;
  capacity: number;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
  warden?: Staff;
  rooms?: HostelRoom[];
  occupancy_count?: number;
}

export interface HostelRoom {
  id: string;
  hostel_id: string;
  room_number: string;
  floor?: number;
  type: HostelRoomType;
  capacity: number;
  current_occupancy: number;
  monthly_fee?: number;
  amenities: string[];
  status: HostelRoomStatus;
  created_at: string;
}

export interface HostelAllocation {
  id: string;
  school_id: string;
  hostel_id: string;
  room_id: string;
  student_id: string;
  academic_year_id: string;
  check_in_date: string;
  check_out_date?: string;
  monthly_fee: number;
  status: string;
  notes?: string;
  created_at: string;
  student?: Student;
  room?: HostelRoom;
  hostel?: Hostel;
}

// ============================================================
// ONLINE ADMISSION TYPES
// ============================================================

export type AdmissionStatus = 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'admitted' | 'rejected' | 'waitlisted';

export interface AdmissionForm {
  id: string;
  school_id: string;
  branch_id?: string;
  academic_year_id: string;
  class_id: string;
  form_number: string;
  applicant_name: string;
  applicant_name_bn?: string;
  date_of_birth?: string;
  gender?: string;
  previous_school?: string;
  previous_class?: string;
  previous_gpa?: number;
  father_name?: string;
  mother_name?: string;
  guardian_phone: string;
  guardian_email?: string;
  address?: string;
  district?: string;
  photo_url?: string;
  documents_urls: string[];
  additional_info: Record<string, unknown>;
  status: AdmissionStatus;
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  converted_student_id?: string;
  admission_fee_paid: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// ONLINE EXAM TYPES
// ============================================================

export type OnlineExamStatus = 'draft' | 'published' | 'active' | 'ended' | 'graded';
export type QuestionType = 'mcq' | 'true_false' | 'short' | 'essay';

export interface QuestionOption {
  id: string;
  text: string;
  image_url?: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_number: number;
  question_text: string;
  question_image_url?: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  correct_answer: string | string[];
  explanation?: string;
  marks: number;
  negative_marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface OnlineExam {
  id: string;
  school_id: string;
  exam_id?: string;
  subject_id: string;
  class_id: string;
  section_ids?: string[];
  title: string;
  instructions?: string;
  total_marks: number;
  pass_marks: number;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: OnlineExamStatus;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_result_immediately: boolean;
  max_attempts: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  questions?: ExamQuestion[];
  attempt_count?: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  attempt_number: number;
  started_at: string;
  submitted_at?: string;
  time_taken_seconds?: number;
  answers: Record<string, string | string[]>;
  marks_obtained?: number;
  percentage?: number;
  is_passed?: boolean;
  status: 'in_progress' | 'submitted' | 'graded' | 'timed_out';
  created_at: string;
  student?: Student;
}

// ============================================================
// ASSIGNMENT TYPES
// ============================================================

export type AssignmentStatus = 'draft' | 'published' | 'submitted' | 'graded' | 'overdue';

export interface Assignment {
  id: string;
  school_id: string;
  subject_id: string;
  class_id: string;
  section_id?: string;
  created_by: string;
  title: string;
  description?: string;
  attachment_urls: string[];
  assigned_date: string;
  due_date: string;
  max_marks?: number;
  status: AssignmentStatus;
  submission_type: 'file' | 'text' | 'url';
  allow_late_submission: boolean;
  created_at: string;
  updated_at: string;
  submission_count?: number;
  graded_count?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  attachment_urls: string[];
  submitted_at: string;
  is_late: boolean;
  marks_obtained?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: 'submitted' | 'graded' | 'returned';
  student?: Student;
}

// ============================================================
// COMMUNICATION TYPES
// ============================================================

export type MessageChannel = 'sms' | 'email' | 'push' | 'whatsapp' | 'in_app';
export type MessageStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface MessageTemplate {
  id: string;
  school_id?: string;
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  variables: { name: string; description: string }[];
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface MessageCampaign {
  id: string;
  school_id: string;
  name: string;
  channel: MessageChannel;
  template_id?: string;
  subject?: string;
  body: string;
  recipient_type: string;
  recipient_filter: Record<string, unknown>;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  created_by?: string;
  created_at: string;
}

export interface MessageLog {
  id: string;
  school_id: string;
  campaign_id?: string;
  channel: MessageChannel;
  recipient_id: string;
  recipient_contact: string;
  subject?: string;
  body: string;
  status: MessageStatus;
  provider_message_id?: string;
  cost: number;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  created_at: string;
}

// ============================================================
// ACCOUNTING TYPES
// ============================================================

export type LedgerType = 'debit' | 'credit';
export type AccountCategory = 'income' | 'expense' | 'asset' | 'liability' | 'equity';

export interface ChartOfAccount {
  id: string;
  school_id: string;
  code: string;
  name: string;
  category: AccountCategory;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  children?: ChartOfAccount[];
  balance?: number;
}

export interface JournalEntry {
  id: string;
  school_id: string;
  branch_id?: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  created_by?: string;
  approved_by?: string;
  created_at: string;
  lines?: JournalLine[];
}

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  type: LedgerType;
  amount: number;
  description?: string;
  created_at: string;
  account?: ChartOfAccount;
}

// ============================================================
// SAAS BILLING TYPES
// ============================================================

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface SaasInvoice {
  id: string;
  school_id: string;
  subscription_id: string;
  invoice_number: string;
  source: 'subscription' | 'addon' | 'manual';
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  transaction_id?: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  notes?: string;
  created_at: string;
  school?: School;
}

export interface UsageMetrics {
  id: string;
  school_id: string;
  metric_date: string;
  active_students: number;
  active_staff: number;
  total_branches: number;
  storage_used_mb: number;
  sms_sent: number;
  emails_sent: number;
  api_calls: number;
  created_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_value: string;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface AnalyticsSnapshot {
  id: string;
  school_id: string;
  branch_id?: string;
  snapshot_type: string;
  snapshot_date: string;
  data: Record<string, unknown>;
  computed_at: string;
}

export interface AiInsight {
  id: string;
  school_id: string;
  insight_type: string;
  title: string;
  summary: string;
  data: Record<string, unknown>;
  confidence?: number;
  actionable: boolean;
  action_suggestion?: string;
  generated_at: string;
  expires_at?: string;
  is_read: boolean;
}

export interface StudentPerformanceSnapshot {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  snapshot_month: number;
  attendance_rate?: number;
  average_marks?: number;
  fee_payment_rate?: number;
  assignment_completion_rate?: number;
  risk_score?: number;
  performance_trend?: 'improving' | 'stable' | 'declining';
  flags: string[];
  computed_at: string;
  student?: Student;
}

// ============================================================
// SUPPORT TICKET TYPES
// ============================================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  school_id?: string;
  submitted_by?: string;
  category: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
  school?: School;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachment_urls: string[];
  is_internal: boolean;
  created_at: string;
}

// ============================================================
// JOB QUEUE TYPES
// ============================================================

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

export type JobType =
  | 'send_sms'
  | 'send_email'
  | 'send_push'
  | 'generate_report'
  | 'generate_invoice'
  | 'generate_certificate'
  | 'compute_analytics'
  | 'compute_payroll'
  | 'sync_usage_metrics'
  | 'export_data';

export interface JobQueueItem {
  id: string;
  school_id?: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  priority: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  worker_id?: string;
  created_at: string;
}

// ============================================================
// MULTI-BRANCH DASHBOARD TYPES
// ============================================================

export interface BranchStats {
  branch_id: string;
  branch_name: string;
  total_students: number;
  total_staff: number;
  attendance_rate: number;
  monthly_revenue: number;
  pending_fees: number;
}

export interface PlatformStats {
  total_schools: number;
  active_schools: number;
  total_students: number;
  total_staff: number;
  monthly_revenue: number;
  monthly_new_schools: number;
  plan_distribution: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  churn_rate: number;
  avg_students_per_school: number;
}

// ============================================================
// API RESPONSE WRAPPERS (mobile-ready)
// ============================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
