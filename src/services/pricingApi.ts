import { supabase, isSupabaseConfigured } from './supabase';
import { pricingRules as mockPricingRules, calculatePrice as mockCalculatePrice } from '@/data/pricing';
import { PricingRule } from '@/types';

export const pricingApi = {
  /**
   * Fetch all pricing rules
   */
  async getAll(): Promise<PricingRule[]> {
    if (!isSupabaseConfigured()) {
      console.log('Using mock pricing rules');
      return mockPricingRules;
    }

    try {
      const { data, error } = await supabase!
        .from('pricing_rules')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      return data.map((rule) => ({
        serviceId: rule.service_id,
        basePrice: rule.base_price,
        unit: rule.unit,
        quantityBased: rule.quantity_based,
        urgencyMultipliers: {
          standard: rule.urgency_standard_multiplier,
          rush: rule.urgency_rush_multiplier,
          express: rule.urgency_express_multiplier,
        },
        complexityMultipliers: {
          basic: rule.complexity_basic_multiplier,
          standard: rule.complexity_standard_multiplier,
          complex: rule.complexity_complex_multiplier,
        },
      }));
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      return mockPricingRules;
    }
  },

  /**
   * Fetch pricing rule for a specific service
   */
  async getByService(serviceId: string): Promise<PricingRule | null> {
    if (!isSupabaseConfigured()) {
      return mockPricingRules.find((r) => r.serviceId === serviceId) || null;
    }

    try {
      const { data, error } = await supabase!
        .from('pricing_rules')
        .select('*')
        .eq('service_id', serviceId)
        .eq('active', true)
        .single();

      if (error) throw error;

      return {
        serviceId: data.service_id,
        basePrice: data.base_price,
        unit: data.unit,
        quantityBased: data.quantity_based,
        urgencyMultipliers: {
          standard: data.urgency_standard_multiplier,
          rush: data.urgency_rush_multiplier,
          express: data.urgency_express_multiplier,
        },
        complexityMultipliers: {
          basic: data.complexity_basic_multiplier,
          standard: data.complexity_standard_multiplier,
          complex: data.complexity_complex_multiplier,
        },
      };
    } catch (error) {
      console.error('Error fetching pricing rule:', error);
      return mockPricingRules.find((r) => r.serviceId === serviceId) || null;
    }
  },

  /**
   * Calculate price (uses mock calculation logic for now)
   */
  calculatePrice: mockCalculatePrice,
};
