# Mock Experts to Supabase Migration - Summary

## 📋 Overview

This migration moves **14 mock experts** from `src/data/experts.ts` into Supabase as real database records. All expert IDs, names, ratings, and relationships are preserved exactly as they appear in the frontend mock data.

**Key Goal:** Enable the frontend to load experts from Supabase without any UI changes.

## 📊 Mock Expert Data Analysis

### Structure Identified
```typescript
interface Expert {
  id: string;                    // e.g., 'expert-legal-1'
  name: string;                  // e.g., 'Sarah Mitchell'
  avatar?: string;               // undefined in mock data
  specializations: string[];     // service IDs: ['documents-compliance']
  rating: number;                // 4.7 - 5.0
  completedProjects: number;     // 67 - 612
  responseTime: string;          // e.g., '2 hours'
  bio: string;                   // Professional bio
  expertise: string[];           // e.g., ['Contract Review', 'Legal Compliance']
  availability: 'available' | 'busy' | 'offline';
}
```

### Expert Distribution
- **Documents & Compliance:** 3 experts (Sarah Mitchell, David Chen, Jennifer Rodriguez)
- **Content Humanization:** 3 experts (Emily Thompson, Marcus Johnson, Olivia Martinez)
- **Video & Audio Polish:** 2 experts (Alex Rivera, Sophia Lee)
- **Graphic Design Refinement:** 2 experts (Isabella Garcia, Ethan Williams)
- **AI Training & Optimization:** 2 experts (Dr. Michael Zhang, Rachel Kumar)
- **Academic Research Validation:** 2 experts (Dr. Patricia Anderson, Dr. James Wilson)

**Total:** 14 experts

### Preserved IDs
All original string IDs are preserved:
- `expert-legal-1`, `expert-legal-2`, `expert-legal-3`
- `expert-content-1`, `expert-content-2`, `expert-content-3`
- `expert-video-1`, `expert-video-2`
- `expert-design-1`, `expert-design-2`
- `expert-ai-1`, `expert-ai-2`
- `expert-academic-1`, `expert-academic-2`

## 🗄️ Database Schema

### Tables Involved

