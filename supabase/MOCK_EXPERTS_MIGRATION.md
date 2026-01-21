# Mock Experts Migration to Supabase

## Overview
This guide migrates the 14 mock experts from `src/data/experts.ts` into Supabase as real database records, preserving all IDs and structure so the frontend continues to work without changes.

## Mock Expert Data Summary

### Total Experts: 14

**By Service:**
- Documents & Compliance: 3 experts
- Content Humanization: 3 experts
- Video & Audio Polish: 2 experts
- Graphic Design Refinement: 2 experts
- AI Training & Optimization: 2 experts
- Academic Research Validation: 2 experts

**Expert IDs Preserved:**
- `expert-legal-1`, `expert-legal-2`, `expert-legal-3`
- `expert-content-1`, `expert-content-2`, `expert-content-3`
- `expert-video-1`, `expert-video-2`
- `expert-design-1`, `expert-design-2`
- `expert-ai-1`, `expert-ai-2`
- `expert-academic-1`, `expert-academic-2`

## Database Schema Changes

### Key Change: experts.id from UUID → TEXT
The original schema used UUID for `experts.id`, but the frontend mock data uses TEXT ids like `'expert-legal-1'`. We need to patch the schema to use TEXT ids.

**Tables Affected:**
- `experts` - Primary key changed to TEXT
- `expert_specializations` - Foreign key changed to TEXT
- `projects` - Foreign key changed to TEXT

## Migration Steps

### Step 1: Run Schema Patch (If Schema Already Deployed)

**If you already ran `schema.sql`:**

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/patch-experts-text-id.sql`
3. Execute the entire script
4. This will:
   - Drop and recreate `experts` table with TEXT id
   - Drop and recreate `expert_specializations` table
   - Update `projects.expert_id` to TEXT
   - Recreate all indexes and policies

**If you haven't deployed schema yet:**

Skip this step and use the updated schema in Step 1b.

### Step 1b: Alternative - Update schema.sql Directly

If starting fresh, modify `schema.sql` before deployment:

**Change line 103:**
```sql
-- OLD:
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- NEW:
id TEXT PRIMARY KEY,
```

**Change line 133:**
```sql
-- OLD:
expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

-- NEW:
expert_id TEXT NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
```

**Change line 161:**
```sql
-- OLD:
expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,

-- NEW:
expert_id TEXT REFERENCES experts(id) ON DELETE SET NULL,
```

Then run the full `schema.sql`.

### Step 2: Seed Mock Experts

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/seed-experts.sql`
3. Execute the entire script
4. This will insert:
   - 14 experts with original IDs
   - 14 expert_specializations records (linking experts to services)

### Step 3: Verify Data

Run these queries in Supabase SQL Editor:

**Count experts by service:**
```sql
SELECT s.title, COUNT(es.expert_id) as expert_count
FROM services s
LEFT JOIN expert_specializations es ON s.id = es.service_id
GROUP BY s.id, s.title
ORDER BY s.title;
```

**Expected output:**
```
Academic Research Validation    | 2
AI Training & Optimization      | 2
Content Humanization            | 3
Documents & Compliance          | 3
Graphic Design Refinement       | 2
Video & Audio Polish            | 2
```

**View all experts:**
```sql
SELECT e.id, e.name, e.rating, e.completed_projects, e.availability, 
       ARRAY_AGG(s.title) as services
FROM experts e
LEFT JOIN expert_specializations es ON e.id = es.expert_id
LEFT JOIN services s ON es.service_id = s.id
GROUP BY e.id, e.name, e.rating, e.completed_projects, e.availability
ORDER BY e.name;
```

**Check specific expert:**
```sql
SELECT * FROM experts WHERE id = 'expert-legal-1';
```

## Frontend Integration (No Changes Required)

The frontend already expects experts with these exact IDs and structure. Once seeded, the experts will be available via Supabase queries.

