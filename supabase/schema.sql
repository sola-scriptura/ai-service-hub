-- =====================================================
-- AI Service Hub - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('client', 'expert', 'admin');
CREATE TYPE expert_availability AS ENUM ('available', 'busy', 'offline');
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'revision', 'cancelled');
CREATE TYPE urgency_level AS ENUM ('standard', 'rush', 'express');
CREATE TYPE complexity_level AS ENUM ('basic', 'standard', 'complex');

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- SERVICES TABLE
-- =====================================================

CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL,
  icon TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  badge TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Services are public (read-only for clients)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (active = TRUE);

-- =====================================================
-- PRICING RULES TABLE
-- =====================================================

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  base_price INTEGER NOT NULL,
  unit TEXT NOT NULL,
  quantity_based BOOLEAN NOT NULL DEFAULT TRUE,
  urgency_standard_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  urgency_rush_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5,
  urgency_express_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0,
  complexity_basic_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  complexity_standard_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.3,
  complexity_complex_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.8,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_id)
);

-- RLS: Pricing rules are public
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing rules are viewable by everyone"
  ON pricing_rules FOR SELECT
  USING (active = TRUE);

-- =====================================================
-- EXPERTS TABLE
-- =====================================================

CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  rating DECIMAL(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  completed_projects INTEGER NOT NULL DEFAULT 0,
  response_time TEXT NOT NULL,
  expertise TEXT[] NOT NULL,
  availability expert_availability NOT NULL DEFAULT 'available',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Experts are viewable by everyone
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts are viewable by everyone"
  ON experts FOR SELECT
  USING (active = TRUE);

-- =====================================================
-- EXPERT SPECIALIZATIONS (Many-to-Many)
-- =====================================================

CREATE TABLE expert_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(expert_id, service_id)
);

-- RLS: Specializations are viewable by everyone
ALTER TABLE expert_specializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expert specializations are viewable by everyone"
  ON expert_specializations FOR SELECT
  USING (TRUE);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL REFERENCES services(id),
  
  -- Project details
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  urgency urgency_level NOT NULL DEFAULT 'standard',
  complexity complexity_level NOT NULL DEFAULT 'standard',
  
  -- Pricing
  base_price INTEGER NOT NULL,
  final_price INTEGER NOT NULL,
  
  -- Status
  status project_status NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Clients see their own projects, experts see assigned projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Experts can view assigned projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = projects.expert_id
      AND experts.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = client_id);

-- =====================================================
-- PROJECT FILES TABLE (for future file uploads)
-- =====================================================

CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Only project participants can view files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view files"
  ON project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND (projects.client_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM experts
             WHERE experts.id = projects.expert_id
             AND experts.user_id = auth.uid()
           ))
    )
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_experts_availability ON experts(availability);
CREATE INDEX idx_expert_specializations_service ON expert_specializations(service_id);
CREATE INDEX idx_expert_specializations_expert ON expert_specializations(expert_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_expert ON projects(expert_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_files_project ON project_files(project_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - for initial setup)
-- =====================================================

-- Insert services
INSERT INTO services (id, title, description, features, icon, featured, badge) VALUES
('documents-compliance', 'Documents & Compliance', 'Legal, technical, and business documents reviewed for accuracy and compliance', 
 ARRAY['Licensed attorneys review', 'Regulatory compliance check', 'Risk mitigation analysis'], 
 'document', TRUE, 'Most Popular'),
('content-humanization', 'Content Humanization', 'AI content fact-checked and refined for authentic human voice',
 ARRAY['Professional copywriters', 'Brand voice alignment', 'SEO optimization'],
 'edit', FALSE, NULL),
('video-audio-polish', 'Video & Audio Polish', 'AI-generated media edited to broadcast-quality standards',
 ARRAY['Professional video editors', 'Audio enhancement', 'Color grading'],
 'video', FALSE, NULL),
('graphic-design-refinement', 'Graphic Design Refinement', 'AI visuals elevated to professional brand standards',
 ARRAY['Expert designers', 'Brand guideline compliance', 'Print/digital optimization'],
 'image', FALSE, NULL),
('ai-training-optimization', 'AI Training & Optimization', 'Custom AI models fine-tuned for your specific needs',
 ARRAY['ML engineers & data scientists', 'Custom model training', 'Performance optimization'],
 'box', FALSE, NULL),
('academic-research-validation', 'Academic Research Validation', 'Scholarly work verified for accuracy and academic rigor',
 ARRAY['PhDs & subject experts', 'Citation verification', 'Methodology review'],
 'book', FALSE, NULL);

-- Insert pricing rules
INSERT INTO pricing_rules (service_id, base_price, unit, quantity_based, 
  urgency_rush_multiplier, urgency_express_multiplier,
  complexity_standard_multiplier, complexity_complex_multiplier) VALUES
('documents-compliance', 99, 'document', TRUE, 1.5, 2.0, 1.3, 1.8),
('content-humanization', 49, '1000 words', TRUE, 1.4, 1.8, 1.2, 1.5),
('video-audio-polish', 149, 'video', TRUE, 1.6, 2.2, 1.4, 2.0),
('graphic-design-refinement', 79, 'design', TRUE, 1.5, 2.0, 1.3, 1.7),
('ai-training-optimization', 499, 'project', FALSE, 1.4, 1.8, 1.5, 2.5),
('academic-research-validation', 199, 'paper', TRUE, 1.5, 2.0, 1.4, 1.9);
