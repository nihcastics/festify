-- Complete Setup: Pricing System + Team Management System
-- Run this file in Supabase SQL Editor to set up all required tables, functions, and policies

-- ============================================
-- PART 1: PRICING SYSTEM
-- ============================================

-- Create payment_status enum type first (before adding column)
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create team_pricing_tiers table
CREATE TABLE IF NOT EXISTS team_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  min_members INTEGER NOT NULL CHECK (min_members > 0),
  max_members INTEGER NOT NULL CHECK (max_members >= min_members),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add pricing columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS individual_price DECIMAL(10, 2) DEFAULT 0 CHECK (individual_price >= 0),
ADD COLUMN IF NOT EXISTS team_base_price DECIMAL(10, 2) DEFAULT 0 CHECK (team_base_price >= 0),
ADD COLUMN IF NOT EXISTS price_per_member DECIMAL(10, 2) DEFAULT 0 CHECK (price_per_member >= 0),
ADD COLUMN IF NOT EXISTS has_custom_team_pricing BOOLEAN DEFAULT false;

-- Add payment columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create indexes for pricing
CREATE INDEX IF NOT EXISTS idx_team_pricing_tiers_event ON team_pricing_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_transaction ON registrations(transaction_id);

-- Enable RLS on team_pricing_tiers
ALTER TABLE team_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_pricing_tiers (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON team_pricing_tiers;
CREATE POLICY "Anyone can view pricing tiers"
  ON team_pricing_tiers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only organizers can manage pricing tiers" ON team_pricing_tiers;
CREATE POLICY "Only organizers can manage pricing tiers"
  ON team_pricing_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = team_pricing_tiers.event_id
        AND events.organizer_id = auth.uid()
    )
  );

-- Function to calculate registration price
CREATE OR REPLACE FUNCTION calculate_registration_price(
  p_event_id UUID,
  p_is_team BOOLEAN,
  p_team_size INTEGER DEFAULT 1
)
RETURNS DECIMAL AS $$
DECLARE
  v_price DECIMAL := 0;
  v_event RECORD;
  v_tier RECORD;
BEGIN
  -- Get event pricing configuration
  SELECT 
    individual_price,
    team_base_price,
    price_per_member,
    has_custom_team_pricing,
    participation_type
  INTO v_event
  FROM events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate price based on registration type
  IF NOT p_is_team THEN
    -- Individual registration
    v_price := COALESCE(v_event.individual_price, 0);
  ELSE
    -- Team registration
    IF v_event.has_custom_team_pricing THEN
      -- Use custom tier pricing
      SELECT price INTO v_tier
      FROM team_pricing_tiers
      WHERE event_id = p_event_id
        AND p_team_size >= min_members
        AND p_team_size <= max_members
      LIMIT 1;

      IF FOUND THEN
        v_price := v_tier.price;
      ELSE
        -- No matching tier, use base + per member
        v_price := COALESCE(v_event.team_base_price, 0) + 
                   (GREATEST(p_team_size - 1, 0) * COALESCE(v_event.price_per_member, 0));
      END IF;
    ELSE
      -- Use base price + per member pricing
      v_price := COALESCE(v_event.team_base_price, 0) + 
                 (GREATEST(p_team_size - 1, 0) * COALESCE(v_event.price_per_member, 0));
    END IF;
  END IF;

  RETURN COALESCE(v_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to process payment
CREATE OR REPLACE FUNCTION process_registration_payment(
  p_registration_id UUID,
  p_amount DECIMAL,
  p_payment_method TEXT DEFAULT 'bypass',
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_transaction_id TEXT;
BEGIN
  -- Generate transaction ID if not provided
  v_transaction_id := COALESCE(
    p_transaction_id,
    'TXN-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || substr(md5(random()::text), 1, 8)
  );

  -- Update registration with payment info
  UPDATE registrations
  SET
    payment_status = 'completed',
    payment_amount = p_amount,
    payment_method = p_payment_method,
    transaction_id = v_transaction_id,
    paid_at = NOW(),
    registration_status = 'registered'
  WHERE id = p_registration_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event pricing summary
CREATE OR REPLACE FUNCTION get_event_pricing_summary(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'event_id', e.id,
    'individual_price', COALESCE(e.individual_price, 0),
    'team_base_price', COALESCE(e.team_base_price, 0),
    'price_per_member', COALESCE(e.price_per_member, 0),
    'has_custom_pricing', COALESCE(e.has_custom_team_pricing, false),
    'participation_type', e.participation_type,
    'team_size_min', e.team_size_min,
    'team_size_max', e.team_size_max,
    'custom_tiers', (
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'min_members', t.min_members,
          'max_members', t.max_members,
          'price', t.price
        ) ORDER BY t.min_members
      )
      FROM team_pricing_tiers t
      WHERE t.event_id = p_event_id
    )
  ) INTO v_result
  FROM events e
  WHERE e.id = p_event_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 2: TEAM MANAGEMENT SYSTEM
-- ============================================

-- Add team-related columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS team_leader_name TEXT,
ADD COLUMN IF NOT EXISTS team_leader_phone TEXT,
ADD COLUMN IF NOT EXISTS team_leader_email TEXT,
ADD COLUMN IF NOT EXISTS team_leader_university_reg TEXT;

-- Drop existing team tables if they exist to ensure clean setup
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

-- Create indexes for team management
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

-- ============================================
-- SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'COMPLETE SETUP SUCCESSFUL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRICING SYSTEM:';
  RAISE NOTICE '  - Tables: team_pricing_tiers';
  RAISE NOTICE '  - Columns added to events: individual_price, team_base_price, price_per_member, has_custom_team_pricing';
  RAISE NOTICE '  - Columns added to registrations: payment_status, payment_amount, payment_method, transaction_id, paid_at';
  RAISE NOTICE '  - Functions: calculate_registration_price(), process_registration_payment(), get_event_pricing_summary()';
  RAISE NOTICE '';
  RAISE NOTICE 'TEAM MANAGEMENT SYSTEM:';
  RAISE NOTICE '  - Tables: teams, team_members';
  RAISE NOTICE '  - Columns added to registrations: team_name, team_leader_name, team_leader_phone, team_leader_email, team_leader_university_reg';
  RAISE NOTICE '  - Functions: create_team_with_members(), get_team_details()';
  RAISE NOTICE '';
  RAISE NOTICE 'All RLS policies have been created';
  RAISE NOTICE '========================================';
END $$;
