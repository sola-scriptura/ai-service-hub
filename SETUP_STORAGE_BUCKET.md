# Fix File Download Issue - Storage Bucket Setup

## Problem
Getting "Bucket not found" error when downloading files.

## Solution
The `project-files` storage bucket doesn't exist in Supabase. Create it:

### Method 1: SQL Script (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);
```

### Method 2: Manual Creation
1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Enter bucket name: `project-files`
5. Set as **Public bucket**: Yes
6. Click **Create bucket**

### Set Up Policies (Important)
After creating the bucket, run the complete setup script in SQL Editor:

```sql
-- Create RLS policies for the bucket
CREATE POLICY "Users can upload their own project files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view project files they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND (p.client_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM experts e
             WHERE e.id = p.expert_id
             AND e.user_id = auth.uid()
           ))
    )
  )
);

CREATE POLICY "Users can delete their own project files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Test
After setup, file uploads and downloads should work properly.