#### 1. `experts` table
```sql
CREATE TABLE experts (
  id TEXT PRIMARY KEY,              -- Changed from UUID to TEXT
  user_id UUID,                     -- NULL for mock experts
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,                  -- NULL for mock experts
  rating DECIMAL(2,1),              -- 4.7 - 5.0
  completed_projects INTEGER,       -- Project count
  response_time TEXT,               -- e.g., '2 hours'
  expertise TEXT[],                 -- Array of expertise tags
  availability expert_availability, -- 'available' | 'busy' | 'offline'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### 2. `expert_specializations` table (join table)
```sql
CREATE TABLE expert_specializations (
  id UUID PRIMARY KEY,
  expert_id TEXT,                   -- Links to experts.id
  service_id TEXT,                  -- Links to services.id
  created_at TIMESTAMPTZ,
  UNIQUE(expert_id, service_id)
);
```

### Key Schema Change
**Original schema used UUID for experts.id, but mock data uses TEXT ids.**

**Solution:** Patch the schema to use TEXT ids before seeding.

## 📁 Migration Files Created

### 1. `patch-experts-text-id.sql`
**Purpose:** Modifies the experts table to use TEXT ids instead of UUID.

**When to use:**
- If you already deployed schema.sql with UUID ids
- Run this BEFORE seed-experts.sql

**What it does:**
- Drops and recreates `experts` table with TEXT id
- Drops and recreates `expert_specializations` table
- Updates `projects.expert_id` to TEXT
- Recreates all indexes and RLS policies

### 2. `seed-experts.sql`
**Purpose:** Inserts all 14 mock experts into Supabase.

**What it inserts:**
- 14 expert records with original IDs
- 14 expert_specializations records (linking experts to services)

**Data preserved:**
- All names, bios, ratings
- All completed project counts
- All response times
- All expertise arrays
- All availability statuses

### 3. `verify-experts.sql`
**Purpose:** Verification queries to confirm migration success.

**Includes:**
- Count queries (total experts, experts by service)
- Detail queries (view all experts, check specific expert)
- Health check queries (verify RLS, check data types)
- Cleanup queries (rollback if needed)

### 4. `MOCK_EXPERTS_MIGRATION.md`
**Purpose:** Comprehensive migration guide.

**Contents:**
- Overview and data summary
- Step-by-step migration instructions
- Verification checklist
- Troubleshooting guide
- Frontend integration notes

### 5. `MIGRATION_CHECKLIST.md`
**Purpose:** Quick setup checklist.

**Contents:**
- Pre-migration checklist
- Step-by-step migration (Option A: Fresh, Option B: Existing)
- Post-migration verification
- Troubleshooting quick fixes
- Success criteria

## 🚀 Quick Start Guide

### Option A: Fresh Database (Recommended)

1. **Update schema.sql** (3 changes):
   ```sql
   -- Line 103: Change experts.id
   id TEXT PRIMARY KEY,
   
   -- Line 133: Change expert_specializations.expert_id
   expert_id TEXT NOT NULL REFERENCES experts(id),
   
   -- Line 161: Change projects.expert_id
   expert_id TEXT REFERENCES experts(id),
   ```

2. **Deploy schema.sql** in Supabase SQL Editor

3. **Run seed-experts.sql** in Supabase SQL Editor

4. **Verify:**
   ```sql
   SELECT COUNT(*) FROM experts;  -- Should be 14
   ```

### Option B: Existing Database

1. **Run patch-experts-text-id.sql** in Supabase SQL Editor

2. **Run seed-experts.sql** in Supabase SQL Editor

3. **Verify:**
   ```sql
   SELECT COUNT(*) FROM experts;  -- Should be 14
   ```

## ✅ Verification Checklist

After migration, verify:

- [ ] 14 experts inserted
- [ ] 14 expert_specializations inserted
- [ ] Expert IDs are TEXT format (not UUID)
- [ ] All services have correct expert counts
- [ ] RLS policies are active
- [ ] Sample expert data is correct (e.g., Sarah Mitchell)
- [ ] Frontend loads experts without errors
- [ ] Expert cards display correctly
- [ ] No console warnings

## 🔧 Where to Run SQL Scripts

**Supabase Dashboard:**
1. Go to your Supabase project
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Copy and paste SQL script
5. Click "Run" or press Ctrl+Enter

**Scripts to run in order:**
1. `patch-experts-text-id.sql` (if schema already deployed)
2. `seed-experts.sql`
3. `verify-experts.sql` (optional, for verification)

## 🎯 What Was NOT Changed

✅ **No frontend changes required**
- UI components unchanged
- No new pages or features
- Pricing logic unchanged
- Services unchanged

✅ **No authentication added**
- Experts are not real users (user_id is NULL)
- No expert login/dashboard
- No expert authentication

✅ **No new features**
- This is data migration only
- Expert assignment comes in Phase 4
- Expert dashboards come in future phases

## 📝 Important Notes

### Mock Expert Characteristics
- **user_id:** NULL (not linked to auth.users)
- **avatar_url:** NULL (no avatars in mock data)
- **active:** TRUE (all experts are active)
- **Purpose:** Testing and demo only

### Frontend Integration
The frontend already expects this exact data structure. Once seeded, experts will be available via Supabase queries with no code changes needed.

### Future Phases
- **Phase 4:** Project submission and expert assignment
- **Phase 5:** Expert authentication and dashboards
- **Phase 6:** Real expert onboarding

## 🐛 Troubleshooting

### Common Issues

**"duplicate key value violates unique constraint"**
- Experts already seeded
- Solution: Run cleanup queries in verify-experts.sql

**"invalid input syntax for type uuid"**
- Schema still uses UUID for experts.id
- Solution: Run patch-experts-text-id.sql

**"foreign key constraint violation"**
- Services not seeded yet
- Solution: Run schema.sql first (includes service seeds)

**Frontend shows no experts**
- RLS policies not active or Supabase connection issue
- Solution: Check RLS policies and .env configuration

## 📚 Documentation Files

All documentation is in `supabase/` directory:

1. **MIGRATION_SUMMARY.md** (this file) - Overview
2. **MOCK_EXPERTS_MIGRATION.md** - Comprehensive guide
3. **MIGRATION_CHECKLIST.md** - Quick checklist
4. **patch-experts-text-id.sql** - Schema patch
5. **seed-experts.sql** - Data seed script
6. **verify-experts.sql** - Verification queries

## 🎉 Success Criteria

Migration is successful when:
- ✅ 14 experts in database
- ✅ 14 expert_specializations records
- ✅ All expert IDs are TEXT format
- ✅ Frontend loads experts without errors
- ✅ Expert cards display correctly
- ✅ No console warnings or errors
- ✅ All services show correct expert counts

## 🔄 Next Steps

After successful migration:

1. ✅ Experts now load from Supabase (not mock data)
2. ✅ Frontend continues to work unchanged
3. ✅ Ready for Phase 4: Project submission
4. ✅ Ready to assign projects to experts
5. ✅ Ready for expert dashboard (future phase)

---

**Migration Status:** Ready to Execute ✅

**Estimated Time:** 5-10 minutes

**Risk Level:** Low (no frontend changes, reversible)

**Testing Required:** Yes (verify expert display in UI)
