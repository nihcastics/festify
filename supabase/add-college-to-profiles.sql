-- Add college_id to profiles table
ALTER TABLE profiles 
ADD COLUMN college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

-- Add is_global flag to events table
ALTER TABLE events 
ADD COLUMN is_global BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster queries
CREATE INDEX idx_profiles_college_id ON profiles(college_id);
CREATE INDEX idx_events_college_id ON events(college_id);
CREATE INDEX idx_events_is_global ON events(is_global);

-- Create a view for event visibility
-- This will help determine which events a user can see
CREATE OR REPLACE VIEW event_visibility AS
SELECT 
  e.id as event_id,
  e.college_id as event_college_id,
  e.is_global,
  p.id as user_id,
  p.college_id as user_college_id,
  CASE 
    -- Global events are visible to everyone
    WHEN e.is_global = true THEN true
    -- Events without college are visible to everyone (backwards compatibility)
    WHEN e.college_id IS NULL THEN true
    -- User has no college - can only see global events
    WHEN p.college_id IS NULL AND e.is_global = true THEN true
    -- User's college matches event's college
    WHEN p.college_id = e.college_id THEN true
    ELSE false
  END as is_visible
FROM events e
CROSS JOIN profiles p;

-- Comment on the view
COMMENT ON VIEW event_visibility IS 'Determines which events are visible to which users based on college affiliation and global flag';
