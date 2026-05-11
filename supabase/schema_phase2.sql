-- ============================================================
-- SHIKSHA ERP — PHASE 2 DATABASE SCHEMA
-- Enterprise Multi-tenant, Multi-branch School SaaS
-- Partition-ready, audit-friendly, accounting-grade
-- ============================================================

-- ============================================================
-- EXTENSIONS (add to Phase 1 schema)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- composite indexes
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- query monitoring

-- ============================================================
-- ADDITIONAL ENUMS
-- ============================================================

CREATE TYPE branch_status AS ENUM ('active', 'inactive', 'setup', 'suspended');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'withdrawn');
CREATE TYPE leave_type AS ENUM ('casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid', 'compensatory', 'emergency');
CREATE TYPE book_status AS ENUM ('available', 'issued', 'reserved', 'lost', 'damaged', 'maintenance');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired');
CREATE TYPE hostel_room_type AS ENUM ('single', 'double', 'triple', 'dormitory');
CREATE TYPE hostel_room_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE admission_status AS ENUM ('draft', 'submitted', 'under_review', 'shortlisted', 'admitted', 'rejected', 'waitlisted');
CREATE TYPE online_exam_status AS ENUM ('draft', 'published', 'active', 'ended', 'graded');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'submitted', 'graded', 'overdue');
CREATE TYPE event_type AS ENUM ('school', 'sports', 'cultural', 'exam', 'holiday', 'parent_meeting', 'other');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'escalated');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ledger_type AS ENUM ('debit', 'credit');
CREATE TYPE account_category AS ENUM ('income', 'expense', 'asset', 'liability', 'equity');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE invoice_source AS ENUM ('subscription', 'addon', 'manual');
CREATE TYPE message_channel AS ENUM ('sms', 'email', 'push', 'whatsapp', 'in_app');
CREATE TYPE message_status AS ENUM ('queued', 'sending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled', 'retrying');

-- ============================================================
-- BRANCHES (Multi-branch per school/chain)
-- ============================================================

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL,
  status branch_status NOT NULL DEFAULT 'setup',
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  principal_id UUID REFERENCES staff(id),
  established_date DATE,
  max_students INTEGER,
  logo_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  is_headquarters BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, code)
);

-- Branch-level staff assignments
CREATE TABLE branch_staff (
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (branch_id, staff_id)
);

-- ============================================================
-- ACADEMIC CALENDAR & EVENTS
-- ============================================================

CREATE TABLE academic_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  calendar_id UUID NOT NULL REFERENCES academic_calendars(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type event_type NOT NULL DEFAULT 'school',
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  affects_attendance BOOLEAN NOT NULL DEFAULT false,
  color VARCHAR(7),
  location VARCHAR(255),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HR: DEPARTMENTS, POSITIONS, EMPLOYMENT
-- ============================================================

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  head_staff_id UUID REFERENCES staff(id),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, name)
);

CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  title VARCHAR(100) NOT NULL,
  grade VARCHAR(20),
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  is_teaching BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend staff table relations
CREATE TABLE staff_employment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  branch_id UUID REFERENCES branches(id),
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  start_date DATE NOT NULL,
  end_date DATE,
  salary DECIMAL(12,2) NOT NULL,
  reason_for_change TEXT,
  approved_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  document_type VARCHAR(100) NOT NULL, -- nid, certificate, contract, etc.
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  issued_date DATE,
  expiry_date DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEAVE MANAGEMENT
-- ============================================================

CREATE TABLE leave_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  days_allowed INTEGER NOT NULL DEFAULT 0,
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  max_carry_forward INTEGER DEFAULT 0,
  applicable_to VARCHAR(50) NOT NULL DEFAULT 'all', -- all, teaching, non_teaching
  requires_document BOOLEAN NOT NULL DEFAULT false,
  min_notice_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, leave_type, applicable_to)
);

CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  year INTEGER NOT NULL,
  allocated INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  remaining INTEGER GENERATED ALWAYS AS (allocated - used) STORED,
  carried_forward INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, staff_id, leave_type, year)
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  half_day BOOLEAN NOT NULL DEFAULT false,
  reason TEXT NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  substitute_staff_id UUID REFERENCES staff(id),
  document_url TEXT,
  reviewed_by UUID REFERENCES staff(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  category_id UUID REFERENCES inventory_categories(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  unit VARCHAR(20) DEFAULT 'pcs',
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2),
  location VARCHAR(100),
  is_consumable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment', 'return'
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  reference_id UUID, -- purchase order, usage record etc
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LIBRARY
-- ============================================================

CREATE TABLE library_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES library_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  category_id UUID REFERENCES library_categories(id),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20),
  publisher VARCHAR(255),
  edition VARCHAR(50),
  year_published INTEGER,
  language VARCHAR(50) DEFAULT 'English',
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  rack_number VARCHAR(20),
  cover_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_type VARCHAR(20) NOT NULL, -- 'student' | 'staff'
  borrower_id UUID NOT NULL,          -- student.id or staff.id
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  returned_date DATE,
  fine_amount DECIMAL(8,2) DEFAULT 0,
  fine_paid BOOLEAN NOT NULL DEFAULT false,
  status book_status NOT NULL DEFAULT 'issued',
  issued_by UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSPORT
-- ============================================================

CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  stop_order INTEGER NOT NULL,
  pickup_time TIME,
  drop_time TIME,
  landmark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  registration_number VARCHAR(30) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'bus',
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  capacity INTEGER NOT NULL,
  route_id UUID REFERENCES transport_routes(id),
  driver_staff_id UUID REFERENCES staff(id),
  helper_staff_id UUID REFERENCES staff(id),
  insurance_expiry DATE,
  fitness_expiry DATE,
  status vehicle_status NOT NULL DEFAULT 'active',
  current_mileage INTEGER DEFAULT 0,
  gps_device_id VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_transport (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES transport_routes(id),
  stop_id UUID REFERENCES transport_stops(id),
  vehicle_id UUID REFERENCES vehicles(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  pickup_point TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_date DATE,
  ended_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, academic_year_id)
);

-- ============================================================
-- HOSTEL
-- ============================================================

CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL, -- 'male' | 'female' | 'mixed'
  warden_id UUID REFERENCES staff(id),
  address TEXT,
  capacity INTEGER NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hostel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor INTEGER,
  type hostel_room_type NOT NULL DEFAULT 'double',
  capacity INTEGER NOT NULL DEFAULT 2,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  monthly_fee DECIMAL(10,2),
  amenities JSONB DEFAULT '[]',
  status hostel_room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hostel_id, room_number)
);

CREATE TABLE hostel_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES hostels(id),
  room_id UUID NOT NULL REFERENCES hostel_rooms(id),
  student_id UUID NOT NULL REFERENCES students(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  monthly_fee DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, academic_year_id)
);

-- ============================================================
-- ONLINE ADMISSIONS
-- ============================================================

CREATE TABLE admission_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  form_number VARCHAR(50) NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_name_bn VARCHAR(255),
  date_of_birth DATE,
  gender gender,
  previous_school VARCHAR(255),
  previous_class VARCHAR(50),
  previous_gpa DECIMAL(4,2),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  guardian_phone VARCHAR(20) NOT NULL,
  guardian_email VARCHAR(255),
  address TEXT,
  district VARCHAR(100),
  photo_url TEXT,
  documents_urls JSONB DEFAULT '[]',
  additional_info JSONB DEFAULT '{}',
  status admission_status NOT NULL DEFAULT 'draft',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES staff(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  converted_student_id UUID REFERENCES students(id),
  admission_fee_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, form_number)
);

-- ============================================================
-- ONLINE EXAMINATIONS
-- ============================================================

CREATE TABLE online_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id),            -- link to offline exam if applicable
  subject_id UUID NOT NULL REFERENCES subjects(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  section_ids UUID[],                            -- NULL = all sections
  title VARCHAR(255) NOT NULL,
  instructions TEXT,
  total_marks INTEGER NOT NULL,
  pass_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status online_exam_status NOT NULL DEFAULT 'draft',
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  shuffle_options BOOLEAN NOT NULL DEFAULT false,
  show_result_immediately BOOLEAN NOT NULL DEFAULT true,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES online_exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  question_type VARCHAR(20) NOT NULL DEFAULT 'mcq', -- mcq | true_false | short | essay
  options JSONB,                                     -- [{id, text, image_url}]
  correct_answer JSONB,                              -- option id(s) or text
  explanation TEXT,
  marks INTEGER NOT NULL DEFAULT 1,
  negative_marks DECIMAL(4,2) NOT NULL DEFAULT 0,
  difficulty VARCHAR(10) DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE online_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES online_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  answers JSONB NOT NULL DEFAULT '{}',             -- {question_id: answer}
  marks_obtained DECIMAL(6,2),
  percentage DECIMAL(5,2),
  is_passed BOOLEAN,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- in_progress | submitted | graded | timed_out
  ip_address INET,
  browser_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, student_id, attempt_number)
);

