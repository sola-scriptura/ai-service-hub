-- =====================================================
-- SUPABASE STORAGE SETUP FOR PROJECT FILES
-- =====================================================
-- Run this in Supabase SQL Editor to set up file storage
-- =====================================================

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);

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
    -- File uploader can always access
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Project participants can access
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