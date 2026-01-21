-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- This migration fixes the infinite recursion error:
-- "infinite recursion detected in policy for relation 'profiles'"
--
-- The issue was that admin policies queried the profiles table
-- to check if a user is admin, but this triggered the same
-- policy check, causing infinite recursion.
--
-- SOLUTION: Use a security definer function to bypass RLS
-- when checking admin status.
--
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 1: Drop ALL existing profiles policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Step 2: Create a SECURITY DEFINER function to check admin status
-- This function bypasses RLS, preventing recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Step 3: Create a SECURITY DEFINER function to get admin email
-- Used for email notifications without RLS issues
CREATE OR REPLACE FUNCTION public.get_admin_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_admin_email() TO authenticated;

-- Step 4: Create a SECURITY DEFINER function to get current user's profile
-- Used for auth flow to bypass RLS
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM profiles
  WHERE id = auth.uid();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- =====================================================
-- PROFILES TABLE POLICIES (Non-recursive)
-- =====================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles (uses function to avoid recursion)
CREATE POLICY "profiles_select_admin"
ON profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 3: Users can insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 5: Admins can update any profile (for role changes)
CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 6: Service role has full access (for Edge Functions)
CREATE POLICY "profiles_service_role"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- First, drop existing projects policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Service role has full access" ON projects;
DROP POLICY IF EXISTS "projects_select_own" ON projects;
DROP POLICY IF EXISTS "projects_select_admin" ON projects;
DROP POLICY IF EXISTS "projects_insert_own" ON projects;
DROP POLICY IF EXISTS "projects_update_own" ON projects;
DROP POLICY IF EXISTS "projects_update_admin" ON projects;
DROP POLICY IF EXISTS "projects_service_role" ON projects;

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own projects
CREATE POLICY "projects_select_own"
ON projects FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Policy 2: Admins can view all projects (uses function)
CREATE POLICY "projects_select_admin"
ON projects FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 3: Users can insert their own projects
CREATE POLICY "projects_insert_own"
ON projects FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

-- Policy 4: Users can update their own projects (limited)
CREATE POLICY "projects_update_own"
ON projects FOR UPDATE
TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Policy 5: Admins can update any project
CREATE POLICY "projects_update_admin"
ON projects FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 6: Service role has full access
CREATE POLICY "projects_service_role"
ON projects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PROJECT_FILES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own project files" ON project_files;
DROP POLICY IF EXISTS "Users can insert own project files" ON project_files;
DROP POLICY IF EXISTS "Admins can view all project files" ON project_files;
DROP POLICY IF EXISTS "Service role has full access" ON project_files;
DROP POLICY IF EXISTS "project_files_select_own" ON project_files;
DROP POLICY IF EXISTS "project_files_select_admin" ON project_files;
DROP POLICY IF EXISTS "project_files_insert_own" ON project_files;
DROP POLICY IF EXISTS "project_files_service_role" ON project_files;

-- Ensure RLS is enabled
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view files for their own projects
CREATE POLICY "project_files_select_own"
ON project_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_files.project_id
    AND p.client_id = auth.uid()
  )
);

-- Policy 2: Admins can view all project files
CREATE POLICY "project_files_select_admin"
ON project_files FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 3: Users can insert files for their own projects
CREATE POLICY "project_files_insert_own"
ON project_files FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_files.project_id
    AND p.client_id = auth.uid()
  )
);

-- Policy 4: Service role has full access
CREATE POLICY "project_files_service_role"
ON project_files FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- EMAIL_NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "email_notifications_select_own" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_select_admin" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_insert" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_service_role" ON email_notifications;

-- Check if table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_notifications') THEN
    -- Ensure RLS is enabled
    ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

    -- Policy 1: Users can view their own notifications
    CREATE POLICY "email_notifications_select_own"
    ON email_notifications FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = email_notifications.project_id
        AND p.client_id = auth.uid()
      )
    );

    -- Policy 2: Admins can view all notifications
    CREATE POLICY "email_notifications_select_admin"
    ON email_notifications FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

    -- Policy 3: Authenticated users can insert notifications
    CREATE POLICY "email_notifications_insert"
    ON email_notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

    -- Policy 4: Service role has full access
    CREATE POLICY "email_notifications_service_role"
    ON email_notifications FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- UPDATE TRIGGER FUNCTION (if exists from 002 migration)
-- =====================================================

-- Update the get_first_admin_id function to use is_admin check
CREATE OR REPLACE FUNCTION public.get_first_admin_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
$$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify policies are set up correctly:

-- Check profiles policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Check projects policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'projects';

-- Check project_files policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'project_files';

-- Test is_admin function:
-- SELECT public.is_admin(auth.uid());

-- =====================================================
-- NOTES
-- =====================================================
--
-- This migration fixes the infinite recursion by:
-- 1. Using SECURITY DEFINER functions that bypass RLS
-- 2. The is_admin() function can safely query profiles
--    without triggering RLS policy evaluation
-- 3. All admin-related policies now use is_admin(auth.uid())
--
-- If you still see issues:
-- 1. Make sure this migration runs AFTER 003_fix_profiles_rls.sql
-- 2. Check that all old policies were dropped
-- 3. Verify the is_admin function exists: SELECT proname FROM pg_proc WHERE proname = 'is_admin';
-- =====================================================