**Current frontend structure (preserved):**
```typescript
interface Expert {
  id: string;                    // ✅ Matches TEXT id in DB
  name: string;                  // ✅ Matches
  avatar?: string;               // ✅ Matches avatar_url (nullable)
  specializations: string[];     // ✅ Fetched via expert_specializations join
  rating: number;                // ✅ Matches
  completedProjects: number;     // ✅ Matches completed_projects
  responseTime: string;          // ✅ Matches response_time
  bio: string;                   // ✅ Matches
  expertise: string[];           // ✅ Matches (TEXT[] array)
  availability: 'available' | 'busy' | 'offline';  // ✅ Matches enum
}
```

## Verification Checklist

After running the migration:

- [ ] **Schema Updated**: experts.id is TEXT (not UUID)
- [ ] **14 Experts Inserted**: All mock experts in database
- [ ] **14 Specializations Inserted**: Each expert linked to correct service
- [ ] **IDs Preserved**: Original IDs like 'expert-legal-1' work
- [ ] **Ratings Preserved**: All ratings match (4.7 - 5.0)
- [ ] **Projects Count Preserved**: completed_projects match mock data
- [ ] **Availability Preserved**: 'available' or 'busy' status correct
- [ ] **Expertise Arrays Preserved**: All expertise tags present
- [ ] **RLS Policies Active**: Experts viewable by everyone
- [ ] **No Frontend Changes**: UI still works with same data

## Testing Frontend Integration

Once seeded, test that experts load correctly:

1. **Services Page**: Each service should show correct number of experts
2. **Expert Cards**: Names, ratings, projects, response times display
3. **Expert Filtering**: Filter by service shows correct experts
4. **Expert Details**: Bio, expertise, availability show correctly
5. **No Console Errors**: No database query errors

## Rollback (If Needed)

If you need to remove the seeded experts:

```sql
-- Delete all expert specializations
DELETE FROM expert_specializations;

-- Delete all experts
DELETE FROM experts;

-- Verify
SELECT COUNT(*) FROM experts;  -- Should return 0
```

## Important Notes

### ✅ What Was Preserved
- All 14 expert IDs (e.g., 'expert-legal-1')
- All expert names, bios, ratings
- All completed project counts
- All response times
- All expertise arrays
- All availability statuses
- All service specializations

### ✅ What Was NOT Changed
- No new UI components
- No authentication for experts
- No expert dashboards
- No pricing logic changes
- No new features added
- Frontend code unchanged

### ⚠️ Important Constraints
- `user_id` is NULL for all seeded experts (they're not real users)
- These are test/demo experts only
- Real expert authentication comes in future phases
- Experts cannot sign in (no auth.users record)

## Next Steps

After successful migration:

1. ✅ Experts now load from Supabase (not mock data)
2. ✅ Frontend continues to work unchanged
3. ✅ Ready for Phase 4: Project submission
4. ✅ Ready to assign projects to experts
5. ✅ Ready for expert dashboard (future phase)

## Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- Solution: Experts already seeded. Run rollback first.

**Error: "invalid input syntax for type uuid"**
- Solution: Run `patch-experts-text-id.sql` first to change id type.

**Error: "foreign key constraint violation"**
- Solution: Ensure services are seeded first (from schema.sql).

**Frontend shows no experts:**
- Check RLS policies are enabled
- Verify experts.active = TRUE
- Check Supabase connection in frontend

**Expert count doesn't match:**
- Run verification query to count experts
- Should be exactly 14 experts total

## Files Created

1. **`supabase/patch-experts-text-id.sql`** - Schema patch for TEXT ids
2. **`supabase/seed-experts.sql`** - Expert data seed script
3. **`supabase/MOCK_EXPERTS_MIGRATION.md`** - This guide

## Summary

This migration moves 14 mock experts into Supabase while preserving all IDs, names, ratings, and relationships. The frontend requires no changes and will seamlessly transition from mock data to real database records.

**Status: Ready for Testing** ✅
