-- ============================================================
-- SHIKSHA ERP - Complete Database Schema
-- Multi-tenant School Management SaaS for Bangladesh
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'super_admin', 'school_owner', 'school_admin',
  'principal', 'teacher', 'accountant', 'staff',
  'guardian', 'student'
);

CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled', 'trial');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'partial', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'bkash', 'nagad', 'rocket', 'sslcommerz', 'bank_transfer', 'cheque');
CREATE TYPE fee_type AS ENUM ('tuition', 'admission', 'exam', 'transport', 'library', 'sports', 'lab', 'hostel', 'other');
CREATE TYPE payroll_status AS ENUM ('pending', 'processing', 'paid', 'cancelled');
CREATE TYPE exam_type AS ENUM ('unit_test', 'mid_term', 'final', 'ssc', 'hsc', 'jsc', 'psc', 'other');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'alert', 'payment', 'attendance', 'exam');
CREATE TYPE day_of_week AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
CREATE TYPE school_type AS ENUM ('school', 'college', 'coaching', 'madrasa', 'university', 'other');
CREATE TYPE academic_level AS ENUM ('primary', 'secondary', 'higher_secondary', 'undergraduate', 'postgraduate');

-- ============================================================
-- PLANS (SaaS subscription plans)
-- ============================================================

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name subscription_plan NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_students INTEGER NOT NULL DEFAULT 100,
  max_teachers INTEGER NOT NULL DEFAULT 10,
  max_storage_gb INTEGER NOT NULL DEFAULT 5,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCHOOLS (tenants)
-- ============================================================

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type school_type NOT NULL DEFAULT 'school',
  eiin VARCHAR(20),                          -- Bangladesh EIIN number
  registration_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  division VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  favicon_url TEXT,
  banner_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1e40af',
  secondary_color VARCHAR(7) DEFAULT '#3b82f6',
  principal_name VARCHAR(255),
  established_year INTEGER,
  academic_level academic_level[] NOT NULL DEFAULT '{secondary}',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Dhaka',
  currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  custom_domain VARCHAR(255),
  settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL DEFAULT 'trial',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  payment_method payment_method,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS (auth + profile)
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,  -- NULL for super_admin
  role user_role NOT NULL DEFAULT 'student',
  full_name VARCHAR(255) NOT NULL,
  full_name_bn VARCHAR(255),               -- Bangla name
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  gender gender,
  date_of_birth DATE,
  national_id VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  settings JSONB NOT NULL DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACADEMIC YEARS
-- ============================================================

CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, name)
);

-- ============================================================
-- CLASSES & SECTIONS
-- ============================================================

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  numeric_level INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, name)
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  max_students INTEGER DEFAULT 50,
  room_number VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- ============================================================
-- SUBJECTS
-- ============================================================

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255),
  code VARCHAR(20),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  full_marks INTEGER DEFAULT 100,
  pass_marks INTEGER DEFAULT 33,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  student_id VARCHAR(50) NOT NULL,           -- School-assigned ID
  roll_number VARCHAR(20),
  registration_number VARCHAR(50),
  board_registration_number VARCHAR(50),    -- SSC/HSC board registration
  full_name VARCHAR(255) NOT NULL,
  full_name_bn VARCHAR(255),
  gender gender NOT NULL,
  date_of_birth DATE,
  blood_group VARCHAR(5),
  religion VARCHAR(50),
  nationality VARCHAR(100) DEFAULT 'Bangladeshi',
  national_id VARCHAR(20),
  birth_certificate_number VARCHAR(30),
  photo_url TEXT,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES academic_years(id),
  admission_date DATE,
  admission_number VARCHAR(50),
  previous_school VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_scholarship BOOLEAN NOT NULL DEFAULT false,
  scholarship_details TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, student_id)
);

-- ============================================================
-- GUARDIANS
-- ============================================================

CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  full_name_bn VARCHAR(255),
  relation VARCHAR(50) NOT NULL DEFAULT 'father',
  phone VARCHAR(20) NOT NULL,
  alt_phone VARCHAR(20),
  email VARCHAR(255),
  nid VARCHAR(20),
  occupation VARCHAR(100),
  annual_income DECIMAL(12,2),
  address TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_guardians (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (student_id, guardian_id)
);

