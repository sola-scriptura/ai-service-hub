# Mock Experts Migration - Quick Setup Checklist

## Pre-Migration Checklist

- [ ] Supabase project is set up and running
- [ ] Database schema is deployed (schema.sql)
- [ ] Services table has 6 services seeded
- [ ] You have access to Supabase SQL Editor
- [ ] You have backed up any existing data (if applicable)

## Migration Steps

### Option A: Fresh Database (Recommended)

If you haven't deployed the schema yet or can start fresh:

1. [ ] **Update schema.sql** - Change experts.id from UUID to TEXT
   - Line 103: `id TEXT PRIMARY KEY,`
   - Line 133: `expert_id TEXT NOT NULL REFERENCES experts(id)`
   - Line 161: `expert_id TEXT REFERENCES experts(id)`

2. [ ] **Deploy schema.sql** in Supabase SQL Editor
   - Copy entire schema.sql
   - Paste into SQL Editor
   - Execute

3. [ ] **Run seed-experts.sql** in Supabase SQL Editor
   - Copy entire seed-experts.sql
   - Paste into SQL Editor
   - Execute

4. [ ] **Verify** - Run quick health check:
   ```sql
   SELECT COUNT(*) FROM experts;  -- Should be 14
   SELECT COUNT(*) FROM expert_specializations;  -- Should be 14
   ```

### Option B: Existing Database

If you already have the schema deployed with UUID ids:

1. [ ] **Run patch-experts-text-id.sql** in Supabase SQL Editor
   - Copy entire patch-experts-text-id.sql
   - Paste into SQL Editor
   - Execute
   - This will drop and recreate tables with TEXT ids

2. [ ] **Run seed-experts.sql** in Supabase SQL Editor
   - Copy entire seed-experts.sql
   - Paste into SQL Editor
   - Execute

3. [ ] **Verify** - Run quick health check:
   ```sql
   SELECT COUNT(*) FROM experts;  -- Should be 14
   SELECT COUNT(*) FROM expert_specializations;  -- Should be 14
   ```

## Post-Migration Verification

### Database Checks

- [ ] **14 experts inserted**
  ```sql
  SELECT COUNT(*) FROM experts;
  ```

- [ ] **14 specializations inserted**
  ```sql
  SELECT COUNT(*) FROM expert_specializations;
  ```

- [ ] **Expert IDs are TEXT format**
  ```sql
  SELECT id FROM experts LIMIT 1;  -- Should be 'expert-legal-1' not UUID
  ```

- [ ] **All services have experts**
  ```sql
  SELECT s.title, COUNT(es.expert_id) as expert_count
  FROM services s
  LEFT JOIN expert_specializations es ON s.id = es.service_id
  GROUP BY s.id, s.title;
  ```
  Expected: Documents (3), Content (3), Video (2), Design (2), AI (2), Academic (2)

- [ ] **RLS policies are active**
  ```sql
  SELECT tablename, policyname 
  FROM pg_policies 
  WHERE tablename = 'experts';
  ```

- [ ] **Sample expert data is correct**
  ```sql
  SELECT * FROM experts WHERE id = 'expert-legal-1';
  ```
  Expected: Sarah Mitchell, rating 4.9, 342 projects

### Frontend Checks (After Migration)

- [ ] **No console errors** when loading pages
- [ ] **Services page** shows correct expert counts
- [ ] **Expert cards** display names, ratings, projects
- [ ] **Expert filtering** by service works
- [ ] **Expert details** show bio, expertise, availability
- [ ] **No "undefined" or "null"** values in UI

## Troubleshooting

### Issue: "duplicate key value violates unique constraint"
**Solution:** Experts already exist. Run cleanup first:
```sql
DELETE FROM expert_specializations;
DELETE FROM experts;
```

### Issue: "invalid input syntax for type uuid"
**Solution:** Run patch-experts-text-id.sql to change id type to TEXT.

### Issue: "foreign key constraint violation"
**Solution:** Ensure services are seeded first. Check:
```sql
SELECT COUNT(*) FROM services;  -- Should be 6
```

### Issue: Frontend shows no experts
**Solutions:**
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'experts';`
- Verify experts are active: `SELECT COUNT(*) FROM experts WHERE active = TRUE;`
- Check Supabase connection in frontend .env file

### Issue: Wrong expert count
**Solution:** Run verification query:
```sql
SELECT 
  s.title, 
  COUNT(es.expert_id) as count
FROM services s
LEFT JOIN expert_specializations es ON s.id = es.service_id
GROUP BY s.title;
```

## Quick Reference

### Files Created
- `supabase/patch-experts-text-id.sql` - Schema patch for TEXT ids
- `supabase/seed-experts.sql` - Expert data seed script
- `supabase/verify-experts.sql` - Verification queries
- `supabase/MOCK_EXPERTS_MIGRATION.md` - Full documentation
- `supabase/MIGRATION_CHECKLIST.md` - This file

### Expert IDs (for reference)
```
Documents & Compliance:
  - expert-legal-1 (Sarah Mitchell)
  - expert-legal-2 (David Chen)
  - expert-legal-3 (Jennifer Rodriguez)

Content Humanization:
  - expert-content-1 (Emily Thompson)
  - expert-content-2 (Marcus Johnson)
  - expert-content-3 (Olivia Martinez)

Video & Audio Polish:
  - expert-video-1 (Alex Rivera)
  - expert-video-2 (Sophia Lee)

Graphic Design Refinement:
  - expert-design-1 (Isabella Garcia)
  - expert-design-2 (Ethan Williams)

AI Training & Optimization:
  - expert-ai-1 (Dr. Michael Zhang)
  - expert-ai-2 (Rachel Kumar)

Academic Research Validation:
  - expert-academic-1 (Dr. Patricia Anderson)
  - expert-academic-2 (Dr. James Wilson)
```

### Key SQL Commands

**Count experts:**
```sql
SELECT COUNT(*) FROM experts;
```

**View all experts:**
```sql
SELECT id, name, rating, completed_projects FROM experts ORDER BY name;
```

**Check expert by service:**
```sql
SELECT e.name, e.rating 
FROM experts e
JOIN expert_specializations es ON e.id = es.expert_id
WHERE es.service_id = 'documents-compliance';
```

**Rollback (delete all):**
```sql
DELETE FROM expert_specializations;
DELETE FROM experts;
```

## Success Criteria

✅ Migration is successful when:
- 14 experts in database
- 14 expert_specializations records
- All expert IDs are TEXT format (e.g., 'expert-legal-1')
- Frontend loads experts without errors
- Expert cards display correctly
- No console warnings or errors
- All services show correct expert counts

## Next Steps After Migration

1. ✅ Update frontend to fetch experts from Supabase (instead of mock data)
2. ✅ Test expert filtering and display
3. ✅ Verify project assignment works with expert IDs
4. ✅ Ready for Phase 4: Project submission
5. ✅ Ready for expert assignment to projects

---

**Status:** Ready to migrate ✅

**Estimated Time:** 5-10 minutes

**Risk Level:** Low (no frontend changes required)
