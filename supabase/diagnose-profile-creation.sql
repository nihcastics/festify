-- =====================================================
-- DIAGNOSE PROFILE CREATION ISSUE
-- Run this to see why "Database error saving new user"
-- =====================================================

-- 1. Check if the trigger exists
SELECT 
  '🔍 Checking Trigger' as check,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing - Run complete-database-schema.sql'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
  '🔍 Checking Function' as check,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Function exists'
    ELSE '❌ Function missing - Run complete-database-schema.sql'
  END as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Check RLS policies on profiles table
SELECT 
  '🔐 RLS Policies on profiles table' as info,
  policyname,
  cmd,
  CASE 
    WHEN roles = '{service_role}' THEN '✅ Service role can insert'
    WHEN roles = '{authenticated}' THEN 'Authenticated users'
    ELSE roles::text
  END as who_can_access
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 4. Check if profiles table exists and structure is correct
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check existing auth users vs profiles
SELECT 
  'Users vs Profiles' as comparison,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as missing_profiles;

-- 6. Show any users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data,
  '❌ Missing profile' as issue
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 7. Test if we can manually insert a profile (shows permission issue)
-- DO NOT RUN THIS - Just checks if structure is right
SELECT 
  'Profile table structure check' as info,
  COUNT(*) as total_columns,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ Table structure looks correct'
    ELSE '❌ Table may be missing columns'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public';

-- =====================================================
-- COMMON ISSUES AND FIXES
-- =====================================================
-- 
-- Issue 1: Trigger doesn't exist
-- Fix: Run fix-profile-creation-trigger.sql
--
-- Issue 2: RLS blocking the trigger
-- Fix: Run fix-profile-creation-trigger.sql (includes RLS fix)
--
-- Issue 3: Permissions issue
-- Fix: Run fix-profile-creation-trigger.sql (includes GRANT statements)
--
-- Issue 4: college_id causing error (invalid UUID)
-- Fix: Fixed in fix-profile-creation-trigger.sql with proper NULL handling
--
-- =====================================================
