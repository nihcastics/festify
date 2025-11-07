-- =====================================================
-- VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify your setup
-- =====================================================

-- 1. Check if all tables were created
SELECT 
  '✅ Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'colleges', 'categories', 'events',
    'team_pricing_tiers', 'registrations', 'teams',
    'team_members', 'tickets', 'payments',
    'event_updates', 'reviews', 'favorites', 'notifications'
  );

-- 2. Check if enums were created
SELECT 
  '✅ Enums Created' as status,
  COUNT(*) as enum_count
FROM pg_type 
WHERE typname IN (
  'user_role', 'event_status', 'participation_type',
  'registration_status', 'payment_status', 'ticket_type',
  'notification_type'
);

-- 3. Check if seed data was inserted
SELECT 
  '✅ Categories' as data_type,
  COUNT(*) as count
FROM categories
UNION ALL
SELECT 
  '✅ Colleges' as data_type,
  COUNT(*) as count
FROM colleges;

-- 4. Check if the profile creation trigger exists
SELECT 
  '✅ Trigger: ' || trigger_name as status,
  'Exists' as result
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check if helper functions exist
SELECT 
  '✅ Function: ' || routine_name as status,
  'Exists' as result
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_registration_price',
    'create_team_with_members',
    'get_team_details',
    'get_event_pricing_summary'
  )
ORDER BY routine_name;

-- 6. Check RLS is enabled
SELECT 
  '🔐 RLS Enabled on: ' || tablename as status,
  CASE WHEN rowsecurity THEN 'Yes ✅' ELSE 'No ❌' END as enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'colleges', 'categories', 'events',
    'registrations', 'teams', 'team_members', 'tickets',
    'payments', 'notifications'
  )
ORDER BY tablename;

-- 7. Check for any users and profiles
SELECT 
  '👤 Users/Profiles' as info,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unconfirmed_users;

-- 8. List all registered users (without sensitive data)
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- 1. table_count should be 14
-- 2. enum_count should be 7
-- 3. Categories: 5, Colleges: 13
-- 4. Trigger should exist
-- 5. All 4 functions should exist
-- 6. RLS should be enabled on all tables
-- 7. Shows user statistics
-- 8. Shows all registered users
-- =====================================================
