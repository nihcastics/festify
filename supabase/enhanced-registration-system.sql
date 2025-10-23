-- =====================================================
-- Enhanced Registration System with Team Support
-- Adds: Team registrations, notifications, participation types
-- =====================================================

-- 1. Add participation_type to events table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'participation_type'
  ) THEN
    CREATE TYPE participation_type AS ENUM ('individual', 'team', 'both');
    RAISE NOTICE 'Created participation_type enum';
  END IF;
END $$;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS participation_type participation_type NOT NULL DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS team_size_min INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS team_size_max INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT true;

-- Add constraints for team size
ALTER TABLE events DROP CONSTRAINT IF EXISTS valid_team_size;
ALTER TABLE events ADD CONSTRAINT valid_team_size 
  CHECK (team_size_min > 0 AND team_size_max >= team_size_min);

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_members INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL,
  is_full BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_members CHECK (current_members > 0 AND current_members <= max_members)
);

-- 3. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_leader BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. Modify registrations table to support teams
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_team_registration BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 5. Enhanced notifications table (already exists, adding columns)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Update existing type column to be more specific
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'notification_type'
  ) THEN
    CREATE TYPE notification_type AS ENUM (
      'registration_confirmed',
      'registration_cancelled',
      'event_reminder',
      'event_update',
      'team_invite',
      'team_joined',
      'team_left',
      'event_cancelled',
      'event_rescheduled',
      'payment_received',
      'ticket_issued',
      'general'
    );
    RAISE NOTICE 'Created notification_type enum';
  END IF;
END $$;

-- Temporarily allow NULL for migration
ALTER TABLE notifications ALTER COLUMN type DROP NOT NULL;
ALTER TABLE notifications RENAME COLUMN type TO old_type;
ALTER TABLE notifications ADD COLUMN notification_type notification_type;

-- Migrate existing data
UPDATE notifications SET notification_type = 'general' WHERE notification_type IS NULL;

-- Make it required and drop old column
ALTER TABLE notifications ALTER COLUMN notification_type SET NOT NULL;
ALTER TABLE notifications DROP COLUMN old_type;

