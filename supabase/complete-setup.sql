ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_events_college_id ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_is_global ON events(is_global);

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
      THEN (NEW.raw_user_meta_data->>'college_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET current_attendees = current_attendees + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET current_attendees = GREATEST(current_attendees - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW event_visibility AS
SELECT 
  e.id as event_id,
  e.college_id as event_college_id,
  e.is_global,
  p.id as user_id,
  p.college_id as user_college_id,
  CASE 
    WHEN e.is_global = true THEN true
    WHEN e.college_id IS NULL THEN true
    WHEN p.college_id IS NULL AND e.is_global = true THEN true
    WHEN p.college_id = e.college_id THEN true
    ELSE false
  END as is_visible
FROM events e
CROSS JOIN profiles p;

DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;

CREATE POLICY "Published events viewable based on college eligibility" ON events FOR SELECT USING (
  event_status = 'published' AND (
    is_global = true OR
    college_id IS NULL OR
    college_id IN (SELECT college_id FROM profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) OR
  organizer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE OR REPLACE FUNCTION can_register_for_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  event_record RECORD;
  user_college UUID;
BEGIN
  SELECT is_global, college_id INTO event_record
  FROM events
  WHERE id = event_id;
  
  SELECT college_id INTO user_college
  FROM profiles
  WHERE id = user_id;
  
  IF event_record.is_global THEN
    RETURN true;
  END IF;
  
  IF event_record.college_id IS NULL THEN
    RETURN true;
  END IF;
  
  IF user_college = event_record.college_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;

CREATE POLICY "Users can register for eligible events" ON registrations FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  can_register_for_event(event_id, user_id)
);

COMMENT ON COLUMN profiles.college_id IS 'The college/university the user belongs to. NULL if not affiliated.';
COMMENT ON COLUMN events.is_global IS 'If true, event is visible to all users. If false, only visible to users from the same college.';
COMMENT ON VIEW event_visibility IS 'Determines which events are visible to which users based on college affiliation and global flag';
COMMENT ON FUNCTION can_register_for_event IS 'Checks if a user is eligible to register for an event based on college restrictions';

DO $$
BEGIN
  RAISE NOTICE '✅ College-specific functionality setup complete!';
  RAISE NOTICE '📋 Profiles now have college_id column';
  RAISE NOTICE '🌍 Events now have is_global flag';
  RAISE NOTICE '🔒 RLS policies updated for college-based visibility';
  RAISE NOTICE '✨ Helper functions created for event management';
END $$;
