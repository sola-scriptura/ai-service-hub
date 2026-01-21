// Database types generated from Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'client' | 'expert' | 'admin';
export type ExpertAvailability = 'available' | 'busy' | 'offline';
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'revision' | 'cancelled';
export type UrgencyLevel = 'standard' | 'rush' | 'express';
export type ComplexityLevel = 'basic' | 'standard' | 'complex';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          features: string[];
          icon: string;
          featured: boolean;
          badge: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          features: string[];
          icon: string;
          featured?: boolean;
          badge?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          features?: string[];
          icon?: string;
          featured?: boolean;
          badge?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_rules: {
        Row: {
          id: string;
          service_id: string;
          base_price: number;
          unit: string;
          quantity_based: boolean;
          urgency_standard_multiplier: number;
          urgency_rush_multiplier: number;
          urgency_express_multiplier: number;
          complexity_basic_multiplier: number;
          complexity_standard_multiplier: number;
          complexity_complex_multiplier: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          base_price: number;
          unit: string;
          quantity_based?: boolean;
          urgency_standard_multiplier?: number;
          urgency_rush_multiplier?: number;
          urgency_express_multiplier?: number;
          complexity_basic_multiplier?: number;
          complexity_standard_multiplier?: number;
          complexity_complex_multiplier?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          base_price?: number;
          unit?: string;
          quantity_based?: boolean;
          urgency_standard_multiplier?: number;
          urgency_rush_multiplier?: number;
          urgency_express_multiplier?: number;
          complexity_basic_multiplier?: number;
          complexity_standard_multiplier?: number;
          complexity_complex_multiplier?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      experts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          bio: string;
          avatar_url: string | null;
          rating: number;
          completed_projects: number;
          response_time: string;
          expertise: string[];
          availability: ExpertAvailability;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          bio: string;
          avatar_url?: string | null;
          rating?: number;
          completed_projects?: number;
          response_time: string;
          expertise: string[];
          availability?: ExpertAvailability;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          bio?: string;
          avatar_url?: string | null;
          rating?: number;
          completed_projects?: number;
          response_time?: string;
          expertise?: string[];
          availability?: ExpertAvailability;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expert_specializations: {
        Row: {
          id: string;
          expert_id: string;
          service_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          service_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          service_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          expert_id: string | null;
          assigned_admin_id: string | null;
          service_id: string;
          title: string;
          description: string | null;
          quantity: number;
          urgency: UrgencyLevel;
          complexity: ComplexityLevel;
          base_price: number;
          final_price: number;
          status: ProjectStatus;
          submitted_at: string;
          started_at: string | null;
          completed_at: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          expert_id?: string | null;
          assigned_admin_id?: string | null;
          service_id: string;
          title: string;
          description?: string | null;
          quantity?: number;
          urgency?: UrgencyLevel;
          complexity?: ComplexityLevel;
          base_price: number;
          final_price: number;
          status?: ProjectStatus;
          submitted_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          expert_id?: string | null;
          assigned_admin_id?: string | null;
          service_id?: string;
          title?: string;
          description?: string | null;
          quantity?: number;
          urgency?: UrgencyLevel;
          complexity?: ComplexityLevel;
          base_price?: number;
          final_price?: number;
          status?: ProjectStatus;
          submitted_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_notifications: {
        Row: {
          id: string;
          recipient_email: string;
          recipient_name: string | null;
          subject: string;
          body: string;
          notification_type: string;
          project_id: string | null;
          status: string;
          error_message: string | null;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_email: string;
          recipient_name?: string | null;
          subject: string;
          body: string;
          notification_type: string;
          project_id?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          subject?: string;
          body?: string;
          notification_type?: string;
          project_id?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_url: string;
          file_size: number | null;
          file_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          file_name?: string;
          file_url?: string;
          file_size?: number | null;
          file_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      get_admin_email: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      get_first_admin_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      get_my_profile: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      expert_availability: ExpertAvailability;
      project_status: ProjectStatus;
      urgency_level: UrgencyLevel;
      complexity_level: ComplexityLevel;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
