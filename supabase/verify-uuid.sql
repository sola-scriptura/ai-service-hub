-- Verification queries for UUID expert migration
-- Run these after seed-experts-uuid.sql

-- 1. Count experts (should be 14)
SELECT COUNT(*) as total_experts FROM experts;

-- 2. Count specializations (should be 14)
SELECT COUNT(*) as total_specializations FROM expert_specializations;

-- 3. Count by service (should be 3,3,2,2,2,2)
SELECT s.title, COUNT(es.expert_id) as count
FROM services s
LEFT JOIN expert_specializations es ON s.id = es.service_id
GROUP BY s.title
ORDER BY s.title;

-- 4. Verify Sarah Mitchell
SELECT name, rating, completed_projects 
FROM experts 
WHERE id = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

-- 5. Check for orphaned records (should be 0)
SELECT COUNT(*) as orphaned
FROM expert_specializations es
LEFT JOIN experts e ON es.expert_id = e.id
WHERE e.id IS NULL;