-- =====================================================
-- SEED MOCK EXPERTS INTO SUPABASE
-- =====================================================
-- This script migrates the existing mock experts from 
-- src/data/experts.ts into the Supabase database.
-- Run this in Supabase SQL Editor after schema.sql
-- =====================================================

-- Insert experts (using TEXT ids to match frontend expectations)
-- Note: We're using the original string IDs from the mock data

-- Documents & Compliance Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-legal-1', NULL, 'Sarah Mitchell', 'Licensed attorney with 12+ years in corporate law and compliance', NULL, 4.9, 342, '2 hours', ARRAY['Contract Review', 'Legal Compliance', 'Risk Assessment'], 'available'),
('expert-legal-2', NULL, 'David Chen', 'Former corporate counsel specializing in regulatory compliance', NULL, 4.8, 289, '4 hours', ARRAY['Regulatory Compliance', 'Policy Review', 'Legal Documentation'], 'available'),
('expert-legal-3', NULL, 'Jennifer Rodriguez', 'IP attorney with expertise in tech contracts and compliance', NULL, 5.0, 156, '1 hour', ARRAY['IP Law', 'Tech Contracts', 'Compliance Audits'], 'busy');

-- Content Humanization Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-content-1', NULL, 'Emily Thompson', 'Senior copywriter with 10+ years in content marketing', NULL, 4.9, 521, '3 hours', ARRAY['SEO Writing', 'Brand Voice', 'Content Strategy'], 'available'),
('expert-content-2', NULL, 'Marcus Johnson', 'Content strategist specializing in B2B and technical writing', NULL, 4.7, 438, '5 hours', ARRAY['Technical Writing', 'B2B Content', 'Thought Leadership'], 'available'),
('expert-content-3', NULL, 'Olivia Martinez', 'Award-winning copywriter with expertise in storytelling', NULL, 4.8, 612, '2 hours', ARRAY['Storytelling', 'Brand Messaging', 'Creative Copy'], 'available');

-- Video & Audio Polish Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-video-1', NULL, 'Alex Rivera', 'Professional video editor with broadcast experience', NULL, 5.0, 234, '6 hours', ARRAY['Video Editing', 'Color Grading', 'Motion Graphics'], 'available'),
('expert-video-2', NULL, 'Sophia Lee', 'Audio engineer and video editor specializing in podcasts', NULL, 4.9, 198, '4 hours', ARRAY['Audio Mixing', 'Sound Design', 'Video Production'], 'available');

-- Graphic Design Refinement Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-design-1', NULL, 'Isabella Garcia', 'Senior graphic designer with brand identity expertise', NULL, 4.8, 387, '3 hours', ARRAY['Brand Design', 'Print Design', 'Digital Assets'], 'available'),
('expert-design-2', NULL, 'Ethan Williams', 'Creative director with 15+ years in design', NULL, 4.9, 421, '2 hours', ARRAY['UI/UX Design', 'Brand Guidelines', 'Visual Identity'], 'available');

-- AI Training & Optimization Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-ai-1', NULL, 'Dr. Michael Zhang', 'PhD in Machine Learning, former Google AI researcher', NULL, 5.0, 89, '8 hours', ARRAY['Model Training', 'Neural Networks', 'AI Optimization'], 'busy'),
('expert-ai-2', NULL, 'Rachel Kumar', 'ML engineer specializing in NLP and computer vision', NULL, 4.9, 67, '12 hours', ARRAY['NLP', 'Computer Vision', 'Model Fine-tuning'], 'available');

-- Academic Research Validation Experts
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES
('expert-academic-1', NULL, 'Dr. Patricia Anderson', 'PhD in Molecular Biology, published researcher', NULL, 5.0, 145, '24 hours', ARRAY['Research Methodology', 'Peer Review', 'Citation Analysis'], 'available'),
('expert-academic-2', NULL, 'Dr. James Wilson', 'Professor of Economics with 20+ years in academia', NULL, 4.8, 178, '18 hours', ARRAY['Statistical Analysis', 'Research Design', 'Academic Writing'], 'available');

-- =====================================================
-- EXPERT SPECIALIZATIONS (Link experts to services)
-- =====================================================

-- Documents & Compliance Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-legal-1', 'documents-compliance'),
('expert-legal-2', 'documents-compliance'),
('expert-legal-3', 'documents-compliance');

-- Content Humanization Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-content-1', 'content-humanization'),
('expert-content-2', 'content-humanization'),
('expert-content-3', 'content-humanization');

-- Video & Audio Polish Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-video-1', 'video-audio-polish'),
('expert-video-2', 'video-audio-polish');

-- Graphic Design Refinement Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-design-1', 'graphic-design-refinement'),
('expert-design-2', 'graphic-design-refinement');

-- AI Training & Optimization Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-ai-1', 'ai-training-optimization'),
('expert-ai-2', 'ai-training-optimization');

-- Academic Research Validation Experts
INSERT INTO expert_specializations (expert_id, service_id) VALUES
('expert-academic-1', 'academic-research-validation'),
('expert-academic-2', 'academic-research-validation');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count experts by service
-- SELECT s.title, COUNT(es.expert_id) as expert_count
-- FROM services s
-- LEFT JOIN expert_specializations es ON s.id = es.service_id
-- GROUP BY s.id, s.title
-- ORDER BY s.title;

-- View all experts with their specializations
-- SELECT e.name, e.rating, e.completed_projects, e.availability, 
--        ARRAY_AGG(s.title) as services
-- FROM experts e
-- LEFT JOIN expert_specializations es ON e.id = es.expert_id
-- LEFT JOIN services s ON es.service_id = s.id
-- GROUP BY e.id, e.name, e.rating, e.completed_projects, e.availability
-- ORDER BY e.name;
