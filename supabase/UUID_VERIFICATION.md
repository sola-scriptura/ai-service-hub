# UUID Expert Migration - Verification Checklist

## Quick Verification Queries

Run these queries in Supabase SQL Editor to confirm data integrity:

### 1. Count Total Experts (Should be 14)
```sql
SELECT COUNT(*) as total_experts FROM experts;
```

### 2. Count Expert Specializations (Should be 14)
```sql
SELECT COUNT(*) as total_specializations FROM expert_specializations;
```

### 3. Verify UUID Format
```sql
SELECT id, name FROM experts LIMIT 3;
-- IDs should be UUID format: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 4. Count Experts by Service
```sql
SELECT 
  s.title as service, 
  COUNT(es.expert_id) as expert_count
FROM services s
LEFT JOIN expert_specializations es ON s.id = es.service_id
GROUP BY s.id, s.title
ORDER BY s.title;
```

**Expected Results:**
- Academic Research Validation: 2
- AI Training & Optimization: 2
- Content Humanization: 3
- Documents & Compliance: 3
- Graphic Design Refinement: 2
- Video & Audio Polish: 2

### 5. Verify Specific Expert Data
```sql
SELECT * FROM experts WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- Should return Sarah Mitchell, rating 4.9, 342 projects
```

### 6. Check Foreign Key Integrity
```sql
SELECT 
  es.expert_id,
  e.name,
  es.service_id,
  s.title
FROM expert_specializations es
JOIN experts e ON es.expert_id = e.id
JOIN services s ON es.service_id = s.id
ORDER BY e.name;
-- Should return 14 rows with no NULL values
```

### 7. Verify No Orphaned Records
```sql
-- Check for expert_specializations without valid expert
SELECT COUNT(*) as orphaned_specializations
FROM expert_specializations es
LEFT JOIN experts e ON es.expert_id = e.id
WHERE e.id IS NULL;
-- Should return 0
```

### 8. Check Data Types
```sql
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'experts' AND column_name = 'id';
-- Should show data_type = 'uuid'
```

## Success Criteria

✅ **Migration is successful when:**
- Total experts: 14
- Total specializations: 14
- All expert IDs are valid UUIDs
- All services have correct expert counts (3,3,2,2,2,2)
- No orphaned specializations
- Foreign key relationships intact
- Sample expert data matches (Sarah Mitchell, 4.9 rating, 342 projects)

## Rollback (If Needed)

```sql
DELETE FROM expert_specializations;
DELETE FROM experts;
SELECT COUNT(*) FROM experts; -- Should return 0
```

## Frontend Verification

After database migration, verify frontend still works:
- [ ] Expert cards display correctly
- [ ] Expert names, ratings, projects show
- [ ] Service filtering works
- [ ] No console errors
- [ ] Expert details load properly

**Note:** Frontend now uses UUID IDs internally but user experience remains unchanged.