-- 6. Create registration_history table for audit trail
CREATE TABLE IF NOT EXISTS registration_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status registration_status,
  new_status registration_status,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team ON registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_registrations_cancelled ON registrations(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_event ON notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_registration_history_registration ON registration_history(registration_id);
CREATE INDEX IF NOT EXISTS idx_events_participation ON events(participation_type);
CREATE INDEX IF NOT EXISTS idx_events_global ON events(is_global);

-- 8. Create triggers for teams
CREATE OR REPLACE FUNCTION update_team_full_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams 
  SET is_full = (current_members >= max_members)
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_full ON team_members;
CREATE TRIGGER trigger_update_team_full
  AFTER INSERT OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_full_status();

-- 9. Create function to send notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_notification_type notification_type,
  p_event_id UUID DEFAULT NULL,
  p_registration_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, 
    title, 
    message, 
    notification_type, 
    event_id, 
    registration_id, 
    team_id,
    action_url
  )
  VALUES (
    p_user_id,
    p_title,
    p_message,
    p_notification_type,
    p_event_id,
    p_registration_id,
    p_team_id,
    p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to handle registration confirmation
CREATE OR REPLACE FUNCTION handle_registration_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_event_title TEXT;
  v_event_date TIMESTAMPTZ;
BEGIN
  -- Only send notification for new confirmations
  IF NEW.registration_status = 'confirmed' AND 
     (OLD IS NULL OR OLD.registration_status != 'confirmed') THEN
    
    -- Get event details
    SELECT title, start_date INTO v_event_title, v_event_date
    FROM events WHERE id = NEW.event_id;
    
    -- Create notification
    PERFORM create_notification(
      NEW.user_id,
      'Registration Confirmed',
      'Your registration for ' || v_event_title || ' has been confirmed!',
      'registration_confirmed',
      NEW.event_id,
      NEW.id,
      NULL,
      '/dashboard/attendee'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_registration_confirmed ON registrations;
CREATE TRIGGER trigger_registration_confirmed
  AFTER INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_registration_confirmed();

-- 11. Create function to handle registration cancellation
CREATE OR REPLACE FUNCTION handle_registration_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_event_title TEXT;
BEGIN
  IF NEW.registration_status = 'cancelled' AND 
     (OLD IS NULL OR OLD.registration_status != 'cancelled') THEN
    
    -- Update cancellation timestamp
    NEW.cancelled_at = NOW();
    
    -- Get event details
    SELECT title INTO v_event_title FROM events WHERE id = NEW.event_id;
    
    -- Create notification
    PERFORM create_notification(
      NEW.user_id,
      'Registration Cancelled',
      'Your registration for ' || v_event_title || ' has been cancelled.',
      'registration_cancelled',
      NEW.event_id,
      NEW.id,
      NULL,
      '/events'
    );
    
    -- Decrement event attendee count
    UPDATE events 
    SET current_attendees = GREATEST(0, current_attendees - 1)
    WHERE id = NEW.event_id;
    
    -- Add to history
    INSERT INTO registration_history (
      registration_id,
      action,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      'cancelled',
      OLD.registration_status,
      NEW.registration_status,
      NEW.user_id,
      NEW.cancellation_reason
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_registration_cancelled ON registrations;
CREATE TRIGGER trigger_registration_cancelled
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_registration_cancelled();

-- 12. Create function to handle team creation
CREATE OR REPLACE FUNCTION handle_team_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically add leader as first team member
  INSERT INTO team_members (team_id, user_id, is_leader)
  VALUES (NEW.id, NEW.leader_id, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_team_created ON teams;
CREATE TRIGGER trigger_team_created
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_created();

-- 13. Create function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE teams 
    SET current_members = current_members + 1
    WHERE id = NEW.team_id;
    
    -- Notify team leader
    PERFORM create_notification(
      (SELECT leader_id FROM teams WHERE id = NEW.team_id),
      'New Team Member',
      (SELECT full_name FROM profiles WHERE id = NEW.user_id) || ' joined your team!',
      'team_joined',
      (SELECT event_id FROM teams WHERE id = NEW.team_id),
      NULL,
      NEW.team_id,
      '/dashboard/organizer'
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE teams 
    SET current_members = GREATEST(1, current_members - 1)
    WHERE id = OLD.team_id;
    
    -- Notify team leader
    PERFORM create_notification(
      (SELECT leader_id FROM teams WHERE id = OLD.team_id),
      'Team Member Left',
      (SELECT full_name FROM profiles WHERE id = OLD.user_id) || ' left your team.',
      'team_left',
      (SELECT event_id FROM teams WHERE id = OLD.team_id),
      NULL,
      OLD.team_id,
      '/dashboard/organizer'
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_members ON team_members;
CREATE TRIGGER trigger_update_team_members
  AFTER INSERT OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_count();

-- 14. Add RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_history ENABLE ROW LEVEL SECURITY;

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by event participants" ON teams;
CREATE POLICY "Teams are viewable by event participants" ON teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM registrations WHERE event_id = teams.event_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM events WHERE id = teams.event_id AND organizer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can create teams for events they registered" ON teams;
CREATE POLICY "Users can create teams for events they registered" ON teams FOR INSERT WITH CHECK (
  leader_id = auth.uid()
);

DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
CREATE POLICY "Team leaders can update their teams" ON teams FOR UPDATE USING (
  leader_id = auth.uid()
);

DROP POLICY IF EXISTS "Team leaders can delete their teams" ON teams;
CREATE POLICY "Team leaders can delete their teams" ON teams FOR DELETE USING (
  leader_id = auth.uid()
);

-- Team members policies
DROP POLICY IF EXISTS "Team members are viewable by team and event participants" ON team_members;
CREATE POLICY "Team members are viewable by team and event participants" ON team_members FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND leader_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM teams t
    JOIN events e ON e.id = t.event_id
    WHERE t.id = team_members.team_id AND e.organizer_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can join teams" ON team_members;
CREATE POLICY "Users can join teams" ON team_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND leader_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
CREATE POLICY "Users can leave teams" ON team_members FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND leader_id = auth.uid())
);

-- Registration history policies
DROP POLICY IF EXISTS "Users can view their registration history" ON registration_history;
CREATE POLICY "Users can view their registration history" ON registration_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM registrations WHERE id = registration_history.registration_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "System can insert history" ON registration_history;
CREATE POLICY "System can insert history" ON registration_history FOR INSERT WITH CHECK (true);

-- 15. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Create helper function to get event statistics
CREATE OR REPLACE FUNCTION get_event_statistics(p_event_id UUID)
RETURNS TABLE(
  total_registrations BIGINT,
  confirmed_registrations BIGINT,
  cancelled_registrations BIGINT,
  team_registrations BIGINT,
  individual_registrations BIGINT,
  total_teams BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'confirmed')::BIGINT as confirmed_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'cancelled')::BIGINT as cancelled_registrations,
    COUNT(*) FILTER (WHERE is_team_registration = true)::BIGINT as team_registrations,
    COUNT(*) FILTER (WHERE is_team_registration = false)::BIGINT as individual_registrations,
    (SELECT COUNT(*)::BIGINT FROM teams WHERE event_id = p_event_id) as total_teams
  FROM registrations
  WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- 17. Summary
DO $$
DECLARE
  events_count INTEGER;
  registrations_count INTEGER;
  teams_count INTEGER;
  notifications_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO events_count FROM events;
  SELECT COUNT(*) INTO registrations_count FROM registrations;
  SELECT COUNT(*) INTO teams_count FROM teams;
  SELECT COUNT(*) INTO notifications_count FROM notifications;
  
  RAISE NOTICE '=== ENHANCED REGISTRATION SYSTEM SETUP COMPLETE ===';
  RAISE NOTICE 'Events: %', events_count;
  RAISE NOTICE 'Registrations: %', registrations_count;
  RAISE NOTICE 'Teams: %', teams_count;
  RAISE NOTICE 'Notifications: %', notifications_count;
  RAISE NOTICE '================================================';
END $$;
