// ============================================================
// SHIKSHA ERP - Complete TypeScript Types
// ============================================================

export type UserRole =
  | 'super_admin'
  | 'school_owner'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'staff'
  | 'guardian'
  | 'student';

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended' | 'cancelled' | 'trial';
export type Gender = 'male' | 'female' | 'other';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'bank_transfer' | 'cheque';
export type FeeType = 'tuition' | 'admission' | 'exam' | 'transport' | 'library' | 'sports' | 'lab' | 'hostel' | 'other';
export type PayrollStatus = 'pending' | 'processing' | 'paid' | 'cancelled';
export type ExamType = 'unit_test' | 'mid_term' | 'final' | 'ssc' | 'hsc' | 'jsc' | 'psc' | 'other';
export type NotificationType = 'info' | 'warning' | 'success' | 'alert' | 'payment' | 'attendance' | 'exam';
export type SchoolType = 'school' | 'college' | 'coaching' | 'madrasa' | 'university' | 'other';

// ============================================================
// CORE ENTITIES
// ============================================================

export interface Plan {
  id: string;
  name: SubscriptionPlan;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_students: number;
  max_teachers: number;
  max_storage_gb: number;
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  type: SchoolType;
  eiin?: string;
  registration_number?: string;
  address?: string;
  city?: string;
  district?: string;
  division?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  favicon_url?: string;
  banner_url?: string;
  primary_color: string;
  secondary_color: string;
  principal_name?: string;
  established_year?: number;
  timezone: string;
  currency: string;
  language: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  custom_domain?: string;
  settings: SchoolSettings;
  is_active: boolean;
  is_verified: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  // relations
  subscription?: Subscription;
}

export interface SchoolSettings {
  academic_year_start_month?: number;
  grading_system?: 'percentage' | 'gpa' | 'letter';
  attendance_type?: 'daily' | 'period_wise';
  fee_due_day?: number;
  sms_provider?: string;
  bangla_date?: boolean;
  features?: string[];
}

export interface Subscription {
  id: string;
  school_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  expires_at?: string;
  trial_ends_at?: string;
  billing_cycle: string;
  amount_paid: number;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface User {
  id: string;
  school_id?: string;
  role: UserRole;
  full_name: string;
  full_name_bn?: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  gender?: Gender;
  date_of_birth?: string;
  national_id?: string;
  address?: string;
  city?: string;
  district?: string;
  is_active: boolean;
  last_login?: string;
  settings: Record<string, unknown>;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  numeric_level?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // relations
  sections?: Section[];
  student_count?: number;
}

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  max_students: number;
  room_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // relations
  class?: Class;
  student_count?: number;
  class_teacher?: Staff;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  name_bn?: string;
  code?: string;
  class_id?: string;
  full_marks: number;
  pass_marks: number;
  is_optional: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  user_id?: string;
  student_id: string;
  roll_number?: string;
  registration_number?: string;
  board_registration_number?: string;
  full_name: string;
  full_name_bn?: string;
  gender: Gender;
  date_of_birth?: string;
  blood_group?: string;
  religion?: string;
  nationality: string;
  national_id?: string;
  birth_certificate_number?: string;
  photo_url?: string;
  address?: string;
  city?: string;
  district?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  admission_date?: string;
  admission_number?: string;
  previous_school?: string;
  is_active: boolean;
  is_scholarship: boolean;
  scholarship_details?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  // relations
  class?: Class;
  section?: Section;
  guardians?: Guardian[];
  academic_year?: AcademicYear;
}

export interface Guardian {
  id: string;
  school_id: string;
  user_id?: string;
  full_name: string;
  full_name_bn?: string;
  relation: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  nid?: string;
  occupation?: string;
  annual_income?: number;
  address?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  // relations
  students?: Student[];
}

export interface Staff {
  id: string;
  school_id: string;
  user_id?: string;
  staff_id: string;
  full_name: string;
  full_name_bn?: string;
  role: UserRole;
  designation?: string;
  department?: string;
  gender?: Gender;
  date_of_birth?: string;
  blood_group?: string;
  religion?: string;
  national_id?: string;
  phone?: string;
  alt_phone?: string;
  email?: string;
  photo_url?: string;
  address?: string;
  district?: string;
  joining_date?: string;
  leaving_date?: string;
  employment_type: string;
  qualification?: string;
  experience_years: number;
  salary?: number;
  bank_name?: string;
  bank_account?: string;
  is_active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  section_id: string;
  date: string;
  status: AttendanceStatus;
  subject_id?: string;
  marked_by?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  // relations
  student?: Student;
}

