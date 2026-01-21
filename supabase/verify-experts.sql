-- =====================================================
-- VERIFICATION QUERIES - Mock Experts Migration
-- =====================================================
-- Quick reference queries to verify the expert migration
-- Copy and paste these into Supabase SQL Editor
-- =====================================================

-- 1. COUNT ALL EXPERTS (Should be 14)
SELECT COUNT(*) as total_experts FROM experts;

-- 2. COUNT EXPERTS BY SERVICE
SELECT 
  s.title as service, 
  COUNT(es.expert_id) as expert_count
FROM services s
LEFT JOIN expert_specializations es ON s.id = es.service_id
GROUP BY s.id, s.title
ORDER BY s.title;

-- Expected:
-- Academic Research Validation    | 2
-- AI Training & Optimization      | 2
-- Content Humanization            | 3
-- Documents & Compliance          | 3
-- Graphic Design Refinement       | 2
-- Video & Audio Polish            | 2

-- 3. VIEW ALL EXPERTS WITH DETAILS
SELECT 
  e.id,
  e.name,
  e.rating,
  e.completed_projects,
  e.response_time,
  e.availability,
  e.expertise,
  ARRAY_AGG(s.title) as services
FROM experts e
LEFT JOIN expert_specializations es ON e.id = es.expert_id
LEFT JOIN services s ON es.service_id = s.id
GROUP BY e.id, e.name, e.rating, e.completed_projects, e.response_time, e.availability, e.expertise
ORDER BY e.name;

-- 4. CHECK SPECIFIC EXPERT BY ID
SELECT * FROM experts WHERE id = 'expert-legal-1';

-- 5. FIND EXPERTS BY SERVICE
SELECT 
  e.id,
  e.name,
  e.rating,
  e.completed_projects,
  e.availability
FROM experts e
JOIN expert_specializations es ON e.id = es.expert_id
WHERE es.service_id = 'documents-compliance'
ORDER BY e.rating DESC, e.completed_projects DESC;

-- 6. CHECK EXPERT AVAILABILITY
SELECT 
  availability,
  COUNT(*) as count
FROM experts
GROUP BY availability;

-- Expected:
-- available | 12
-- busy      | 2

-- 7. TOP RATED EXPERTS
SELECT 
  e.name,
  e.rating,
  e.completed_projects,
  s.title as service
FROM experts e
JOIN expert_specializations es ON e.id = es.expert_id
JOIN services s ON es.service_id = s.id
WHERE e.rating >= 4.9
ORDER BY e.rating DESC, e.completed_projects DESC;

-- 8. EXPERTS WITH MOST PROJECTS
SELECT 
  name,
  completed_projects,
  rating,
  availability
FROM experts
ORDER BY completed_projects DESC
LIMIT 5;

-- Expected top: Olivia Martinez (612), Emily Thompson (521)

-- 9. CHECK ALL EXPERT IDS (Should match frontend mock data)
SELECT id FROM experts ORDER BY id;

-- Expected IDs:
-- expert-academic-1, expert-academic-2
-- expert-ai-1, expert-ai-2
-- expert-content-1, expert-content-2, expert-content-3
-- expert-design-1, expert-design-2
-- expert-legal-1, expert-legal-2, expert-legal-3
-- expert-video-1, expert-video-2

-- 10. VERIFY EXPERT_SPECIALIZATIONS (Should be 14 records)
SELECT COUNT(*) as total_specializations FROM expert_specializations;

-- 11. CHECK FOR ORPHANED SPECIALIZATIONS (Should be 0)
SELECT es.*
FROM expert_specializations es
LEFT JOIN experts e ON es.expert_id = e.id
WHERE e.id IS NULL;

-- 12. CHECK FOR EXPERTS WITHOUT SPECIALIZATIONS (Should be 0)
SELECT e.*
FROM experts e
LEFT JOIN expert_specializations es ON e.id = es.expert_id
WHERE es.expert_id IS NULL;

-- 13. VERIFY RLS POLICIES ARE ACTIVE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('experts', 'expert_specializations')
ORDER BY tablename, policyname;

-- 14. CHECK DATA TYPES (Verify TEXT id)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'experts'
ORDER BY ordinal_position;

-- 15. FULL EXPERT PROFILE (Example: Sarah Mitchell)
SELECT 
  e.*,
  ARRAY_AGG(s.id) as service_ids,
  ARRAY_AGG(s.title) as service_titles
FROM experts e
LEFT JOIN expert_specializations es ON e.id = es.expert_id
LEFT JOIN services s ON es.service_id = s.id
WHERE e.id = 'expert-legal-1'
GROUP BY e.id;

-- =====================================================
-- CLEANUP QUERIES (Use with caution!)
-- =====================================================

-- Remove all seeded experts (ROLLBACK)
-- DELETE FROM expert_specializations;
-- DELETE FROM experts;

-- Remove specific expert
-- DELETE FROM experts WHERE id = 'expert-legal-1';

-- =====================================================
-- QUICK HEALTH CHECK
-- =====================================================

-- Run this to verify everything is working
SELECT 
  'Experts' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM experts WHERE active = TRUE) as active_count
FROM experts
UNION ALL
SELECT 
  'Expert Specializations' as table_name,
  COUNT(*) as record_count,
  COUNT(*) as active_count
FROM expert_specializations
UNION ALL
SELECT 
  'Services' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM services WHERE active = TRUE) as active_count
FROM services;

-- Expected:
-- Experts                  | 14 | 14
-- Expert Specializations   | 14 | 14
-- Services                 | 6  | 6
