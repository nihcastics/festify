-- =====================================================
-- FESTIFY COMPLETE DATABASE SETUP
-- Run this script to set up the entire database schema
-- =====================================================

-- This script combines all migrations in the correct order:
-- 1. Base schema (setup.sql)
-- 2. College and profile updates (complete-setup.sql + fix-profiles-schema.sql)
-- 3. Enhanced registration system (enhanced-registration-system.sql)
-- 4. Helper functions (helper-functions.sql)

\echo '========================================='
\echo 'FESTIFY DATABASE SETUP'
\echo 'Starting complete database initialization...'
\echo '========================================='

-- Step 1: Run base setup if not already done
\echo '  '
\echo 'Step 1: Checking base schema...'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'events') THEN
    RAISE NOTICE 'Base schema not found. Please run setup.sql first!';
    RAISE EXCEPTION 'Run setup.sql before running this script';
  ELSE
    RAISE NOTICE 'Base schema exists ✓';
  END IF;
END $$;

-- Step 2: Enhanced registration system
\echo '  '
\echo 'Step 2: Setting up enhanced registration system...'
\i enhanced-registration-system.sql

-- Step 3: Helper functions
\echo '  '
\echo 'Step 3: Creating helper functions...'
\i helper-functions.sql

-- Step 4: Profile fixes
\echo '  '
\echo 'Step 4: Applying profile schema fixes...'
\i fix-profiles-schema.sql

-- Final verification
\echo '  '
\echo '========================================='
\echo 'VERIFICATION'
\echo '========================================='

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'colleges', 'categories', 'events', 'registrations',
      'tickets', 'payments', 'teams', 'team_members', 'notifications',
      'registration_history', 'event_updates', 'reviews', 'favorites'
    );
  
  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'handle_new_user', 'create_notification', 'increment_event_attendees',
      'decrement_event_attendees', 'is_event_full', 'can_user_register',
      'get_event_statistics'
    );
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname LIKE '%festify%' OR tgname IN (
    'on_auth_user_created', 'trigger_registration_confirmed',
    'trigger_registration_cancelled', 'trigger_team_created',
    'trigger_update_team_members'
  );
  
  RAISE NOTICE '  ';
  RAISE NOTICE 'Tables created/verified: % / 14', table_count;
  RAISE NOTICE 'Functions created: % / 7', function_count;
  RAISE NOTICE 'Triggers active: %', trigger_count;
  RAISE NOTICE '  ';
  
  IF table_count >= 14 AND function_count >= 7 THEN
    RAISE NOTICE '✓ Database setup complete!';
    RAISE NOTICE '  ';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test event creation';
    RAISE NOTICE '2. Test individual registration';
    RAISE NOTICE '3. Test team registration';
    RAISE NOTICE '4. Verify notifications';
  ELSE
    RAISE WARNING 'Setup incomplete. Please check for errors above.';
  END IF;
END $$;

\echo '========================================='
\echo 'SETUP COMPLETE'
\echo '========================================='
