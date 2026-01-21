-- =====================================================
-- FIX: Profiles Table RLS Policies
-- =====================================================
-- This migration fixes common RLS issues that cause
-- auth hanging/timeout during signup and signin.
--
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- First, check if RLS is enabled (it should be)
-- If profiles table doesn't have RLS enabled, enable it:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- =====================================================
-- CORE POLICIES (Required for auth to work)
-- =====================================================

-- Policy 1: Allow users to read their own profile
-- This is critical for sign-in to work
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow users to insert their own profile
-- This is critical for sign-up to work
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- ADMIN POLICIES (For admin dashboard)
-- =====================================================

-- Policy 4: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Policy 5: Admins can update any profile (for role changes)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- =====================================================
-- SERVICE ROLE POLICY (For backend/Edge Functions)
-- =====================================================

-- This allows the service role (used by Edge Functions)
-- to manage all profiles
CREATE POLICY "Service role has full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- OPTIONAL: Auto-create profile on user signup
-- =====================================================
-- This trigger automatically creates a profile when
-- a new user signs up, which can help avoid RLS issues.
-- Uncomment if you want to use this approach.

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify policies are set up correctly:

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Check policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- =====================================================
-- NOTES
-- =====================================================
--
-- If signup still hangs after applying these policies:
--
-- 1. Check Supabase Dashboard > Authentication > Settings
--    - Is "Enable email confirmations" turned off?
--    - If ON, users need to confirm email before session is created
--
-- 2. Check browser Network tab for actual response times
--    - If Supabase responds but slowly, it might be network
--
-- 3. Check Supabase Dashboard > Settings > API
--    - Verify the project URL and anon key match your .env file
--
-- 4. Check Supabase Dashboard > Database > Tables
--    - Does the 'profiles' table exist?
--    - Does it have the correct columns?
-- =====================================================