-- ============================================================
-- ASSIGNMENTS & HOMEWORK
-- ============================================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  section_id UUID REFERENCES sections(id),
  created_by UUID NOT NULL REFERENCES staff(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  attachment_urls JSONB DEFAULT '[]',
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  max_marks INTEGER,
  status assignment_status NOT NULL DEFAULT 'draft',
  submission_type VARCHAR(20) DEFAULT 'file',     -- file | text | url
  allow_late_submission BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_urls JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late BOOLEAN NOT NULL DEFAULT false,
  marks_obtained DECIMAL(6,2),
  feedback TEXT,
  graded_by UUID REFERENCES staff(id),
  graded_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted', -- submitted | graded | returned
  UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- COMMUNICATION SYSTEM
-- ============================================================

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),           -- NULL = platform-level
  name VARCHAR(100) NOT NULL,
  channel message_channel NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',                    -- [{name, description}]
  category VARCHAR(50),                            -- attendance, fee, exam, etc
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  channel message_channel NOT NULL,
  template_id UUID REFERENCES message_templates(id),
  subject VARCHAR(255),
  body TEXT NOT NULL,
  recipient_type VARCHAR(50) NOT NULL,             -- all | class | section | individual | role
  recipient_filter JSONB DEFAULT '{}',             -- {class_ids, section_ids, user_ids, roles}
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',     -- draft | scheduled | sending | sent | failed
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL,
  campaign_id UUID REFERENCES message_campaigns(id),
  channel message_channel NOT NULL,
  recipient_id UUID NOT NULL,                      -- user.id
  recipient_contact VARCHAR(255) NOT NULL,         -- phone or email
  subject VARCHAR(255),
  body TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'queued',
  provider_message_id VARCHAR(100),                -- gateway message ID
  provider_response JSONB,
  cost DECIMAL(10,6) DEFAULT 0,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Partition message_logs by month for performance
CREATE TABLE message_logs_2024_q1 PARTITION OF message_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE message_logs_2024_q2 PARTITION OF message_logs
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE message_logs_2024_q3 PARTITION OF message_logs
  FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE message_logs_2024_q4 PARTITION OF message_logs
  FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE message_logs_2025 PARTITION OF message_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE message_logs_default PARTITION OF message_logs DEFAULT;

-- ============================================================
-- ACCOUNTING LEDGER
-- ============================================================

CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category account_category NOT NULL,
  parent_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, code)
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  entry_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50),                    -- invoice | payment | payroll | expense
  reference_id UUID,
  total_debit DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(14,2) NOT NULL DEFAULT 0,
  is_balanced BOOLEAN GENERATED ALWAYS AS (total_debit = total_credit) STORED,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, entry_number)
);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  type ledger_type NOT NULL,
  amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  journal_line_id UUID NOT NULL REFERENCES journal_lines(id),
  entry_date DATE NOT NULL,
  debit DECIMAL(14,2) NOT NULL DEFAULT 0,
  credit DECIMAL(14,2) NOT NULL DEFAULT 0,
  balance DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (entry_date);

CREATE TABLE ledger_2024 PARTITION OF ledger FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE ledger_2025 PARTITION OF ledger FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE ledger_default PARTITION OF ledger DEFAULT;

-- ============================================================
-- SAAS BILLING
-- ============================================================

CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  feature_value TEXT,                            -- 'true', '500', 'unlimited'
  UNIQUE(plan_id, feature_key)
);

CREATE TABLE saas_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  invoice_number VARCHAR(50) NOT NULL,
  source invoice_source NOT NULL DEFAULT 'subscription',
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method payment_method,
  transaction_id VARCHAR(100),
  status payment_status NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invoice_number)
);

CREATE TABLE addon_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  addon_type VARCHAR(100) NOT NULL,              -- 'extra_storage', 'sms_bundle', 'extra_branch'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_students INTEGER DEFAULT 0,
  active_staff INTEGER DEFAULT 0,
  total_branches INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(12,2) DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, metric_date)
);

