# Festify Database Setup Guide

## 📋 Overview

This guide will help you set up a **100% accurate** Supabase database for the Festify application. The schema has been carefully designed by analyzing the entire frontend codebase to ensure perfect compatibility.

## 🎯 What's Included

The `complete-database-schema.sql` file contains:

### **Tables (15 total)**
1. **colleges** - College/University information
2. **profiles** - User profiles (extends auth.users)
3. **categories** - Event categories (Tech, Cultural, Sports, etc.)
4. **events** - Core event information with pricing
5. **team_pricing_tiers** - Custom team size pricing tiers
6. **registrations** - Event registrations (individual & team)
7. **teams** - Detailed team information
8. **team_members** - Individual team member details
9. **tickets** - Event tickets with QR codes
10. **payments** - Payment transaction records
11. **event_updates** - Event announcements/updates
12. **reviews** - Event ratings and reviews
13. **favorites** - User favorite events
14. **notifications** - User notifications

### **Enums (7 types)**
- `user_role`: admin, attendee, organizer
- `event_status`: draft, published, cancelled, completed
- `participation_type`: individual, team, both
- `registration_status`: pending, confirmed, cancelled, attended
- `payment_status`: pending, processing, completed, failed, refunded
- `ticket_type`: free, paid, vip, early_bird
- `notification_type`: 12 different notification types

### **Key Features**
✅ **Individual & Team Registrations** - Full support for both types
✅ **Flexible Pricing System** - Individual, team base, per-member, and custom tier pricing
✅ **Payment Tracking** - Complete payment workflow with status tracking
✅ **Team Management** - Team creation with leader and member details
✅ **College-Specific Events** - Events can be global or college-specific
✅ **QR Code Tickets** - Ticket generation with comprehensive data
✅ **Row Level Security** - All tables properly secured
✅ **Auto-triggers** - Automatic profile creation, timestamp updates
✅ **Helper Functions** - Price calculation, team creation, etc.

## 🚀 Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Create a new project or select your existing Festify project

### Step 2: Run the Schema

1. In your Supabase project, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the **entire contents** of `complete-database-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)

The script will:
- Create all enums
- Create all tables with proper relationships
- Add indexes for performance
- Set up Row Level Security policies
- Create helper functions and triggers
- Insert seed data (categories and colleges)

### Step 3: Verify Setup

After running the script, verify:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if seed data was inserted
SELECT * FROM categories;
SELECT * FROM colleges;
```

You should see:
- 14+ tables in the public schema
- 5 categories
- 13 colleges

### Step 4: Update Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema Diagram

### Core Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (User Details)
    ↓
    ├─→ events (as organizer)
    │       ↓
    │       ├─→ registrations
    │       │       ↓
    │       │       ├─→ teams
    │       │       │       ↓
    │       │       │       └─→ team_members
    │       │       ├─→ tickets
    │       │       └─→ payments
    │       ├─→ team_pricing_tiers
    │       ├─→ event_updates
    │       ├─→ reviews
    │       └─→ favorites
    └─→ notifications

categories ──→ events
colleges ───→ events
colleges ───→ profiles
```

## 🔑 Key Database Features

### 1. Flexible Event Participation

Events support three participation types:
- **individual**: Only individual registrations
- **team**: Only team registrations (with min/max team size)
- **both**: Users can register individually OR as a team

```typescript
// Frontend example
participation_type: 'both'
team_size_min: 2
team_size_max: 5
```

### 2. Advanced Pricing System

Three pricing models:

**Individual Pricing:**
```sql
individual_price: 500.00
```

**Standard Team Pricing:**
```sql
team_base_price: 1000.00
price_per_member: 200.00
-- Total for 4 members: 1000 + (4 * 200) = 1800
```

**Custom Tier Pricing:**
```sql
has_custom_team_pricing: true
-- Tiers in team_pricing_tiers table:
-- 2-3 members: ₹1200
-- 4-5 members: ₹2000
-- 6-8 members: ₹2800
```

### 3. Registration Flow

**Individual Registration:**
```sql
INSERT INTO registrations (event_id, user_id, is_team, team_size, payment_amount)
VALUES ('event-id', 'user-id', false, 1, 500.00);
```

**Team Registration:**
```sql
-- 1. Create registration
INSERT INTO registrations (event_id, user_id, is_team, team_size, team_name, ...)
VALUES ('event-id', 'user-id', true, 4, 'Team Alpha', ...);