-- ============================================================
-- TEACHERS & STAFF
-- ============================================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  staff_id VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  full_name_bn VARCHAR(255),
  role user_role NOT NULL DEFAULT 'teacher',
  designation VARCHAR(100),
  department VARCHAR(100),
  gender gender,
  date_of_birth DATE,
  blood_group VARCHAR(5),
  religion VARCHAR(50),
  national_id VARCHAR(20),
  phone VARCHAR(20),
  alt_phone VARCHAR(20),
  email VARCHAR(255),
  photo_url TEXT,
  address TEXT,
  district VARCHAR(100),
  joining_date DATE,
  leaving_date DATE,
  employment_type VARCHAR(50) DEFAULT 'full_time',
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  salary DECIMAL(12,2),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, staff_id)
);

-- Teacher-Subject-Section assignment
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  is_class_teacher BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TIMETABLE
-- ============================================================

CREATE TABLE timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(20),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id),
  section_id UUID NOT NULL REFERENCES sections(id),
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  subject_id UUID REFERENCES subjects(id),      -- for period-wise attendance
  marked_by UUID REFERENCES staff(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, student_id, date, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

CREATE TABLE staff_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status NOT NULL DEFAULT 'present',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, staff_id, date)
);

-- ============================================================
-- EXAMS & RESULTS
-- ============================================================

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type exam_type NOT NULL DEFAULT 'unit_test',
  class_id UUID NOT NULL REFERENCES classes(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  start_date DATE,
  end_date DATE,
  result_published BOOLEAN NOT NULL DEFAULT false,
  result_published_at TIMESTAMPTZ,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  full_marks INTEGER NOT NULL DEFAULT 100,
  pass_marks INTEGER NOT NULL DEFAULT 33,
  room VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(6,2),
  full_marks DECIMAL(6,2) NOT NULL DEFAULT 100,
  grade VARCHAR(5),
  grade_point DECIMAL(4,2),
  is_absent BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  entered_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, student_id, subject_id)
);

-- ============================================================
-- FEES & INVOICES
-- ============================================================

CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type fee_type NOT NULL DEFAULT 'tuition',
  amount DECIMAL(12,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly, one_time
  due_day INTEGER,                   -- day of month when due
  academic_year_id UUID REFERENCES academic_years(id),
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  academic_year_id UUID REFERENCES academic_years(id),
  month INTEGER,                    -- 1-12 for monthly invoices
  year INTEGER,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
  status payment_status NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  generated_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, invoice_number)
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id),
  description VARCHAR(255) NOT NULL,
  type fee_type NOT NULL DEFAULT 'tuition',
  amount DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - discount) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_number VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transaction_id VARCHAR(100),        -- gateway transaction ID
  gateway_response JSONB,             -- full gateway response
  receipt_number VARCHAR(50),
  collected_by UUID REFERENCES staff(id),
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, payment_number)
);

-- ============================================================
-- PAYROLL
-- ============================================================

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,             -- 1-12
  year INTEGER NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  house_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (
    basic_salary + house_allowance + medical_allowance + transport_allowance + other_allowance
  ) STORED,
  tax_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  provident_fund DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deduction DECIMAL(12,2) GENERATED ALWAYS AS (
    tax_deduction + provident_fund + other_deduction
  ) STORED,
  net_salary DECIMAL(12,2) GENERATED ALWAYS AS (
    basic_salary + house_allowance + medical_allowance + transport_allowance + other_allowance
    - tax_deduction - provident_fund - other_deduction
  ) STORED,
  working_days INTEGER,
  present_days INTEGER,
  absent_days INTEGER,
  status payroll_status NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  payment_method payment_method,
  transaction_id VARCHAR(100),
  generated_by UUID REFERENCES staff(id),
  approved_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, staff_id, month, year)
);

-- ============================================================
-- EXPENSES
-- ============================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  vendor_name VARCHAR(255),
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  approved_by UUID REFERENCES staff(id),
  entered_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  recipient_role user_role[],          -- NULL means broadcast to all
  recipient_ids UUID[],                -- specific user IDs
  is_sms BOOLEAN NOT NULL DEFAULT false,
  is_email BOOLEAN NOT NULL DEFAULT false,
  is_push BOOLEAN NOT NULL DEFAULT true,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  url TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type VARCHAR(100),
  related_to_type VARCHAR(50),       -- 'student', 'staff', 'school'
  related_to_id UUID,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_class_section ON students(class_id, section_id);
