-- ============================================================
-- SHIKSHA ERP - Supabase Storage Setup
-- Run in Supabase SQL editor after schema.sql
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('school-logos',     'school-logos',     true,  2097152,  ARRAY['image/png','image/jpeg','image/webp']),
  ('student-photos',   'student-photos',   false, 2097152,  ARRAY['image/png','image/jpeg','image/webp']),
  ('staff-photos',     'staff-photos',     false, 2097152,  ARRAY['image/png','image/jpeg','image/webp']),
  ('documents',        'documents',        false, 10485760, ARRAY['application/pdf','image/png','image/jpeg']),
  ('receipts',         'receipts',         false, 5242880,  ARRAY['application/pdf','image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public buckets readable by all
CREATE POLICY "school_logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-logos');

CREATE POLICY "school_logos_auth_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'school-logos' AND auth.role() = 'authenticated'
  );

-- Student photos: school-scoped access
CREATE POLICY "student_photos_school_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "student_photos_school_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'student-photos' AND auth.role() = 'authenticated'
  );

-- Documents: authenticated access
CREATE POLICY "documents_auth_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
  );

CREATE POLICY "receipts_auth_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'receipts' AND auth.role() = 'authenticated'
  );
