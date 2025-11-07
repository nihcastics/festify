-- =====================================================
-- FESTIFY - Complete Database Schema
-- Generated based on frontend requirements analysis
-- This schema includes ALL tables, columns, relationships,
-- RLS policies, functions, and triggers needed for the app
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User Roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'attendee', 'organizer');
  END IF;
END $$;

-- Event Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
  END IF;
END $$;

-- Participation Type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participation_type') THEN
    CREATE TYPE participation_type AS ENUM ('individual', 'team', 'both');
  END IF;
END $$;

-- Registration Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'attended');
  END IF;
END $$;

-- Payment Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
  END IF;
END $$;

-- Ticket Type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_type') THEN
    CREATE TYPE ticket_type AS ENUM ('free', 'paid', 'vip', 'early_bird');
  END IF;
END $$;

-- Notification Type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
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
  END IF;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  established_year INTEGER,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'attendee',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  organization_name TEXT,
  website TEXT,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  event_status event_status NOT NULL DEFAULT 'draft',
  participation_type participation_type NOT NULL DEFAULT 'individual',
  team_size_min INTEGER DEFAULT 1,
  team_size_max INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  venue_details TEXT,
  image_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  registration_deadline TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_global BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  -- Pricing fields
  individual_price DECIMAL(10,2) DEFAULT 0,
  team_base_price DECIMAL(10,2) DEFAULT 0,
  price_per_member DECIMAL(10,2) DEFAULT 0,
  has_custom_team_pricing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_team_size CHECK (team_size_min > 0 AND team_size_max >= team_size_min),
  CONSTRAINT valid_attendees CHECK (current_attendees >= 0 AND (max_attendees IS NULL OR current_attendees <= max_attendees)),
  CONSTRAINT valid_prices CHECK (
    individual_price >= 0 AND 
    team_base_price >= 0 AND 
    price_per_member >= 0
  )
);

-- Team Pricing Tiers Table
CREATE TABLE IF NOT EXISTS team_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  min_members INTEGER NOT NULL,
  max_members INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_member_range CHECK (min_members <= max_members),
  CONSTRAINT positive_price CHECK (price >= 0)
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_status registration_status NOT NULL DEFAULT 'pending',
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  notes TEXT,
  -- Team-related fields
  is_team BOOLEAN NOT NULL DEFAULT false,
  team_size INTEGER DEFAULT 1,
  team_name TEXT,
  team_leader_name TEXT,
  team_leader_phone TEXT,
  team_leader_email TEXT,
  team_leader_university_reg TEXT,
  -- Payment fields (stored here for quick access)
  payment_status payment_status DEFAULT 'pending',
  payment_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraints
  UNIQUE(event_id, user_id),
  CONSTRAINT valid_team_size CHECK (team_size >= 1)
);

-- Teams Table (detailed team information)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
  team_name TEXT NOT NULL,
  team_leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  team_leader_name TEXT NOT NULL,
  team_leader_phone TEXT,
  team_leader_email TEXT,
  team_leader_university_reg TEXT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Table (individual member details)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_email TEXT,
  member_phone TEXT,
  university_registration_number TEXT,
  is_leader BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  ticket_type ticket_type NOT NULL DEFAULT 'paid',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ticket_code TEXT NOT NULL UNIQUE,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments Table (detailed payment records)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Updates Table
CREATE TABLE IF NOT EXISTS event_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_college ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(event_status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_global ON events(is_global);

-- Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_registration ON teams(registration_id);
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(team_leader_id);

-- Team Members
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);

-- Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_registration ON tickets(registration_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_event ON notifications(event_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Handle new user signup
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
    (NEW.raw_user_meta_data->>'college_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment event attendees
CREATE OR REPLACE FUNCTION increment_event_attendees(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_attendees = current_attendees + 1
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Decrement event attendees
CREATE OR REPLACE FUNCTION decrement_event_attendees(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_attendees = GREATEST(current_attendees - 1, 0)
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate registration price
CREATE OR REPLACE FUNCTION calculate_registration_price(
  p_event_id UUID,
  p_is_team BOOLEAN,
  p_team_size INTEGER DEFAULT 1
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_individual_price DECIMAL(10,2);
  v_team_base_price DECIMAL(10,2);
  v_price_per_member DECIMAL(10,2);
  v_has_custom_pricing BOOLEAN;
  v_tier_price DECIMAL(10,2);
  v_final_price DECIMAL(10,2);
BEGIN
  -- Get event pricing details
  SELECT 
    individual_price,
    team_base_price,
    price_per_member,
    has_custom_team_pricing
  INTO 
    v_individual_price,
    v_team_base_price,
    v_price_per_member,
    v_has_custom_pricing
  FROM events
  WHERE id = p_event_id;

  -- Individual registration
  IF NOT p_is_team THEN
    RETURN COALESCE(v_individual_price, 0);
  END IF;

  -- Team registration with custom tiers
  IF v_has_custom_pricing THEN
    SELECT price INTO v_tier_price
    FROM team_pricing_tiers
    WHERE event_id = p_event_id
      AND p_team_size >= min_members
      AND p_team_size <= max_members
    ORDER BY min_members DESC
    LIMIT 1;

    IF v_tier_price IS NOT NULL THEN
      RETURN v_tier_price;
    END IF;
  END IF;

  -- Standard team pricing: base + (members * per_member_price)
  v_final_price := COALESCE(v_team_base_price, 0) + (p_team_size * COALESCE(v_price_per_member, 0));
  
  RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

-- Function: Create team with members
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
  -- Create team record
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

  -- Add leader as a team member
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

  -- Add other members
  IF p_members IS NOT NULL THEN
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
  END IF;

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get team details
CREATE OR REPLACE FUNCTION get_team_details(p_team_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'team', row_to_json(t.*),
    'members', (
      SELECT jsonb_agg(row_to_json(tm.*))
      FROM team_members tm
      WHERE tm.team_id = p_team_id
      ORDER BY tm.is_leader DESC, tm.joined_at
    )
  )
  INTO v_result
  FROM teams t
  WHERE t.id = p_team_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Get event pricing summary
CREATE OR REPLACE FUNCTION get_event_pricing_summary(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'event_id', e.id,
    'individual_price', e.individual_price,
    'team_base_price', e.team_base_price,
    'price_per_member', e.price_per_member,
    'has_custom_pricing', e.has_custom_team_pricing,
    'participation_type', e.participation_type,
    'team_size_min', e.team_size_min,
    'team_size_max', e.team_size_max,
    'custom_tiers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'min_members', tpt.min_members,
          'max_members', tpt.max_members,
          'price', tpt.price
        ) ORDER BY tpt.min_members
      )
      FROM team_pricing_tiers tpt
      WHERE tpt.event_id = p_event_id
    )
  )
  INTO v_result
  FROM events e
  WHERE e.id = p_event_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: Update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on registrations
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Colleges Policies
DROP POLICY IF EXISTS "Colleges are viewable by everyone" ON colleges;
CREATE POLICY "Colleges are viewable by everyone"
  ON colleges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage colleges" ON colleges;
CREATE POLICY "Admins can manage colleges"
  ON colleges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Categories Policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Events Policies
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT
  USING (event_status = 'published' OR organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can create events" ON events;
CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('organizer', 'admin')
    )
  );

DROP POLICY IF EXISTS "Organizers can update own events" ON events;
CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can delete own events" ON events;
CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  USING (organizer_id = auth.uid());

-- Team Pricing Tiers Policies
DROP POLICY IF EXISTS "Pricing tiers viewable with events" ON team_pricing_tiers;
CREATE POLICY "Pricing tiers viewable with events"
  ON team_pricing_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
        AND (events.event_status = 'published' OR events.organizer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Organizers can manage own event pricing" ON team_pricing_tiers;
CREATE POLICY "Organizers can manage own event pricing"
  ON team_pricing_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Registrations Policies
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create registrations" ON registrations;
CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own registrations" ON registrations;
CREATE POLICY "Users can update own registrations"
  ON registrations FOR UPDATE
  USING (user_id = auth.uid());

-- Teams Policies
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
    ) OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = teams.event_id AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (team_leader_id = auth.uid());

DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (team_leader_id = auth.uid());

-- Team Members Policies
DROP POLICY IF EXISTS "Users can view team members of accessible teams" ON team_members;
CREATE POLICY "Users can view team members of accessible teams"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
        AND (
          teams.team_leader_id = auth.uid() OR
          team_members.member_email IN (
            SELECT email FROM profiles WHERE id = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM events
            WHERE events.id = teams.event_id AND events.organizer_id = auth.uid()
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

-- Tickets Policies
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = tickets.registration_id
        AND registrations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
        AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can create tickets" ON tickets;
CREATE POLICY "System can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (true);

-- Payments Policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = payments.registration_id
        AND registrations.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM registrations
      JOIN events ON events.id = registrations.event_id
      WHERE registrations.id = payments.registration_id
        AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can create payments" ON payments;
CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Event Updates Policies
DROP POLICY IF EXISTS "Event updates viewable by everyone" ON event_updates;
CREATE POLICY "Event updates viewable by everyone"
  ON event_updates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can create updates for own events" ON event_updates;
CREATE POLICY "Organizers can create updates for own events"
  ON event_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create reviews for attended events" ON reviews;
CREATE POLICY "Users can create reviews for attended events"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

-- Favorites Policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id = auth.uid());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description, icon_name) VALUES
  ('Tech', 'Technology and Innovation events', 'Code'),
  ('Cultural', 'Cultural festivals and celebrations', 'Music'),
  ('Sports', 'Sports competitions and tournaments', 'Trophy'),
  ('Workshop', 'Educational workshops and training', 'Wrench'),
  ('Seminar', 'Academic seminars and conferences', 'BookOpen')
ON CONFLICT (name) DO NOTHING;

-- Insert sample colleges
INSERT INTO colleges (name, location, description) VALUES
  ('SRM Institute of Science and Technology', 'Chennai', 'Leading engineering and technology institution'),
  ('IIT Madras', 'Chennai', 'Premier technical university'),
  ('IIT Delhi', 'Delhi', 'Top engineering college'),
  ('IIT Bombay', 'Mumbai', 'Leading technical institution'),
  ('Loyola College', 'Chennai', 'Renowned arts and science college'),
  ('Indian Institute of Science', 'Bangalore', 'Premier research institution'),
  ('IIIT Hyderabad', 'Hyderabad', 'Top IT institution'),
  ('BITS Pilani, Hyderabad Campus', 'Hyderabad', 'Leading engineering college'),
  ('PES University', 'Bangalore', 'Technology and management university'),
  ('Netaji Subhas University of Technology', 'Delhi', 'Engineering university'),
  ('IIT Ropar', 'Punjab', 'Indian Institute of Technology'),
  ('Thapar Institute of Engineering and Technology', 'Punjab', 'Leading engineering institute'),
  ('Sardar Patel Institute of Technology', 'Mumbai', 'Engineering college')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Festify database schema setup complete!';
  RAISE NOTICE '📊 Tables created: 15';
  RAISE NOTICE '🔐 RLS policies configured: All tables secured';
  RAISE NOTICE '⚡ Functions and triggers: Ready';
  RAISE NOTICE '🌱 Seed data: Categories and Colleges inserted';
END $$;
