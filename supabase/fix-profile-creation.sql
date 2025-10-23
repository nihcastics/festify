-- Fix: Ensure profiles are created automatically when users sign up
-- Run this in Supabase SQL Editor

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, organization_name, college_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendee'),
    NEW.raw_user_meta_data->>'organization_name',
    (NEW.raw_user_meta_data->>'college_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROFILE AUTO-CREATION TRIGGER INSTALLED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Profiles will now be automatically created';
  RAISE NOTICE 'when users sign up through auth.';
  RAISE NOTICE '========================================';
END $$;