export interface Exam {
  id: string;
  school_id: string;
  name: string;
  type: ExamType;
  class_id: string;
  academic_year_id: string;
  start_date?: string;
  end_date?: string;
  result_published: boolean;
  result_published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // relations
  class?: Class;
  schedules?: ExamSchedule[];
}

export interface ExamSchedule {
  id: string;
  exam_id: string;
  subject_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  full_marks: number;
  pass_marks: number;
  room?: string;
  created_at: string;
  subject?: Subject;
}

export interface ExamResult {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  marks_obtained?: number;
  full_marks: number;
  grade?: string;
  grade_point?: number;
  is_absent: boolean;
  remarks?: string;
  entered_by?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  subject?: Subject;
}

export interface FeeStructure {
  id: string;
  school_id: string;
  class_id?: string;
  name: string;
  type: FeeType;
  amount: number;
  frequency: string;
  due_day?: number;
  academic_year_id?: string;
  is_mandatory: boolean;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  school_id: string;
  student_id: string;
  invoice_number: string;
  academic_year_id?: string;
  month?: number;
  year?: number;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount: number;
  total: number;
  paid_amount: number;
  balance: number;
  status: PaymentStatus;
  notes?: string;
  generated_by?: string;
  created_at: string;
  updated_at: string;
  // relations
  student?: Student;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  fee_structure_id?: string;
  description: string;
  type: FeeType;
  amount: number;
  discount: number;
  net_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  school_id: string;
  invoice_id: string;
  student_id: string;
  payment_number: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  transaction_id?: string;
  gateway_response?: Record<string, unknown>;
  receipt_number?: string;
  collected_by?: string;
  notes?: string;
  is_verified: boolean;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  // relations
  student?: Student;
  invoice?: Invoice;
}

export interface Payroll {
  id: string;
  school_id: string;
  staff_id: string;
  month: number;
  year: number;
  basic_salary: number;
  house_allowance: number;
  medical_allowance: number;
  transport_allowance: number;
  other_allowance: number;
  gross_salary: number;
  tax_deduction: number;
  provident_fund: number;
  other_deduction: number;
  total_deduction: number;
  net_salary: number;
  working_days?: number;
  present_days?: number;
  absent_days?: number;
  status: PayrollStatus;
  payment_date?: string;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  generated_by?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // relations
  staff?: Staff;
}

export interface Notification {
  id: string;
  school_id: string;
  type: NotificationType;
  title: string;
  body: string;
  recipient_role?: UserRole[];
  recipient_ids?: string[];
  is_sms: boolean;
  is_email: boolean;
  is_push: boolean;
  scheduled_at?: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  school_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_staff: number;
  total_classes: number;
  attendance_today: number;
  attendance_rate: number;
  monthly_revenue: number;
  monthly_expenses: number;
  pending_fees: number;
  overdue_invoices: number;
}

export interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean>;
}

// ============================================================
// FORM TYPES
// ============================================================

export interface StudentFormData {
  student_id: string;
  full_name: string;
  full_name_bn?: string;
  gender: Gender;
  date_of_birth?: string;
  blood_group?: string;
  religion?: string;
  phone?: string;
  email?: string;
  address?: string;
  district?: string;
  class_id: string;
  section_id: string;
  academic_year_id: string;
  admission_date?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
}

export interface StaffFormData {
  staff_id: string;
  full_name: string;
  full_name_bn?: string;
  role: UserRole;
  designation?: string;
  department?: string;
  gender?: Gender;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  joining_date?: string;
  qualification?: string;
  salary?: number;
}

export interface FeeStructureFormData {
  name: string;
  type: FeeType;
  amount: number;
  frequency: string;
  class_id?: string;
  due_day?: number;
  is_mandatory: boolean;
  description?: string;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  school_id?: string;
  school?: School;
  profile: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  school_name: string;
  school_type: SchoolType;
}

// ============================================================
// PERMISSION TYPES
// ============================================================

export type Permission =
  | 'students:read' | 'students:write' | 'students:delete'
  | 'teachers:read' | 'teachers:write' | 'teachers:delete'
  | 'attendance:read' | 'attendance:write'
  | 'fees:read' | 'fees:write' | 'fees:delete'
  | 'payments:read' | 'payments:write'
  | 'payroll:read' | 'payroll:write' | 'payroll:approve'
  | 'reports:read' | 'reports:export'
  | 'settings:read' | 'settings:write'
  | 'schools:read' | 'schools:write'
  | 'exams:read' | 'exams:write'
  | 'notifications:read' | 'notifications:write';

export type RolePermissions = Record<UserRole, Permission[]>;
