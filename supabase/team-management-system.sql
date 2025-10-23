-- Team Management Enhancement
-- Adds comprehensive team support with members, contact details, and university info

-- Add team-related columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS team_leader_name TEXT,
ADD COLUMN IF NOT EXISTS team_leader_phone TEXT,
ADD COLUMN IF NOT EXISTS team_leader_email TEXT,
ADD COLUMN IF NOT EXISTS team_leader_university_reg TEXT;

-- Drop existing tables if they exist to ensure clean setup
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Create teams table for detailed team information
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_leader_id UUID REFERENCES profiles(id),
  team_leader_name TEXT NOT NULL,
  team_leader_phone TEXT,
  team_leader_email TEXT,
  team_leader_university_reg TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table for individual member details
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_email TEXT,
  member_phone TEXT,
  university_registration_number TEXT,
  is_leader BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_registration ON teams(registration_id);
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Users can view teams they're part of" ON teams;
CREATE POLICY "Users can view teams they're part of"
  ON teams FOR SELECT
  USING (
    team_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.member_email IN (
          SELECT email FROM profiles WHERE id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (team_leader_id = auth.uid());

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (team_leader_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all teams" ON teams;
CREATE POLICY "Admins can manage all teams"
  ON teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- RLS Policies for team_members (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
        AND (
          teams.team_leader_id = auth.uid() OR
          team_members.member_email IN (
            SELECT email FROM profiles WHERE id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Team leaders can manage team members" ON team_members;
CREATE POLICY "Team leaders can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
        AND teams.team_leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all team members" ON team_members;
CREATE POLICY "Admins can manage all team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Function to create team with members
CREATE OR REPLACE FUNCTION create_team_with_members(
  p_registration_id UUID,
  p_team_name TEXT,
  p_team_leader_name TEXT,
  p_team_leader_phone TEXT,
  p_team_leader_email TEXT,
  p_team_leader_university_reg TEXT,
  p_event_id UUID,
  p_members JSONB
)
RETURNS UUID AS $$
DECLARE
  v_team_id UUID;
  v_member JSONB;
BEGIN
  -- Create team
  INSERT INTO teams (
    registration_id,
    team_name,
    team_leader_id,
    team_leader_name,
    team_leader_phone,
    team_leader_email,
    team_leader_university_reg,
    event_id
  ) VALUES (
    p_registration_id,
    p_team_name,
    auth.uid(),
    p_team_leader_name,
    p_team_leader_phone,
    p_team_leader_email,
    p_team_leader_university_reg,
    p_event_id
  ) RETURNING id INTO v_team_id;

  -- Insert team leader as first member
  INSERT INTO team_members (
    team_id,
    member_name,
    member_email,
    member_phone,
    university_registration_number,
    is_leader
  ) VALUES (
    v_team_id,
    p_team_leader_name,
    p_team_leader_email,
    p_team_leader_phone,
    p_team_leader_university_reg,
    true
  );

  -- Insert other team members from JSON array
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO team_members (
      team_id,
      member_name,
      member_email,
      member_phone,
      university_registration_number,
      is_leader
    ) VALUES (
      v_team_id,
      v_member->>'name',
      v_member->>'email',
      v_member->>'phone',
      v_member->>'university_reg',
      false
    );
  END LOOP;

  -- Update registration with team info
  UPDATE registrations
  SET 
    team_name = p_team_name,
    team_leader_name = p_team_leader_name,
    team_leader_phone = p_team_leader_phone,
    team_leader_email = p_team_leader_email,
    team_leader_university_reg = p_team_leader_university_reg
  WHERE id = p_registration_id;

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team details with members
CREATE OR REPLACE FUNCTION get_team_details(p_team_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'team', row_to_json(t.*),
    'members', (
      SELECT json_agg(row_to_json(tm.*) ORDER BY tm.is_leader DESC, tm.joined_at)
      FROM team_members tm
      WHERE tm.team_id = p_team_id
    )
  ) INTO v_result
  FROM teams t
  WHERE t.id = p_team_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '=== TEAM MANAGEMENT SYSTEM CREATED ===';
  RAISE NOTICE 'Tables: teams, team_members';
  RAISE NOTICE 'Columns added to registrations: team_name, team_leader_name, team_leader_phone, team_leader_email, team_leader_university_reg';
  RAISE NOTICE 'Functions: create_team_with_members(), get_team_details()';
  RAISE NOTICE 'RLS policies enabled for teams and team_members';
  RAISE NOTICE '=========================================';
END $$;
