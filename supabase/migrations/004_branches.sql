-- ============================================================
-- Migration: 004_branches.sql
-- Adds multi-branch support
-- Run after: 003_rls_policies.sql
-- ============================================================

-- Branches table (from phase2 schema)
CREATE TABLE IF NOT EXISTS branches (
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
  principal_id UUID,
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

-- Add branch_id to core tables
ALTER TABLE staff ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);

-- Branch staff pivot
CREATE TABLE IF NOT EXISTS branch_staff (
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (branch_id, staff_id)
);

-- Auto-create HQ branch for existing schools
INSERT INTO branches (school_id, name, code, status, is_headquarters)
SELECT id, name || ' (HQ)', 'HQ', 'active', true
FROM schools
WHERE NOT EXISTS (
  SELECT 1 FROM branches b WHERE b.school_id = schools.id
)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_branches_school ON branches(school_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_branch ON staff(branch_id) WHERE branch_id IS NOT NULL;

-- RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches_tenant" ON branches FOR ALL
  USING (get_user_role() = 'super_admin' OR school_id = get_user_school_id());

-- Trigger
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
