-- ============================================================
-- SHIKSHA ERP - Demo Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Demo School
INSERT INTO schools (
  id, name, slug, type, eiin, address, city, district, division,
  phone, email, website, principal_name, established_year,
  primary_color, secondary_color, is_active, is_verified,
  settings
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Dhaka Model School & College',
  'dhaka-model',
  'school',
  '108459',
  '123 Dhanmondi R/A, Road 5',
  'Dhaka',
  'Dhaka',
  'Dhaka',
  '02-9112345',
  'info@dhakamsc.edu.bd',
  'https://dhakamsc.edu.bd',
  'Prof. Abdul Karim Rahman',
  1985,
  '#1e40af',
  '#3b82f6',
  true,
  true,
  '{"academic_year_start_month": 1, "grading_system": "gpa", "attendance_type": "daily", "fee_due_day": 10, "bangla_date": false}'
);

-- Academic Year
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current) VALUES
  ('ay-2024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024', '2024-01-01', '2024-12-31', true),
  ('ay-2023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2023', '2023-01-01', '2023-12-31', false);

-- Classes
INSERT INTO classes (id, school_id, name, numeric_level, is_active) VALUES
  ('cls-6',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class VI',   6,  true),
  ('cls-7',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class VII',  7,  true),
  ('cls-8',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class VIII', 8,  true),
  ('cls-9',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class IX',   9,  true),
  ('cls-10', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class X',    10, true);

-- Sections
INSERT INTO sections (id, school_id, class_id, name, max_students, room_number, is_active) VALUES
  ('sec-6a',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-6',  'A', 50, '101', true),
  ('sec-6b',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-6',  'B', 50, '102', true),
  ('sec-7a',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-7',  'A', 50, '201', true),
  ('sec-7b',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-7',  'B', 50, '202', true),
  ('sec-8a',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-8',  'A', 50, '301', true),
  ('sec-8b',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-8',  'B', 50, '302', true),
  ('sec-9a',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-9',  'A', 45, '401', true),
  ('sec-9b',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-9',  'B', 45, '402', true),
  ('sec-9c',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-9',  'C', 45, '403', true),
  ('sec-10a', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-10', 'A', 40, '501', true),
  ('sec-10b', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-10', 'B', 40, '502', true);

-- Subjects
INSERT INTO subjects (school_id, name, name_bn, code, class_id, full_marks, pass_marks, is_optional) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bangla', 'বাংলা', 'BAN', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'English', 'ইংরেজি', 'ENG', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mathematics', 'গণিত', 'MAT', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Physics', 'পদার্থবিজ্ঞান', 'PHY', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chemistry', 'রসায়ন', 'CHE', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Biology', 'জীববিজ্ঞান', 'BIO', 'cls-10', 100, 33, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ICT', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ICT', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bangladesh & Global Studies', 'বাংলাদেশ ও বিশ্বপরিচয়', 'BGS', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Islam & Moral Education', 'ইসলাম ও নৈতিক শিক্ষা', 'ISL', 'cls-10', 100, 33, false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Physical Education', 'শারীরিক শিক্ষা', 'PE', 'cls-10', 100, 33, false);

-- Fee Structures
INSERT INTO fee_structures (school_id, class_id, name, type, amount, frequency, due_day, is_mandatory, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Monthly Tuition Fee (VI-VIII)', 'tuition',   4500, 'monthly', 10, true, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Monthly Tuition Fee (IX-X)',    'tuition',   5500, 'monthly', 10, true, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Admission Fee',                 'admission', 15000,'one_time',NULL, true, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cls-10','SSC Exam Fee',                  'exam',      800,  'yearly',  NULL, true, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Annual Library Fee',            'library',   600,  'yearly',  NULL, false, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Transport Fee',                 'transport', 1200, 'monthly', 10,   false, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL,    'Science Lab Fee',               'lab',       800,  'yearly',  NULL, false, true);

-- Sample Staff (Super Admin auth user must be created first via Supabase Auth)
-- These reference auth.users which must be created separately

-- Sample Exam
INSERT INTO exams (school_id, name, type, class_id, academic_year_id, start_date, end_date, result_published) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'First Term Examination 2024', 'mid_term', 'cls-10', 'ay-2024', '2024-03-10', '2024-03-20', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Annual Examination 2024',     'final',    'cls-10', 'ay-2024', '2024-11-01', '2024-11-15', false);

-- Expenses (sample)
INSERT INTO expenses (school_id, category, title, amount, expense_date, payment_method, vendor_name) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Utilities',    'Electricity Bill – January',   8500,  '2024-01-10', 'bank_transfer', 'DESCO'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maintenance',  'Classroom Paint & Repair',     25000, '2024-01-15', 'cash',          'Local Contractor'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Supplies',     'Office Stationery',            3200,  '2024-01-20', 'cash',          'Rahman Stationery'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Utilities',    'Internet Bill',                2500,  '2024-01-05', 'bank_transfer', 'BTCL'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Events',       'Annual Sports Day Expenses',   15000, '2024-01-25', 'cash',          'Various');

-- Notifications (sample)
INSERT INTO notifications (school_id, type, title, body, is_sms, is_email, is_push, sent_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'alert',   'School Holiday Notice', 'School will be closed on February 21 for Language Martyrs'' Day.', true,  true,  true, NOW() - INTERVAL '2 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'payment', 'January Fee Reminder',  'January 2024 fees are due by January 10. Please pay to avoid late charges.', true, false, true, NOW() - INTERVAL '5 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'exam',    'Exam Schedule 2024',    'Annual examination schedule has been published. Check notice board for details.', false, true, true, NOW() - INTERVAL '7 days');
