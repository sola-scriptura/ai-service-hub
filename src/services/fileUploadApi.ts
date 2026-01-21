import { supabase, isSupabaseConfigured } from './supabase';

/**
 * IMPORTANT: Supabase Storage Configuration
 *
 * This API requires a Storage bucket named "project-files" to exist in Supabase.
 * Supabase does NOT auto-create buckets - you must create it manually:
 *
 * 1. Go to Supabase Dashboard > Storage
 * 2. Click "New bucket"
 * 3. Name: "project-files"
 * 4. Public bucket: Yes (for public URL access) or No (for authenticated access)
 *
 * Required RLS policies for the bucket:
 * - INSERT: Allow authenticated users to upload files
 * - SELECT: Allow authenticated users to read their files (or public if public bucket)
 * - DELETE: Allow authenticated users to delete their own files (optional)
 *
 * Example policy for authenticated uploads:
 *   CREATE POLICY "Allow authenticated uploads" ON storage.objects
 *   FOR INSERT TO authenticated
 *   WITH CHECK (bucket_id = 'project-files');
 */

const STORAGE_BUCKET = 'project-files';

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
}

export const fileUploadApi = {
  /**
   * Upload file to Supabase Storage
   *
   * Upload path format: {projectId}/{timestamp}.{extension}
   * Example: "abc123/1705678901234.pdf"
   */
  async uploadFile(file: File, projectId: string): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: null, error: new Error('Supabase not configured') };
    }

    try {
      const fileExt = file.name.split('.').pop();
      // Path format: {projectId}/{timestamp}.{extension}
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;

      console.log(`[fileUploadApi] Uploading file to bucket "${STORAGE_BUCKET}":`, filePath);

      const { data, error } = await supabase!.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (error) {
        // Check for bucket not found error
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket') && error.message?.includes('not found')) {
          console.error(`[fileUploadApi] BUCKET NOT FOUND: The storage bucket "${STORAGE_BUCKET}" does not exist.`);
          console.error('[fileUploadApi] Please create the bucket in Supabase Dashboard > Storage > New bucket');
          console.error('[fileUploadApi] Bucket name must be exactly: "project-files"');
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase!.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      console.log('[fileUploadApi] File uploaded successfully:', publicUrl);
      return { url: publicUrl, error: null };

    } catch (error) {
      console.error('[fileUploadApi] Upload error:', error);
      return { url: null, error: error as Error };
    }
  },

  /**
   * Save file record to database
   */
  async saveFileRecord(
    projectId: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileType: string,
    uploadedBy: string
  ): Promise<{ file: ProjectFile | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { file: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase!
        .from('project_files')
        .insert({
          project_id: projectId,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        file: {
          id: data.id,
          projectId: data.project_id,
          fileName: data.file_name,
          fileUrl: data.file_url,
          fileSize: data.file_size,
          fileType: data.file_type,
          uploadedBy: data.uploaded_by,
          createdAt: data.created_at,
        },
        error: null,
      };

    } catch (error) {
      console.error('[fileUploadApi] Save file record error:', error);
      return { file: null, error: error as Error };
    }
  },

  /**
   * Get files for a project
   */
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((f) => ({
        id: f.id,
        projectId: f.project_id,
        fileName: f.file_name,
        fileUrl: f.file_url,
        fileSize: f.file_size,
        fileType: f.file_type,
        uploadedBy: f.uploaded_by,
        createdAt: f.created_at,
      }));

    } catch (error) {
      console.error('[fileUploadApi] Get project files error:', error);
      return [];
    }
  },
};