CREATE INDEX idx_students_active ON students(school_id, is_active);
CREATE INDEX idx_staff_school_id ON staff(school_id);
CREATE INDEX idx_attendance_date ON attendance(school_id, date);
CREATE INDEX idx_attendance_student ON attendance(student_id, date);
CREATE INDEX idx_invoices_school_student ON invoices(school_id, student_id);
CREATE INDEX idx_invoices_status ON invoices(school_id, status);
CREATE INDEX idx_payments_school ON payments(school_id, payment_date);
CREATE INDEX idx_payroll_school_month ON payroll(school_id, year, month);
CREATE INDEX idx_audit_logs_school ON audit_logs(school_id, created_at);
CREATE INDEX idx_notifications_school ON notifications(school_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's school_id
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Schools: super_admins see all, others see their own
CREATE POLICY "schools_select" ON schools FOR SELECT
  USING (
    get_user_role() = 'super_admin'
    OR id = get_user_school_id()
  );

CREATE POLICY "schools_insert" ON schools FOR INSERT
  WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "schools_update" ON schools FOR UPDATE
  USING (
    get_user_role() = 'super_admin'
    OR (id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin'))
  );

-- Users: tenant-scoped
CREATE POLICY "users_select" ON users FOR SELECT
  USING (
    get_user_role() = 'super_admin'
    OR school_id = get_user_school_id()
    OR id = auth.uid()
  );

CREATE POLICY "users_insert" ON users FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin'
    OR school_id = get_user_school_id()
  );

CREATE POLICY "users_update" ON users FOR UPDATE
  USING (
    get_user_role() = 'super_admin'
    OR (school_id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin', 'principal'))
    OR id = auth.uid()
  );

-- Students: tenant-scoped
CREATE POLICY "students_select" ON students FOR SELECT
  USING (
    get_user_role() = 'super_admin'
    OR school_id = get_user_school_id()
  );

CREATE POLICY "students_insert" ON students FOR INSERT
  WITH CHECK (
    get_user_role() = 'super_admin'
    OR (school_id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin', 'principal', 'staff'))
  );

CREATE POLICY "students_update" ON students FOR UPDATE
  USING (
    get_user_role() = 'super_admin'
    OR (school_id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin', 'principal', 'staff'))
  );

-- Generic tenant isolation for most tables
CREATE POLICY "staff_tenant" ON staff FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "classes_tenant" ON classes FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "sections_tenant" ON sections FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "attendance_tenant" ON attendance FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "invoices_tenant" ON invoices FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "payments_tenant" ON payments FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "payroll_tenant" ON payroll FOR ALL
  USING (
    get_user_role() = 'super_admin'
    OR (school_id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin', 'accountant', 'principal'))
  );

CREATE POLICY "notifications_tenant" ON notifications FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "academic_years_tenant" ON academic_years FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "fee_structures_tenant" ON fee_structures FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "exams_tenant" ON exams FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "exam_results_tenant" ON exam_results FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "expenses_tenant" ON expenses FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "audit_logs_tenant" ON audit_logs FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

-- ============================================================
-- SEED DATA - Plans
-- ============================================================

INSERT INTO plans (name, display_name, price_monthly, price_yearly, max_students, max_teachers, max_storage_gb, features) VALUES
  ('free', 'Free', 0, 0, 100, 5, 1, '{"modules": ["students", "attendance", "fees"], "support": "community"}'),
  ('starter', 'Starter', 999, 9990, 500, 25, 5, '{"modules": ["students", "attendance", "fees", "payroll", "reports"], "support": "email", "sms": false}'),
  ('professional', 'Professional', 2499, 24990, 2000, 100, 20, '{"modules": "all", "support": "priority", "sms": true, "custom_domain": false}'),
  ('enterprise', 'Enterprise', 5999, 59990, -1, -1, 100, '{"modules": "all", "support": "dedicated", "sms": true, "custom_domain": true, "api_access": true}');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update invoice paid_amount & status when payment inserted
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices SET
    paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total THEN 'paid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'partial'
      WHEN due_date < CURRENT_DATE THEN 'overdue'
      ELSE 'unpaid'
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_updates_invoice
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_on_payment();
