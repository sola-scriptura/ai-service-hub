-- =====================================================
-- SEED MOCK EXPERTS INTO SUPABASE (UUID VERSION)
-- =====================================================
-- This script inserts 14 mock experts using valid UUID IDs
-- Compatible with the existing UUID schema
-- Run this in Supabase SQL Editor after schema.sql
-- =====================================================

-- Insert experts with explicit UUID IDs (matching frontend mock data)
INSERT INTO experts (id, user_id, name, bio, avatar_url, rating, completed_projects, response_time, expertise, availability) VALUES

-- Documents & Compliance Experts
('a1b2c3d4-e5f6-4890-abcd-ef1234567890', NULL, 'Sarah Mitchell', 'Licensed attorney with 12+ years in corporate law and compliance', NULL, 4.9, 342, '2 hours', ARRAY['Contract Review', 'Legal Compliance', 'Risk Assessment'], 'available'),
('b2c3d4e5-f6a7-4901-bcde-f23456789012', NULL, 'David Chen', 'Former corporate counsel specializing in regulatory compliance', NULL, 4.8, 289, '4 hours', ARRAY['Regulatory Compliance', 'Policy Review', 'Legal Documentation'], 'available'),
('c3d4e5f6-a7b8-4012-cdef-345678901234', NULL, 'Jennifer Rodriguez', 'IP attorney with expertise in tech contracts and compliance', NULL, 5.0, 156, '1 hour', ARRAY['IP Law', 'Tech Contracts', 'Compliance Audits'], 'busy'),

-- Content Humanization Experts
('d4e5f6a7-b8c9-4123-defa-456789012345', NULL, 'Emily Thompson', 'Senior copywriter with 10+ years in content marketing', NULL, 4.9, 521, '3 hours', ARRAY['SEO Writing', 'Brand Voice', 'Content Strategy'], 'available'),
('e5f6a7b8-c9d0-4234-efab-567890123456', NULL, 'Marcus Johnson', 'Content strategist specializing in B2B and technical writing', NULL, 4.7, 438, '5 hours', ARRAY['Technical Writing', 'B2B Content', 'Thought Leadership'], 'available'),
('f6a7b8c9-d0e1-4345-fabc-678901234567', NULL, 'Olivia Martinez', 'Award-winning copywriter with expertise in storytelling', NULL, 4.8, 612, '2 hours', ARRAY['Storytelling', 'Brand Messaging', 'Creative Copy'], 'available'),

-- Video & Audio Polish Experts
('a7b8c9d0-e1f2-4456-abcd-789012345678', NULL, 'Alex Rivera', 'Professional video editor with broadcast experience', NULL, 5.0, 234, '6 hours', ARRAY['Video Editing', 'Color Grading', 'Motion Graphics'], 'available'),
('b8c9d0e1-f2a3-4567-bcde-890123456789', NULL, 'Sophia Lee', 'Audio engineer and video editor specializing in podcasts', NULL, 4.9, 198, '4 hours', ARRAY['Audio Mixing', 'Sound Design', 'Video Production'], 'available'),

-- Graphic Design Refinement Experts
('c9d0e1f2-a3b4-4678-cdef-901234567890', NULL, 'Isabella Garcia', 'Senior graphic designer with brand identity expertise', NULL, 4.8, 387, '3 hours', ARRAY['Brand Design', 'Print Design', 'Digital Assets'], 'available'),
('d0e1f2a3-b4c5-4789-defa-012345678901', NULL, 'Ethan Williams', 'Creative director with 15+ years in design', NULL, 4.9, 421, '2 hours', ARRAY['UI/UX Design', 'Brand Guidelines', 'Visual Identity'], 'available'),

-- AI Training & Optimization Experts
('e1f2a3b4-c5d6-4890-efab-123456789012', NULL, 'Dr. Michael Zhang', 'PhD in Machine Learning, former Google AI researcher', NULL, 5.0, 89, '8 hours', ARRAY['Model Training', 'Neural Networks', 'AI Optimization'], 'busy'),
('f2a3b4c5-d6e7-4901-fabc-234567890123', NULL, 'Rachel Kumar', 'ML engineer specializing in NLP and computer vision', NULL, 4.9, 67, '12 hours', ARRAY['NLP', 'Computer Vision', 'Model Fine-tuning'], 'available'),

-- Academic Research Validation Experts
('a3b4c5d6-e7f8-4012-abcd-345678901234', NULL, 'Dr. Patricia Anderson', 'PhD in Molecular Biology, published researcher', NULL, 5.0, 145, '24 hours', ARRAY['Research Methodology', 'Peer Review', 'Citation Analysis'], 'available'),
('b4c5d6e7-f8a9-4123-bcde-456789012345', NULL, 'Dr. James Wilson', 'Professor of Economics with 20+ years in academia', NULL, 4.8, 178, '18 hours', ARRAY['Statistical Analysis', 'Research Design', 'Academic Writing'], 'available');

-- =====================================================
-- EXPERT SPECIALIZATIONS (Link experts to services)
-- =====================================================

INSERT INTO expert_specializations (expert_id, service_id) VALUES

-- Documents & Compliance Experts
('a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'documents-compliance'),
('b2c3d4e5-f6a7-4901-bcde-f23456789012', 'documents-compliance'),
('c3d4e5f6-a7b8-4012-cdef-345678901234', 'documents-compliance'),

-- Content Humanization Experts
('d4e5f6a7-b8c9-4123-defa-456789012345', 'content-humanization'),
('e5f6a7b8-c9d0-4234-efab-567890123456', 'content-humanization'),
('f6a7b8c9-d0e1-4345-fabc-678901234567', 'content-humanization'),

-- Video & Audio Polish Experts
('a7b8c9d0-e1f2-4456-abcd-789012345678', 'video-audio-polish'),
('b8c9d0e1-f2a3-4567-bcde-890123456789', 'video-audio-polish'),

-- Graphic Design Refinement Experts
('c9d0e1f2-a3b4-4678-cdef-901234567890', 'graphic-design-refinement'),
('d0e1f2a3-b4c5-4789-defa-012345678901', 'graphic-design-refinement'),

-- AI Training & Optimization Experts
('e1f2a3b4-c5d6-4890-efab-123456789012', 'ai-training-optimization'),
('f2a3b4c5-d6e7-4901-fabc-234567890123', 'ai-training-optimization'),

-- Academic Research Validation Experts
('a3b4c5d6-e7f8-4012-abcd-345678901234', 'academic-research-validation'),
('b4c5d6e7-f8a9-4123-bcde-456789012345', 'academic-research-validation');