# Festify Database Setup

This directory contains all database-related files for the Festify event management platform.

## 📁 Files

- **`complete-database-schema.sql`** - Complete production-ready database schema (981 lines)
  - 15 tables with full relationships
  - 7 enum types for type safety
  - Row Level Security (RLS) policies
  - Helper functions and triggers
  - Seed data for categories and colleges

- **`DATABASE_SETUP_GUIDE.md`** - Comprehensive setup guide with:
  - Step-by-step installation instructions
  - Schema explanations
  - Common queries and examples
  - Troubleshooting tips

- **`SCHEMA_REFERENCE.md`** - Visual schema reference with:
  - Table structure diagrams
  - Relationship mappings
  - Data flow examples

## 🚀 Quick Setup

1. **Access Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Run the Schema**
   - Navigate to SQL Editor
   - Copy contents of `complete-database-schema.sql`
   - Paste and execute
   - You should see "Success. No rows returned" (this is correct!)

3. **Configure Environment**
   - Copy `.env.example` to `.env.local` in project root
   - Add your Supabase URL and Anon Key from Settings > API

4. **Verify Setup**
   ```sql
   -- Check tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;

   -- Check seed data
   SELECT * FROM categories;
   SELECT * FROM colleges;
   ```

## 📊 Database Overview

### Core Tables
- **profiles** - User profiles (extends auth.users)
- **events** - Event listings with pricing and team settings
- **registrations** - Individual and team registrations
- **teams** - Team management
- **team_members** - Individual team member details
- **tickets** - QR code tickets
- **payments** - Payment tracking

### Supporting Tables
- **colleges** - College/university data
- **categories** - Event categories
- **team_pricing_tiers** - Custom team pricing
- **event_updates** - Event announcements
- **reviews** - Event reviews and ratings
- **favorites** - User favorites
- **notifications** - User notifications

## 🔐 Security

All tables have Row Level Security (RLS) enabled with policies ensuring:
- Users can only view/edit their own data
- Organizers can manage their own events
- Public data is accessible to all
- Admin users have elevated permissions

## 📚 For More Information

- See `DATABASE_SETUP_GUIDE.md` for detailed documentation
- See `SCHEMA_REFERENCE.md` for visual diagrams
- Frontend types: `src/lib/supabase/types.ts`

## ⚠️ Important Notes

- The schema is designed to match the frontend 100% - do not modify without updating frontend code
- All pricing is stored as DECIMAL(10,2) for currency precision
- Timestamps use TIMESTAMPTZ for timezone awareness
- Foreign keys have appropriate CASCADE/SET NULL actions
