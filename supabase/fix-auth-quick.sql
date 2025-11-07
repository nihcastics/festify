-- =====================================================
-- QUICK FIX FOR AUTHENTICATION
-- This manually confirms all existing users
-- Run this if you can't disable email confirmation
-- =====================================================

-- WARNING: This bypasses email verification
-- Only use in development/testing
-- DO NOT use in production

-- 1. Manually confirm all unconfirmed users
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Check the results
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  '✅ User can now login' as status
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- WHAT THIS DOES
-- =====================================================
-- This script marks all users as "email confirmed" 
-- so they can login immediately without clicking 
-- the verification email link.
--
-- After running this:
-- 1. All existing users can login
-- 2. New users will still need email confirmation
--    (unless you disable it in settings)
--
-- For permanent fix:
-- Go to Supabase Dashboard > Authentication > Settings
-- Turn OFF "Enable email confirmations"
-- =====================================================
