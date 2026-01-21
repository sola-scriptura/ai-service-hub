import { supabase, isSupabaseConfigured } from './supabase';
import { ProjectStatus, UserRole } from '@/types/database';
import { ProjectFile } from './fileUploadApi';

export interface AdminProject {
  id: string;
  clientId: string;
  clientEmail: string;
  clientName: string | null;
  expertId: string | null;
  expertName: string | null;
  assignedAdminId: string | null;
  serviceId: string;
  serviceTitle: string;
  title: string;
  description: string | null;
  quantity: number;
  urgency: string;
  complexity: string;
  basePrice: number;
  finalPrice: number;
  status: ProjectStatus;
  submittedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
}

export const adminApi = {
  /**
   * Check if current user is an admin
   * Uses the is_admin RPC function to bypass RLS and avoid recursion
   */
  async isAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) {
        console.log('[adminApi] No authenticated user found');
        return false;
      }

      console.log('[adminApi] Checking admin status for user:', user.id);

      // Try using the RPC function first (bypasses RLS)
      const { data: isAdminResult, error: rpcError } = await supabase!.rpc('is_admin', {
        user_id: user.id,
      });

      if (!rpcError) {
        console.log('[adminApi] RPC is_admin result:', isAdminResult);
        return isAdminResult === true;
      }

      console.log('[adminApi] RPC failed, falling back to direct query:', rpcError.message);

      // Fallback to direct query (may fail with RLS recursion if migration not applied)
      const { data: profile, error } = await supabase!
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[adminApi] Error checking admin status:', error);
        return false;
      }

      const isAdmin = profile?.role === 'admin';
      console.log('[adminApi] Direct query result - role:', profile?.role, 'isAdmin:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('[adminApi] Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Get all projects with full details (admin only)
   */
  async getAllProjects(): Promise<AdminProject[]> {
    if (!isSupabaseConfigured()) {
      console.log('[adminApi] Supabase not configured');
      return [];
    }

    try {
      console.log('[adminApi] Fetching all projects...');

      // Fetch projects
      const { data: projects, error } = await supabase!
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[adminApi] Error fetching projects:', error);
        throw error;
      }

      console.log('[adminApi] Raw projects fetched:', projects?.length || 0);

      if (!projects || projects.length === 0) {
        console.log('[adminApi] No projects found');
        return [];
      }

      // Fetch all client profiles separately
      const clientIds = [...new Set(projects.map(p => p.client_id))];
      let clientsMap: Record<string, { email: string; full_name: string | null }> = {};

      if (clientIds.length > 0) {
        const { data: clients, error: clientsError } = await supabase!
          .from('profiles')
          .select('id, email, full_name')
          .in('id', clientIds);

        if (clientsError) {
          console.error('[adminApi] Error fetching clients:', clientsError);
        } else if (clients) {
          clientsMap = clients.reduce((acc, c) => ({
            ...acc,
            [c.id]: { email: c.email, full_name: c.full_name }
          }), {} as Record<string, { email: string; full_name: string | null }>);
        }
      }

      // Fetch all services separately
      const serviceIds = [...new Set(projects.map(p => p.service_id))];
      let servicesMap: Record<string, string> = {};

      if (serviceIds.length > 0) {
        const { data: services, error: servicesError } = await supabase!
          .from('services')
          .select('id, title')
          .in('id', serviceIds);

        if (servicesError) {
          console.error('[adminApi] Error fetching services:', servicesError);
        } else if (services) {
          servicesMap = services.reduce((acc, s) => ({ ...acc, [s.id]: s.title }), {} as Record<string, string>);
        }
      }

      // Fetch expert names separately if needed
      const expertIds = [...new Set(projects.filter(p => p.expert_id).map(p => p.expert_id!))];
      let expertsMap: Record<string, string> = {};

      if (expertIds.length > 0) {
        const { data: experts, error: expertsError } = await supabase!
          .from('experts')
          .select('id, name')
          .in('id', expertIds);

        if (expertsError) {
          console.error('[adminApi] Error fetching experts:', expertsError);
        } else if (experts) {
          expertsMap = experts.reduce((acc, e) => ({ ...acc, [e.id]: e.name }), {} as Record<string, string>);
        }
      }

      // Fetch files for all projects
      const projectIds = projects.map(p => p.id);
      let filesMap: Record<string, ProjectFile[]> = {};

      if (projectIds.length > 0) {
        const { data: files, error: filesError } = await supabase!
          .from('project_files')
          .select('*')
          .in('project_id', projectIds);

        if (filesError) {
          console.error('[adminApi] Error fetching files:', filesError);
        } else if (files) {
          filesMap = files.reduce((acc, f) => {
            if (!acc[f.project_id]) acc[f.project_id] = [];
            acc[f.project_id].push({
              id: f.id,
              projectId: f.project_id,
              fileName: f.file_name,
              fileUrl: f.file_url,
              fileSize: f.file_size || 0,
              fileType: f.file_type || '',
              uploadedBy: f.uploaded_by,
              createdAt: f.created_at,
            });
            return acc;
          }, {} as Record<string, ProjectFile[]>);
        }
      }

      const adminProjects: AdminProject[] = projects.map((p) => {
        const client = clientsMap[p.client_id];
        return {
          id: p.id,
          clientId: p.client_id,
          clientEmail: client?.email || 'Unknown',
          clientName: client?.full_name || null,
          expertId: p.expert_id,
          expertName: p.expert_id ? expertsMap[p.expert_id] || null : null,
          assignedAdminId: p.assigned_admin_id,
          serviceId: p.service_id,
          serviceTitle: servicesMap[p.service_id] || p.service_id,
          title: p.title,
          description: p.description,
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
          files: filesMap[p.id] || [],
        };
      });

      console.log('[adminApi] Fetched', adminProjects.length, 'projects with full details');
      return adminProjects;
    } catch (error) {
      console.error('[adminApi] Error in getAllProjects:', error);
      return [];
    }
  },

  /**
   * Update project status (admin only)
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: ProjectStatus
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: new Error('Supabase not configured') };
    }

    try {
      console.log('[adminApi] Updating project status:', projectId, '->', newStatus);

      const updateData: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set timestamps based on status
      if (newStatus === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase!
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;

      console.log('[adminApi] Project status updated successfully');
      return { success: true, error: null };
    } catch (error) {
      console.error('[adminApi] Error updating project status:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<AdminUser[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: profiles, error } = await supabase!
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (profiles || []).map((p) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        role: p.role,
        createdAt: p.created_at,
      }));
    } catch (error) {
      console.error('[adminApi] Error fetching users:', error);
      return [];
    }
  },

  /**
   * Create a new admin user (admin only)
   * This creates the auth user and sets their role to admin
   */
  async createAdminUser(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      console.log('[adminApi] Creating admin user:', email);

      // Create auth user
      const { data: authData, error: authError } = await supabase!.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

      if (authError) {
        // If admin API fails, try regular signup and then update role
        console.log('[adminApi] Admin API not available, using regular signup');

        const { data: signUpData, error: signUpError } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error('User creation failed');

        // Update the profile to admin role
        const { error: updateError } = await supabase!
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            email,
            full_name: fullName,
            role: 'admin',
          });

        if (updateError) throw updateError;

        return {
          user: {
            id: signUpData.user.id,
            email,
            fullName,
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
          error: null,
        };
      }

      if (!authData.user) throw new Error('User creation failed');

      // Create profile with admin role
      const { error: profileError } = await supabase!
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: 'admin',
        });

      if (profileError) throw profileError;

      console.log('[adminApi] Admin user created successfully');
      return {
        user: {
          id: authData.user.id,
          email,
          fullName,
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error('[adminApi] Error creating admin user:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: new Error('Supabase not configured') };
    }

    try {
      console.log('[adminApi] Updating user role:', userId, '->', newRole);

      const { error } = await supabase!
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      console.log('[adminApi] User role updated successfully');
      return { success: true, error: null };
    } catch (error) {
      console.error('[adminApi] Error updating user role:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Get project statistics (admin only)
   */
  async getProjectStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    revision: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    if (!isSupabaseConfigured()) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0, revision: 0, cancelled: 0, totalRevenue: 0 };
    }

    try {
      const { data: projects, error } = await supabase!
        .from('projects')
        .select('status, final_price');

      if (error) throw error;

      const stats = {
        total: projects?.length || 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        revision: 0,
        cancelled: 0,
        totalRevenue: 0,
      };

      projects?.forEach((p) => {
        switch (p.status) {
          case 'pending': stats.pending++; break;
          case 'in_progress': stats.inProgress++; break;
          case 'completed': stats.completed++; stats.totalRevenue += p.final_price; break;
          case 'revision': stats.revision++; break;
          case 'cancelled': stats.cancelled++; break;
        }
      });

      return stats;
    } catch (error) {
      console.error('[adminApi] Error fetching stats:', error);
      return { total: 0, pending: 0, inProgress: 0, completed: 0, revision: 0, cancelled: 0, totalRevenue: 0 };
    }
  },

  /**
   * Get first admin ID (for auto-assignment)
   */
  async getFirstAdminId(): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data.id;
    } catch (error) {
      console.error('[adminApi] Error getting first admin:', error);
      return null;
    }
  },
};
