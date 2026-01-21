# Supabase Backend Setup Guide

## Phase 1: Database Foundation Complete ✅

This document explains the Supabase backend architecture, database schema, and setup instructions.

---

## 📊 Database Schema Overview

### Core Tables

#### 1. **profiles** (extends auth.users)
- Stores user information for both clients and experts
- Links to Supabase Auth
- Fields: id, email, full_name, role, avatar_url
- **Role Types:** `client`, `expert`, `admin`

#### 2. **services**
- Stores service offerings (Documents, Content, Video, etc.)
- Fields: id, title, description, features[], icon, featured, badge
- Public read access

#### 3. **pricing_rules**
- Service-based pricing configuration
- Fields: service_id, base_price, unit, quantity_based, multipliers
- One pricing rule per service
- Supports urgency and complexity multipliers

#### 4. **experts**
- Expert profiles with ratings and availability
- Fields: id, user_id, name, bio, rating, completed_projects, expertise[], availability
- **Availability:** `available`, `busy`, `offline`

#### 5. **expert_specializations** (Junction Table)
- Many-to-many relationship between experts and services
- Fields: expert_id, service_id
- Allows experts to specialize in multiple services

#### 6. **projects**
- Client project submissions
- Fields: client_id, expert_id, service_id, title, quantity, urgency, complexity, prices, status
- **Status:** `pending`, `in_progress`, `completed`, `revision`, `cancelled`
- Tracks full project lifecycle

#### 7. **project_files**
- File attachments for projects (for future implementation)
- Fields: project_id, file_name, file_url, uploaded_by

---

## 🔐 Authentication & Authorization Strategy

### User Roles

**1. Client (Default)**
- Can browse services and experts
- Can create and manage their own projects
- Can view their project history
- Cannot access other clients' data

**2. Expert**
- Can view assigned projects
- Can update project status
- Can upload deliverables
- Cannot access other experts' projects

**3. Admin (Future)**
- Full access to all data
- Can manage services, pricing, and experts
- Can assign projects to experts

### Row Level Security (RLS) Policies

**Profiles:**
- Users can view and update their own profile only

**Services & Pricing:**
- Public read access (no authentication required)

**Experts:**
- Public read access for active experts

**Projects:**
- Clients can only see their own projects
- Experts can only see projects assigned to them
- Enforced at database level (cannot be bypassed)

**Project Files:**
- Only project participants (client + assigned expert) can access files

---

## 🔗 Relationships & Constraints

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
    ├─→ projects (1:many) as client
    └─→ experts (1:1) as expert
            ↓
            ├─→ expert_specializations (many:many) ←→ services
            └─→ projects (1:many) as assigned expert

services (1:many) ←→ pricing_rules
services (1:many) ←→ projects
projects (1:many) ←→ project_files
```

### Key Constraints

- **Cascading Deletes:** Deleting a user cascades to profiles and projects
- **Unique Constraints:** One pricing rule per service, unique expert-service pairs
- **Foreign Keys:** All relationships enforced at database level
- **Check Constraints:** Rating must be 0-5, prices must be positive

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning (~2 minutes)
4. Note your project URL and anon key

### Step 2: Run Database Schema

1. Open Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute the SQL script
4. Verify tables are created in Table Editor

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Verify Setup

1. Check that all tables exist in Supabase dashboard
2. Verify RLS policies are enabled
3. Test authentication (sign up/sign in)
4. Seed initial data (services and pricing rules are auto-seeded)

---

## 📁 Data Access Layer Architecture

### Service Layer Structure

```
src/services/
├── supabase.ts          # Supabase client configuration
├── authApi.ts           # Authentication (sign up, sign in, sign out)
├── servicesApi.ts       # Services CRUD
├── expertsApi.ts        # Experts CRUD
├── pricingApi.ts        # Pricing rules and calculations
└── projectsApi.ts       # Project management
```

### Fallback Strategy

All API services include fallback to mock data:
- If Supabase is not configured → uses mock data
- If API call fails → falls back to mock data
- Ensures frontend works during development

### Usage Example

```typescript
import { servicesApi } from '@/services/servicesApi';

// Automatically uses Supabase if configured, otherwise mock data
const services = await servicesApi.getAll();
```

---

## 🎯 Phase 1 Completion Criteria

### ✅ Completed

- [x] Database schema designed and documented
- [x] SQL migration script created
- [x] Supabase client configured
- [x] Data access layers implemented
- [x] Authentication service created
- [x] RLS policies defined
- [x] Fallback to mock data working
- [x] TypeScript types generated

### ❌ Not Implemented (Next Phases)

- [ ] Frontend UI for authentication
- [ ] Project submission form
- [ ] File upload functionality
- [ ] Expert dashboard
- [ ] Client dashboard
- [ ] Real-time updates
- [ ] Payment integration

---

## 🛑 Stop Point for Phase 1

**Phase 1 is complete when:**

1. ✅ Database schema is deployed to Supabase
2. ✅ All tables and RLS policies are active
3. ✅ Supabase client is configured in frontend
4. ✅ Data access layers are implemented
5. ✅ Mock data fallback is working
6. ✅ Frontend still uses mock data (no breaking changes)

**Ready to proceed to Phase 2:**
- Implement authentication UI
- Connect frontend to Supabase APIs
- Build project submission flow

---

## 📝 Notes

- **Mock data is still active** - Frontend continues to work without Supabase
- **No UI changes** - All changes are backend infrastructure only
- **Pricing logic unchanged** - Still service-based, not expert-based
- **Expert selection independent** - Experts don't affect pricing

---

## 🔧 Troubleshooting

**Issue:** "Supabase not configured" warning
- **Solution:** Add environment variables to `.env` file

**Issue:** RLS policies blocking access
- **Solution:** Verify user is authenticated and has correct role

**Issue:** Foreign key constraint errors
- **Solution:** Ensure referenced records exist before inserting

**Issue:** Mock data not loading
- **Solution:** Check that mock data files are still in `src/data/`

---

## 🔄 Mock Experts Migration

### Overview

The project includes 14 mock experts in `src/data/experts.ts`. To migrate these into Supabase:

**Migration Files:**
- `MIGRATION_SUMMARY.md` - Complete overview and quick start
- `MOCK_EXPERTS_MIGRATION.md` - Comprehensive migration guide
- `MIGRATION_CHECKLIST.md` - Step-by-step checklist
- `patch-experts-text-id.sql` - Schema patch (UUID → TEXT ids)
- `seed-experts.sql` - Expert data seed script
- `verify-experts.sql` - Verification queries

### Quick Migration

**Option A: Fresh Database**
1. Update schema.sql (change experts.id to TEXT)
2. Deploy schema.sql
3. Run seed-experts.sql

**Option B: Existing Database**
1. Run patch-experts-text-id.sql
2. Run seed-experts.sql

**Verify:**
```sql
SELECT COUNT(*) FROM experts;  -- Should be 14
```

**See:** `MIGRATION_SUMMARY.md` for complete instructions.

---

## Next Steps

After Phase 1 completion, proceed to:
1. **Phase 2:** Authentication UI and user management
2. **Phase 3:** Project submission and expert assignment
3. **Phase 3.5:** Mock experts migration (optional, for testing)
4. **Phase 4:** File uploads and project tracking
5. **Phase 5:** Payment integration and notifications
