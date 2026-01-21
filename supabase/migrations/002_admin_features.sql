-- =====================================================
-- Admin Dashboard & Notification System Migration
-- =====================================================
-- Run this migration in Supabase SQL Editor
-- =====================================================

-- 1. Add assigned_admin_id column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES profiles(id);

-- 2. Create index for faster admin project queries
CREATE INDEX IF NOT EXISTS idx_projects_assigned_admin
ON projects(assigned_admin_id);

-- 3. Create email_notifications table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'project_submitted', 'status_changed'
  project_id UUID REFERENCES projects(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 4. Create index for email notifications
CREATE INDEX IF NOT EXISTS idx_email_notifications_status
ON email_notifications(status);

CREATE INDEX IF NOT EXISTS idx_email_notifications_project
ON email_notifications(project_id);

-- 5. Create function to get first available admin
CREATE OR REPLACE FUNCTION get_first_admin_id()
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id
  FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to auto-assign admin on project insert
CREATE OR REPLACE FUNCTION auto_assign_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign to first admin if not already assigned
  IF NEW.assigned_admin_id IS NULL THEN
    NEW.assigned_admin_id := get_first_admin_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to auto-assign admin on project insert
DROP TRIGGER IF EXISTS trigger_auto_assign_admin ON projects;
CREATE TRIGGER trigger_auto_assign_admin
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin();

-- 8. RLS Policies for projects (admin access)

-- Policy: Admins can view all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update all projects
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 9. RLS Policies for email_notifications

-- Enable RLS on email_notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON email_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON email_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Service role can manage all notifications (for Edge Functions)
CREATE POLICY "Service role manages notifications" ON email_notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 10. RLS Policies for profiles (admin management)

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Policy: Admins can update user roles
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =====================================================
-- IMPORTANT: Create the initial admin user manually
-- =====================================================
-- After running this migration:
-- 1. Sign up with email: basilondago823@gmail.com, password: Mettler2025
-- 2. Then run this SQL to make them admin:
--
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'basilondago823@gmail.com';
-- =====================================================
