import { supabase, isSupabaseConfigured } from './supabase';
import { experts as mockExperts } from '@/data/experts';
import { Expert } from '@/types';

export const expertsApi = {
  /**
   * Fetch all active experts
   */
  async getAll(): Promise<Expert[]> {
    if (!isSupabaseConfigured()) {
      console.log('Using mock experts data');
      return mockExperts;
    }

    try {
      const { data, error } = await supabase!
        .from('experts')
        .select(`
          *,
          expert_specializations (
            service_id
          )
        `)
        .eq('active', true);

      if (error) throw error;

      return data.map((expert) => ({
        id: expert.id,
        name: expert.name,
        bio: expert.bio,
        avatar: expert.avatar_url || undefined,
        rating: expert.rating,
        completedProjects: expert.completed_projects,
        responseTime: expert.response_time,
        expertise: expert.expertise,
        availability: expert.availability as 'available' | 'busy' | 'offline',
        specializations: expert.expert_specializations.map((s: any) => s.service_id),
      }));
    } catch (error) {
      console.error('Error fetching experts:', error);
      return mockExperts;
    }
  },

  /**
   * Fetch experts by service ID
   */
  async getByService(serviceId: string): Promise<Expert[]> {
    if (!isSupabaseConfigured()) {
      return mockExperts.filter((expert) =>
        expert.specializations.includes(serviceId)
      );
    }

    try {
      const { data, error } = await supabase!
        .from('experts')
        .select(`
          *,
          expert_specializations!inner (
            service_id
          )
        `)
        .eq('expert_specializations.service_id', serviceId)
        .eq('active', true);

      if (error) throw error;

      return data.map((expert) => ({
        id: expert.id,
        name: expert.name,
        bio: expert.bio,
        avatar: expert.avatar_url || undefined,
        rating: expert.rating,
        completedProjects: expert.completed_projects,
        responseTime: expert.response_time,
        expertise: expert.expertise,
        availability: expert.availability as 'available' | 'busy' | 'offline',
        specializations: [serviceId],
      }));
    } catch (error) {
      console.error('Error fetching experts by service:', error);
      return mockExperts.filter((expert) =>
        expert.specializations.includes(serviceId)
      );
    }
  },

  /**
   * Fetch a single expert by ID
   */
  async getById(id: string): Promise<Expert | null> {
    if (!isSupabaseConfigured()) {
      return mockExperts.find((e) => e.id === id) || null;
    }

    try {
      const { data, error } = await supabase!
        .from('experts')
        .select(`
          *,
          expert_specializations (
            service_id
          )
        `)
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        bio: data.bio,
        avatar: data.avatar_url || undefined,
        rating: data.rating,
        completedProjects: data.completed_projects,
        responseTime: data.response_time,
        expertise: data.expertise,
        availability: data.availability as 'available' | 'busy' | 'offline',
        specializations: data.expert_specializations.map((s: any) => s.service_id),
      };
    } catch (error) {
      console.error('Error fetching expert:', error);
      return mockExperts.find((e) => e.id === id) || null;
    }
  },
};
