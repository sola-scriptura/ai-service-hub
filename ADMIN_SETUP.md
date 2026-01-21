# Admin Dashboard & Notification System Setup Guide

This guide walks you through setting up the Admin Dashboard and Email Notification system for AI Service Hub.

## Table of Contents

1. [Database Setup](#1-database-setup)
2. [Fix RLS Policies (IMPORTANT)](#2-fix-rls-policies-important)
3. [Create Initial Admin User](#3-create-initial-admin-user)
4. [Email Notifications Setup](#4-email-notifications-setup)
5. [Testing the System](#5-testing-the-system)

---

## 1. Database Setup

### Run the Migration

Execute the following SQL in your Supabase Dashboard > SQL Editor:

```sql
-- File: supabase/migrations/002_admin_features.sql

-- 1. Add assigned_admin_id column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES profiles(id);

-- 2. Create index for faster admin project queries
CREATE INDEX IF NOT EXISTS idx_projects_assigned_admin
ON projects(assigned_admin_id);

-- 3. Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_email_notifications_status
ON email_notifications(status);

CREATE INDEX IF NOT EXISTS idx_email_notifications_project
ON email_notifications(project_id);

-- 5. Create function to get first admin
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

-- 6. Create auto-assign trigger
CREATE OR REPLACE FUNCTION auto_assign_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_admin_id IS NULL THEN
    NEW.assigned_admin_id := get_first_admin_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_assign_admin ON projects;
CREATE TRIGGER trigger_auto_assign_admin
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin();

-- 7. Enable RLS on email_notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for admins to manage projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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
CREATE POLICY "Admins can view all notifications" ON email_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert notifications" ON email_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 10. Service role policy for Edge Functions
CREATE POLICY "Service role manages notifications" ON email_notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
```

---

## 2. Fix RLS Policies (IMPORTANT)

If you're getting "infinite recursion detected in policy for relation 'profiles'" errors when submitting projects, you need to run this migration.

### The Problem

The original RLS policies check admin status by querying the profiles table within a profiles policy, causing infinite recursion.

### The Solution

Run this migration in Supabase Dashboard > SQL Editor:

```sql
-- File: supabase/migrations/004_fix_rls_recursion.sql

-- Step 1: Drop ALL existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Step 2: Create SECURITY DEFINER function to check admin status (bypasses RLS)
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

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Step 3: Create function to get admin email (for notifications)
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

GRANT EXECUTE ON FUNCTION public.get_admin_email() TO authenticated;

-- Step 4: Non-recursive PROFILES policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_service_role" ON profiles FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Step 5: Drop and recreate PROJECTS policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON projects FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "projects_select_admin" ON projects FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "projects_insert_own" ON projects FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "projects_update_own" ON projects FOR UPDATE TO authenticated
USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

CREATE POLICY "projects_update_admin" ON projects FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "projects_service_role" ON projects FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Step 6: PROJECT_FILES policies
DROP POLICY IF EXISTS "Users can view own project files" ON project_files;
DROP POLICY IF EXISTS "Users can insert own project files" ON project_files;

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_files_select_own" ON project_files FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_files.project_id AND p.client_id = auth.uid()));

CREATE POLICY "project_files_select_admin" ON project_files FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "project_files_insert_own" ON project_files FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_files.project_id AND p.client_id = auth.uid()));

CREATE POLICY "project_files_service_role" ON project_files FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Step 7: EMAIL_NOTIFICATIONS policies
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_notifications_insert" ON email_notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "email_notifications_select_admin" ON email_notifications FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "email_notifications_service_role" ON email_notifications FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

### Verify the Fix

Run these queries to confirm:

```sql
-- Check is_admin function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- Check policies on profiles table
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Check policies on projects table
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'projects';
```

---

## 3. Create Initial Admin User

### Option A: Sign Up Then Update Role (Recommended)

1. Go to your website and sign up with:
   - Email: `basilondago823@gmail.com`
   - Password: `Mettler2025`
   - Name: Your name

2. Run this SQL in Supabase Dashboard > SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'basilondago823@gmail.com';
```

### Option B: Create via Supabase Dashboard

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Then run the SQL above to set their role to 'admin'

### Verify Admin Access

1. Sign in with the admin account
2. Navigate to `/admin`
3. You should see the Admin Dashboard

---

## 4. Email Notifications Setup

### Option 1: Using Resend (Recommended)

1. **Create Resend Account**
   - Go to [https://resend.com](https://resend.com)
   - Sign up for free (100 emails/day on free tier)
   - Get your API key from Dashboard > API Keys

2. **Deploy the Edge Function**

   First, install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

   Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   Deploy the function:
   ```bash
   supabase functions deploy send-email
   ```

3. **Set Environment Variables**

   In Supabase Dashboard > Project Settings > Edge Functions > Secrets:

   Add these secrets:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: `AI Service Hub <notifications@yourdomain.com>`

   Note: For Resend free tier, you can only send to your own email until you verify a domain.

### Option 2: Manual Email Processing

Without the Edge Function, emails are stored in the `email_notifications` table with `status = 'pending'`.

You can:
1. Query pending notifications manually
2. Use a webhook service (Zapier, Make) to send emails
3. Build a separate email worker service

```sql
-- View pending notifications
SELECT * FROM email_notifications WHERE status = 'pending';

-- Mark as sent after manually processing
UPDATE email_notifications
SET status = 'sent', sent_at = NOW()
WHERE id = 'notification-id-here';
```

### Option 3: Database Webhook (Advanced)

Set up a database webhook in Supabase:
1. Go to Database > Webhooks
2. Create a new webhook on `email_notifications` INSERT
3. Point it to your email service endpoint

---

## 5. Testing the System

### Test Admin Dashboard

1. Sign in as admin
2. Go to `/admin`
3. You should see:
   - Stats cards (total, pending, completed, etc.)
   - Projects tab with all submitted projects
   - Users tab with all users
   - Ability to change project status
   - Ability to create new admin users

### Test Project Submission

1. Sign out of admin account
2. Sign up/in as a regular client
3. Browse to a service
4. Configure pricing and select expert
5. Submit a project
6. Check:
   - Project appears in client dashboard (`/dashboard`)
   - Project appears in admin dashboard (`/admin`)
   - Email notifications created in `email_notifications` table

### Test Status Change Notifications

1. Sign in as admin
2. Go to `/admin`
3. Change a project's status
4. Check `email_notifications` table for new notification records

---

## Feature Summary

### Admin Dashboard Features

| Feature | Description |
|---------|-------------|
| Project List | View all submitted projects with full details |
| Status Management | Change project status (pending → in_progress → completed) |
| Filtering | Filter projects by status or service |
| File Access | View and download uploaded project files |
| User Management | View all users and their roles |
| Admin Creation | Create new admin users directly |
| Statistics | Real-time stats including revenue tracking |

### Email Notifications

| Trigger | Recipients | Content |
|---------|------------|---------|
| Project Submitted | Client + Admin | Project details, quote, expert info |
| Status Changed | Client + Admin | Old status, new status, project details |

### Security

- Admin routes are protected - only users with `role = 'admin'` can access
- Projects are automatically assigned to the first admin
- Clients can only see their own projects
- RLS policies enforce access control at database level

---

## Troubleshooting

### "Access Denied" on Admin Dashboard

1. Check user's role in profiles table:
   ```sql
   SELECT role FROM profiles WHERE email = 'your-email@example.com';
   ```

2. Update if needed:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Projects Not Loading

1. Check browser console for errors
2. Verify RLS policies are created
3. Ensure user is authenticated

### Email Notifications Not Sending

1. Check `email_notifications` table for records
2. If using Edge Function, check function logs in Supabase Dashboard
3. Verify RESEND_API_KEY is set correctly

### New Admin Can't Be Created

1. Ensure the Supabase service role key is configured
2. Check browser console for specific error messages
3. Try the manual method (sign up + update role)

### "Infinite recursion detected in policy" Error

This error (`code: 42P17`) occurs when RLS policies have circular dependencies.

**Symptoms:**
- Project submission fails with 500 error
- Console shows: `infinite recursion detected in policy for relation "profiles"`

**Solution:**
1. Run the migration in [Section 2](#2-fix-rls-policies-important)
2. The migration creates `is_admin()` function with SECURITY DEFINER that bypasses RLS
3. All admin-checking policies now use `is_admin(auth.uid())` instead of querying profiles directly

**Verify Fix:**
```sql
-- Test the is_admin function
SELECT public.is_admin(auth.uid());

-- Should return policies using is_admin function
SELECT policyname, qual FROM pg_policies WHERE tablename = 'profiles';
```

### Project Submission Still Fails After RLS Fix

1. Check browser console for specific error code
2. Verify all policies were created:
   ```sql
   SELECT tablename, policyname FROM pg_policies
   WHERE tablename IN ('profiles', 'projects', 'project_files', 'email_notifications');
   ```
3. Ensure the user is authenticated (check `auth.uid()` is not null)
4. Check if the client_id matches the authenticated user's ID
