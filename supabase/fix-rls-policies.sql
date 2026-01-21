-- =====================================================
-- Fix RLS Policies for Profile Creation
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate policies with INSERT permission
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