-- 2. Create team (via function)
SELECT create_team_with_members(
  p_registration_id := 'reg-id',
  p_team_name := 'Team Alpha',
  p_team_leader_name := 'John Doe',
  p_team_leader_email := 'john@example.com',
  p_event_id := 'event-id',
  p_members := '[{"name": "Jane", "email": "jane@example.com", ...}]'::jsonb
);
```

### 4. Payment Processing

The registration table includes payment fields for quick access:
```sql
payment_status: 'completed'
payment_amount: 1800.00
payment_method: 'razorpay'
transaction_id: 'txn_abc123'
paid_at: '2024-11-07T10:30:00Z'
```

Detailed payment records are also stored in the `payments` table.

### 5. Team Management

**Teams Table:**
- Links to registration
- Stores team leader details
- Contains team metadata

**Team Members Table:**
- Individual member details
- University registration numbers
- Leader flag
- Join timestamps

### 6. College-Specific Events

Events can be:
- **Global** (`is_global: true`) - Available to all users
- **College-specific** (`is_global: false, college_id: 'xyz'`) - Only for that college's students

The frontend automatically filters events based on user eligibility.

## 🛡️ Security (RLS Policies)

All tables have Row Level Security enabled:

### User Access Patterns

**Profiles:**
- ✅ Everyone can view all profiles
- ✅ Users can update their own profile

**Events:**
- ✅ Everyone can view published events
- ✅ Organizers can view their draft events
- ✅ Organizers can create/edit/delete their own events

**Registrations:**
- ✅ Users can view their own registrations
- ✅ Event organizers can view all registrations for their events
- ✅ Users can only create registrations for themselves

**Teams:**
- ✅ Team leaders can view/edit their teams
- ✅ Team members can view their teams
- ✅ Event organizers can view teams for their events

**Payments & Tickets:**
- ✅ Users can view their own tickets/payments
- ✅ Event organizers can view tickets/payments for their events

## 📝 Common Queries

### Get all published events with details
```sql
SELECT 
  e.*,
  c.name as category_name,
  col.name as college_name,
  p.full_name as organizer_name,
  p.organization_name
FROM events e
JOIN categories c ON c.id = e.category_id
LEFT JOIN colleges col ON col.id = e.college_id
JOIN profiles p ON p.id = e.organizer_id
WHERE e.event_status = 'published'
  AND e.end_date >= NOW()
ORDER BY e.start_date;
```

### Get user's registrations with event details
```sql
SELECT 
  r.*,
  e.title as event_title,
  e.start_date,
  e.location
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = 'user-id'
ORDER BY r.created_at DESC;
```

### Get team details including all members
```sql
SELECT get_team_details('team-id');
```

### Calculate registration price
```sql
-- Individual
SELECT calculate_registration_price('event-id', false, 1);

-- Team of 4
SELECT calculate_registration_price('event-id', true, 4);
```

## 🔄 Migration from Old Schema

If you have an existing database:

### Option 1: Fresh Setup (Recommended)
1. **Backup your data** if needed
2. Drop all existing tables
3. Run `complete-database-schema.sql`
4. Re-import any custom data

### Option 2: Incremental Migration
1. Compare your current schema with the new one
2. Add missing columns/tables individually
3. Run missing functions/policies
4. Test thoroughly

## 🧪 Testing the Setup

### 1. Create a Test User
```sql
-- User profile will be auto-created via trigger
-- when they sign up through Supabase Auth
```

### 2. Create a Test Event
```sql
INSERT INTO events (
  title,
  description,
  organizer_id,
  category_id,
  start_date,
  end_date,
  location,
  event_status,
  participation_type,
  individual_price,
  team_base_price,
  price_per_member,
  team_size_min,
  team_size_max
) VALUES (
  'Test Hackathon',
  'A test event for verification',
  'organizer-user-id',
  (SELECT id FROM categories WHERE name = 'Tech' LIMIT 1),
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '9 days',
  'Test Venue',
  'published',
  'both',
  500,
  1000,
  200,
  2,
  5
);
```

### 3. Test Registration
```sql
-- Individual
INSERT INTO registrations (event_id, user_id, is_team, team_size)
VALUES ('event-id', 'user-id', false, 1);

-- Team (use the create_team_with_members function)
```

## 🐛 Troubleshooting

### Issue: "relation already exists"
**Solution:** Some tables already exist. Either drop them first or use `CREATE TABLE IF NOT EXISTS`.

### Issue: RLS policies blocking queries
**Solution:** Make sure you're authenticated and check the policies match your use case.

### Issue: Foreign key constraint violations
**Solution:** Ensure referenced records exist (e.g., category exists before creating event).

### Issue: Enum type already exists
**Solution:** The script handles this with `DO $$ BEGIN ... END $$` blocks. Safe to re-run.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Verification Checklist

After setup, verify:

- [ ] All 14+ tables created
- [ ] All 7 enum types exist
- [ ] 5 categories inserted
- [ ] 13 colleges inserted
- [ ] RLS enabled on all tables
- [ ] Triggers created successfully
- [ ] Functions created successfully
- [ ] Test event can be created
- [ ] Test registration works
- [ ] Frontend connects successfully

## 🎉 You're Ready!

Your Festify database is now set up and ready to use. The schema is designed to work perfectly with the frontend code without any modifications needed.

For any issues or questions, check the troubleshooting section or review the frontend code in `/src/lib/supabase/types.ts` for the TypeScript type definitions.

---

**Last Updated:** November 7, 2024
**Schema Version:** 1.0.0
**Compatible With:** Festify Frontend (all versions)