-- ============================================================
-- CERTIFICATES & ID CARDS
-- ============================================================

CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,                     -- 'transfer', 'achievement', 'participation', 'id_card'
  template_data JSONB NOT NULL DEFAULT '{}',     -- layout, fields, styles
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE issued_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES certificate_templates(id),
  recipient_type VARCHAR(20) NOT NULL,           -- 'student' | 'staff'
  recipient_id UUID NOT NULL,
  certificate_number VARCHAR(50) NOT NULL,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  data JSONB NOT NULL DEFAULT '{}',              -- merged template data
  file_url TEXT,
  issued_by UUID REFERENCES staff(id),
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, certificate_number)
);

-- ============================================================
-- SUPPORT TICKET SYSTEM
-- ============================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  school_id UUID REFERENCES schools(id),
  submitted_by UUID REFERENCES users(id),
  category VARCHAR(50) NOT NULL,                 -- billing, technical, feature, other
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  attachment_urls JSONB DEFAULT '[]',
  is_internal BOOLEAN NOT NULL DEFAULT false,    -- internal staff note
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BACKGROUND JOBS
-- ============================================================

CREATE TABLE job_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),
  job_type VARCHAR(100) NOT NULL,                -- 'send_sms', 'generate_report', 'send_email', etc
  payload JSONB NOT NULL DEFAULT '{}',
  status job_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5,           -- 1=highest, 10=lowest
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  worker_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_queue_pending ON job_queue(status, priority, scheduled_at)
  WHERE status IN ('pending', 'retrying');

-- ============================================================
-- ADVANCED AUDIT LOGGING (partitioned)
-- ============================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  action VARCHAR(100) NOT NULL,                  -- 'login', 'view', 'create', 'update', 'delete', 'export'
  module VARCHAR(50) NOT NULL,                   -- 'students', 'fees', 'attendance', etc
  resource_type VARCHAR(50),
  resource_id UUID,
  resource_name VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  country_code VARCHAR(2),
  device_type VARCHAR(20),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE activity_logs_2024 PARTITION OF activity_logs
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE activity_logs_2025 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE activity_logs_default PARTITION OF activity_logs DEFAULT;

-- ============================================================
-- AI READINESS: ANALYTICS SNAPSHOTS
-- ============================================================

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  snapshot_type VARCHAR(50) NOT NULL,            -- 'daily_attendance', 'monthly_finance', 'student_performance'
  snapshot_date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',              -- aggregated metrics
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, snapshot_type, snapshot_date)
);

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  insight_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  confidence DECIMAL(4,2),
  actionable BOOLEAN NOT NULL DEFAULT false,
  action_suggestion TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE student_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id UUID NOT NULL REFERENCES students(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  snapshot_month INTEGER NOT NULL,
  attendance_rate DECIMAL(5,2),
  average_marks DECIMAL(5,2),
  fee_payment_rate DECIMAL(5,2),
  assignment_completion_rate DECIMAL(5,2),
  risk_score DECIMAL(4,2),                       -- AI: dropout/failure risk 0-1
  performance_trend VARCHAR(20),                 -- 'improving', 'stable', 'declining'
  flags JSONB DEFAULT '[]',                      -- ['low_attendance', 'fee_defaulter']
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, academic_year_id, snapshot_month)
);

-- ============================================================
-- PLATFORM-WIDE INDEXES (Phase 2)
-- ============================================================

-- Branches
CREATE INDEX idx_branches_school ON branches(school_id, status);

-- Leave
CREATE INDEX idx_leave_requests_staff ON leave_requests(staff_id, status);
CREATE INDEX idx_leave_requests_date ON leave_requests(school_id, start_date, end_date);

-- Books
CREATE INDEX idx_books_school ON books(school_id);
CREATE INDEX idx_books_isbn ON books(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX idx_book_issues_borrower ON book_issues(borrower_id, status);
CREATE INDEX idx_book_issues_due ON book_issues(due_date) WHERE returned_date IS NULL;

-- Transport
CREATE INDEX idx_student_transport_student ON student_transport(student_id);

-- Online Exams
CREATE INDEX idx_online_exam_attempts_student ON online_exam_attempts(student_id, exam_id);

-- Assignments
CREATE INDEX idx_assignments_class ON assignments(class_id, section_id, due_date);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);

