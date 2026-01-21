import { supabase, isSupabaseConfigured } from './supabase';
import { services as mockServices } from '@/data/services';
import { Service } from '@/types';

export const servicesApi = {
  /**
   * Fetch all active services
   * Falls back to mock data if Supabase is not configured
   */
  async getAll(): Promise<Service[]> {
    if (!isSupabaseConfigured()) {
      console.log('Using mock services data');
      return mockServices;
    }

    try {
      const { data, error } = await supabase!
        .from('services')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false });

      if (error) throw error;

      // Transform database format to frontend format
      return data.map((service) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        features: service.features,
        icon: service.icon,
        featured: service.featured,
        badge: service.badge || undefined,
        price: 'From $99', // This will be calculated from pricing_rules
        priceLabel: 'per service',
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return mockServices; // Fallback to mock data
    }
  },

  /**
   * Fetch a single service by ID
   */
  async getById(id: string): Promise<Service | null> {
    if (!isSupabaseConfigured()) {
      return mockServices.find((s) => s.id === id) || null;
    }

    try {
      const { data, error } = await supabase!
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        features: data.features,
        icon: data.icon,
        featured: data.featured,
        badge: data.badge || undefined,
        price: 'From $99',
        priceLabel: 'per service',
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      return mockServices.find((s) => s.id === id) || null;
    }
  },
};
