-- =====================================================
-- AUTHENTICATION DIAGNOSTIC SCRIPT
-- Run this to see what's blocking your login
-- =====================================================

-- 1. Check if any users exist in auth.users
SELECT 
  '👥 Total Auth Users' as check_type,
  COUNT(*) as count
FROM auth.users;

-- 2. Check user details and confirmation status
SELECT 
  email,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED - Cannot login yet'
    ELSE '✅ CONFIRMED - Can login'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- 3. Check if profiles were created for users
SELECT 
  '📊 Profile Creation Status' as check_type,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles_created,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) 
    THEN '✅ All users have profiles'
    ELSE '❌ Some users missing profiles - Trigger may not be working'
  END as status;

-- 4. Check the trigger that creates profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check email confirmation settings (indirectly)
SELECT 
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at IS NOT NULL as email_confirmed,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Go to Supabase Dashboard > Authentication > Settings > Disable "Email Confirmations"'
    ELSE 'Email is confirmed, login should work'
  END as action_needed
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- HOW TO FIX
-- =====================================================
-- 
-- If you see users with email_confirmed_at = NULL:
--
-- OPTION 1 (QUICK FIX):
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click Authentication > Settings
-- 4. Scroll to "Email" section
-- 5. TURN OFF "Enable email confirmations"
-- 6. Save
-- 7. Delete old test users (see DELETE script below)
-- 8. Try registering again
--
-- OPTION 2 (PROPER WAY):
-- 1. Check your email inbox for verification email
-- 2. Click the link in the email
-- 3. Then try logging in
--
-- =====================================================

-- Optional: Delete test users to start fresh
-- UNCOMMENT and run this if you want to delete all test users:
-- 
-- DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%@gmail%';
-- 
-- Or delete a specific user:
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';
