-- =====================================================
-- Fix Profiles Table Schema and Data
-- Run this script to ensure all columns exist and data is properly set
-- =====================================================

-- 1. Add organization_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_name TEXT;
    RAISE NOTICE 'Added organization_name column to profiles table';
  ELSE
    RAISE NOTICE 'organization_name column already exists';
  END IF;
END $$;

-- 2. Add website column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to profiles table';
  ELSE
    RAISE NOTICE 'website column already exists';
  END IF;
END $$;

-- 3. Add bio column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
    RAISE NOTICE 'Added bio column to profiles table';
  ELSE
    RAISE NOTICE 'bio column already exists';
  END IF;
END $$;

-- 4. Add college_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'college_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN college_id UUID REFERENCES colleges(id);
    RAISE NOTICE 'Added college_id column to profiles table';
  ELSE
    RAISE NOTICE 'college_id column already exists';
  END IF;
END $$;

-- 5. Update organization_name from auth.users metadata for existing users
UPDATE profiles p
SET organization_name = au.raw_user_meta_data->>'organization_name'
FROM auth.users au
WHERE p.id = au.id 
  AND p.organization_name IS NULL 
  AND au.raw_user_meta_data->>'organization_name' IS NOT NULL;

-- 6. Update college_id from auth.users metadata for existing users
UPDATE profiles p
SET college_id = (au.raw_user_meta_data->>'college_id')::uuid
FROM auth.users au
WHERE p.id = au.id 
  AND p.college_id IS NULL 
  AND au.raw_user_meta_data->>'college_id' IS NOT NULL
  AND (au.raw_user_meta_data->>'college_id')::uuid IN (SELECT id FROM colleges);

-- 7. Verify the handle_new_user trigger exists and is correct
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, organization_name, college_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'attendee'),
    NEW.raw_user_meta_data->>'organization_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'college_id' IS NOT NULL 
        AND (NEW.raw_user_meta_data->>'college_id')::uuid IN (SELECT id FROM colleges)
      THEN (NEW.raw_user_meta_data->>'college_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 9. Display summary of profiles table
DO $$
DECLARE
  total_profiles INTEGER;
  profiles_with_org INTEGER;
  profiles_with_college INTEGER;
  organizers_count INTEGER;
  attendees_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM profiles;
  SELECT COUNT(*) INTO profiles_with_org FROM profiles WHERE organization_name IS NOT NULL;
  SELECT COUNT(*) INTO profiles_with_college FROM profiles WHERE college_id IS NOT NULL;
  SELECT COUNT(*) INTO organizers_count FROM profiles WHERE role = 'organizer';
  SELECT COUNT(*) INTO attendees_count FROM profiles WHERE role = 'attendee';
  
  RAISE NOTICE '=== PROFILES TABLE SUMMARY ===';
  RAISE NOTICE 'Total profiles: %', total_profiles;
  RAISE NOTICE 'Profiles with organization: %', profiles_with_org;
  RAISE NOTICE 'Profiles with college: %', profiles_with_college;
  RAISE NOTICE 'Organizers: %', organizers_count;
  RAISE NOTICE 'Attendees: %', attendees_count;
  RAISE NOTICE '=============================';
END $$;

-- 10. Show sample data
SELECT 
  id,
  email,
  full_name,
  role,
  organization_name,
  college_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