-- Messaging
CREATE INDEX idx_message_logs_campaign ON message_logs(campaign_id);
CREATE INDEX idx_message_logs_recipient ON message_logs(recipient_id, created_at);

-- Ledger
CREATE INDEX idx_journal_entries_school ON journal_entries(school_id, entry_date);
CREATE INDEX idx_ledger_account ON ledger(account_id, entry_date);

-- Analytics
CREATE INDEX idx_snapshots_school_type ON analytics_snapshots(school_id, snapshot_type, snapshot_date);
CREATE INDEX idx_performance_risk ON student_performance_snapshots(school_id, risk_score DESC)
  WHERE risk_score > 0.6;

-- Full-text search
CREATE INDEX idx_students_name_fts ON students USING GIN(to_tsvector('english', full_name));
CREATE INDEX idx_books_title_fts ON books USING GIN(to_tsvector('english', title || ' ' || COALESCE(author, '')));

-- Job queue compound
CREATE INDEX idx_job_queue_worker ON job_queue(status, scheduled_at) WHERE status = 'pending';

-- ============================================================
-- RLS EXTENSIONS FOR NEW TABLES
-- ============================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_tenant" ON branches FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "leave_requests_tenant" ON leave_requests FOR ALL
  USING (
    get_user_role() = 'super_admin'
    OR school_id = get_user_school_id()
  );

CREATE POLICY "books_tenant" ON books FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "online_exams_tenant" ON online_exams FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "assignments_tenant" ON assignments FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "message_campaigns_tenant" ON message_campaigns FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

CREATE POLICY "saas_invoices_tenant" ON saas_invoices FOR ALL
  USING (
    get_user_role() = 'super_admin'
    OR (school_id = get_user_school_id() AND get_user_role() IN ('school_owner', 'school_admin'))
  );

CREATE POLICY "admission_forms_tenant" ON admission_forms FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Daily analytics snapshot trigger
CREATE OR REPLACE FUNCTION compute_daily_snapshot(p_school_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_students INTEGER;
  v_attendance_rate DECIMAL;
  v_collections DECIMAL;
BEGIN
  SELECT COUNT(*) INTO v_students
  FROM students WHERE school_id = p_school_id AND is_active = true AND deleted_at IS NULL;

  SELECT COALESCE(
    ROUND(
      COUNT(*) FILTER (WHERE status = 'present') * 100.0 / NULLIF(COUNT(*), 0), 2
    ), 0
  ) INTO v_attendance_rate
  FROM attendance WHERE school_id = p_school_id AND date = p_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_collections
  FROM payments WHERE school_id = p_school_id AND payment_date::date = p_date;

  INSERT INTO analytics_snapshots (school_id, snapshot_type, snapshot_date, data)
  VALUES (
    p_school_id,
    'daily',
    p_date,
    jsonb_build_object(
      'total_students', v_students,
      'attendance_rate', v_attendance_rate,
      'daily_collections', v_collections
    )
  )
  ON CONFLICT (school_id, snapshot_type, snapshot_date)
  DO UPDATE SET data = EXCLUDED.data, computed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-compute student risk score
CREATE OR REPLACE FUNCTION compute_student_risk(
  p_attendance_rate DECIMAL,
  p_fee_payment_rate DECIMAL,
  p_avg_marks DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  risk DECIMAL := 0;
BEGIN
  -- Attendance contributes 40% to risk
  IF p_attendance_rate < 75 THEN risk := risk + 0.4;
  ELSIF p_attendance_rate < 85 THEN risk := risk + 0.2;
  END IF;

  -- Fee default contributes 30%
  IF p_fee_payment_rate < 50 THEN risk := risk + 0.3;
  ELSIF p_fee_payment_rate < 75 THEN risk := risk + 0.15;
  END IF;

  -- Academic performance contributes 30%
  IF p_avg_marks < 33 THEN risk := risk + 0.3;
  ELSIF p_avg_marks < 50 THEN risk := risk + 0.15;
  END IF;

  RETURN LEAST(risk, 1.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Updated_at triggers for Phase 2 tables
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER online_exams_updated_at BEFORE UPDATE ON online_exams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER admission_forms_updated_at BEFORE UPDATE ON admission_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
