import { supabase, isSupabaseConfigured } from './supabase';
import { ProjectStatus, UrgencyLevel, ComplexityLevel } from '@/types/database';
import { emailApi } from './emailApi';

export interface ProjectCreate {
  clientId: string;
  expertId: string;
  serviceId: string;
  title: string;
  description?: string;
  quantity: number;
  urgency: UrgencyLevel;
  complexity: ComplexityLevel;
  basePrice: number;
  finalPrice: number;
  // Additional data for email notifications
  clientEmail?: string;
  clientName?: string;
  serviceTitle?: string;
  expertName?: string;
}

export interface Project extends Omit<ProjectCreate, 'clientEmail' | 'clientName' | 'serviceTitle' | 'expertName'> {
  id: string;
  assignedAdminId: string | null;
  status: ProjectStatus;
  submittedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export const projectsApi = {
  /**
   * Create a new project
   * Projects are automatically assigned to an admin via database trigger
   * Email notifications are sent to both client and admin
   */
  async create(project: ProjectCreate): Promise<{ project: Project | null; error: Error | null }> {
    console.log('[projectsApi.create] ===== STARTING PROJECT CREATION =====');
    console.log('[projectsApi.create] Timestamp:', new Date().toISOString());
    console.log('[projectsApi.create] Project data:', {
      clientId: project.clientId,
      expertId: project.expertId,
      serviceId: project.serviceId,
      title: project.title,
      quantity: project.quantity,
      urgency: project.urgency,
      complexity: project.complexity,
      basePrice: project.basePrice,
      finalPrice: project.finalPrice,
    });

    if (!isSupabaseConfigured()) {
      console.error('[projectsApi.create] ERROR: Supabase not configured');
      return { project: null, error: new Error('Supabase not configured') };
    }

    try {
      // Step 1: Insert the project
      console.log('[projectsApi.create] Step 1: Inserting project into database...');
      const insertStart = Date.now();

      const { data, error } = await supabase!
        .from('projects')
        .insert({
          client_id: project.clientId,
          expert_id: project.expertId,
          service_id: project.serviceId,
          title: project.title,
          description: project.description || null,
          quantity: project.quantity,
          urgency: project.urgency,
          complexity: project.complexity,
          base_price: project.basePrice,
          final_price: project.finalPrice,
          status: 'pending',
          // Note: assigned_admin_id is auto-set by database trigger
        })
        .select()
        .single();

      console.log(`[projectsApi.create] Step 1 completed in ${Date.now() - insertStart}ms`);

      if (error) {
        console.error('[projectsApi.create] Step 1 FAILED:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Check for specific RLS errors
        if (error.code === '42P17') {
          console.error('[projectsApi.create] INFINITE RECURSION DETECTED in RLS policy');
          console.error('[projectsApi.create] Run migration 004_fix_rls_recursion.sql to fix this');
        } else if (error.code === '42501' || error.message.includes('permission denied')) {
          console.error('[projectsApi.create] RLS PERMISSION DENIED');
          console.error('[projectsApi.create] Check that INSERT policy exists for projects table');
        }

        throw error;
      }

      console.log('[projectsApi.create] Step 1 SUCCESS - Project created:', data.id);
      console.log('[projectsApi.create] - Assigned admin ID:', data.assigned_admin_id || 'none (trigger may not be set up)');

      // Step 2: Build the response object
      console.log('[projectsApi.create] Step 2: Building response object...');
      const createdProject: Project = {
        id: data.id,
        clientId: data.client_id,
        expertId: data.expert_id!,
        assignedAdminId: data.assigned_admin_id,
        serviceId: data.service_id,
        title: data.title,
        description: data.description || undefined,
        quantity: data.quantity,
        urgency: data.urgency,
        complexity: data.complexity,
        basePrice: data.base_price,
        finalPrice: data.final_price,
        status: data.status,
        submittedAt: data.submitted_at,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        deadline: data.deadline,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Step 3: Send email notifications (non-blocking)
      console.log('[projectsApi.create] Step 3: Sending email notifications...');
      if (project.clientEmail) {
        console.log('[projectsApi.create] - Client email provided:', project.clientEmail);

        try {
          const adminEmail = await emailApi.getAdminEmail();
          console.log('[projectsApi.create] - Admin email:', adminEmail || 'not found');

          if (adminEmail) {
            // Fire and forget - don't block project creation
            emailApi.sendProjectSubmittedNotification(
              {
                projectId: data.id,
                projectTitle: project.title,
                serviceTitle: project.serviceTitle || project.serviceId,
                expertName: project.expertName || null,
                clientName: project.clientName || null,
                clientEmail: project.clientEmail,
                finalPrice: project.finalPrice,
                urgency: project.urgency,
                complexity: project.complexity,
                status: 'pending',
                submittedAt: data.submitted_at,
              },
              adminEmail
            ).then(() => {
              console.log('[projectsApi.create] Email notifications queued successfully');
            }).catch((err) => {
              console.error('[projectsApi.create] Failed to send email notification:', err);
            });
          } else {
            console.warn('[projectsApi.create] No admin email found - skipping email notification');
          }
        } catch (emailError) {
          console.error('[projectsApi.create] Error getting admin email:', emailError);
          // Don't fail the project creation due to email issues
        }
      } else {
        console.log('[projectsApi.create] - No client email provided, skipping notifications');
      }

      console.log('[projectsApi.create] ===== PROJECT CREATION COMPLETE =====');
      return { project: createdProject, error: null };

    } catch (error) {
      console.error('[projectsApi.create] ===== PROJECT CREATION FAILED =====');
      console.error('[projectsApi.create] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[projectsApi.create] Error:', error);
      return { project: null, error: error as Error };
    }
  },

  /**
   * Get projects for a client
   */
  async getByClient(clientId: string): Promise<Project[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        clientId: p.client_id,
        expertId: p.expert_id!,
        assignedAdminId: p.assigned_admin_id,
        serviceId: p.service_id,
        title: p.title,
        description: p.description || undefined,
        quantity: p.quantity,
        urgency: p.urgency,
        complexity: p.complexity,
        basePrice: p.base_price,
        finalPrice: p.final_price,
        status: p.status,
        submittedAt: p.submitted_at,
        startedAt: p.started_at,
        completedAt: p.completed_at,
        deadline: p.deadline,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching client projects:', error);
      return [];
    }
  },

  /**
   * Get projects for an expert
   */
  async getByExpert(expertId: string): Promise<Project[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('projects')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        clientId: p.client_id,
        expertId: p.expert_id!,
        assignedAdminId: p.assigned_admin_id,
        serviceId: p.service_id,
        title: p.title,
        description: p.description || undefined,
        quantity: p.quantity,
        urgency: p.urgency,
        complexity: p.complexity,
        basePrice: p.base_price,
        finalPrice: p.final_price,
        status: p.status,
        submittedAt: p.submitted_at,
        startedAt: p.started_at,
        completedAt: p.completed_at,
        deadline: p.deadline,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching expert projects:', error);
      return [];
    }
  },
};
