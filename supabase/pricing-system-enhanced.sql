-- Enhanced Pricing System for Events
-- Supports individual, team pricing with variable team sizes

-- Add pricing columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS individual_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_base_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_member DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_custom_team_pricing BOOLEAN DEFAULT false;

-- Create team pricing tiers table for complex pricing
CREATE TABLE IF NOT EXISTS team_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  min_members INTEGER NOT NULL,
  max_members INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_member_range CHECK (min_members <= max_members),
  CONSTRAINT positive_price CHECK (price >= 0)
);

-- Create payment_status enum first (before adding column)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
  END IF;
END $$;

-- Add payment tracking to registrations
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Function to calculate registration price
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

-- Function to process payment and confirm registration
CREATE OR REPLACE FUNCTION process_registration_payment(
  p_registration_id UUID,
  p_amount DECIMAL(10,2),
  p_payment_method TEXT DEFAULT 'bypass',
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
BEGIN
  -- Get registration details
  SELECT event_id, user_id
  INTO v_event_id, v_user_id
  FROM registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  -- Update registration with payment info
  UPDATE registrations
  SET 
    payment_status = 'completed',
    amount_paid = p_amount,
    payment_method = p_payment_method,
    payment_transaction_id = COALESCE(p_transaction_id, 'BYPASS-' || gen_random_uuid()::TEXT),
    payment_completed_at = NOW(),
    registration_status = 'confirmed'
  WHERE id = p_registration_id;

  -- Increment attendee count (if not already done)
  PERFORM increment_event_attendees(v_event_id);

  -- Create confirmation notification
  INSERT INTO notifications (user_id, event_id, registration_id, notification_type, message)
  VALUES (
    v_user_id,
    v_event_id,
    p_registration_id,
    'registration_confirmed',
    'Your payment has been processed and registration is confirmed!'
  );

  RETURN TRUE;
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
    'individual_price', e.individual_price,
    'team_base_price', e.team_base_price,
    'price_per_member', e.price_per_member,
    'has_custom_pricing', e.has_custom_team_pricing,
    'participation_type', e.participation_type,
    'team_size_min', e.team_size_min,
    'team_size_max', e.team_size_max,
    'custom_tiers', (
      SELECT json_agg(
        json_build_object(
          'min_members', min_members,
          'max_members', max_members,
          'price', price
        ) ORDER BY min_members
      )
      FROM team_pricing_tiers
      WHERE event_id = p_event_id
    )
  ) INTO v_result
  FROM events e
  WHERE e.id = p_event_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_pricing_event ON team_pricing_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_amount ON registrations(amount_paid);

-- Enable RLS on team_pricing_tiers
ALTER TABLE team_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_pricing_tiers
CREATE POLICY "Anyone can view pricing tiers"
  ON team_pricing_tiers FOR SELECT
  USING (true);

CREATE POLICY "Event organizers can manage pricing tiers"
  ON team_pricing_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = team_pricing_tiers.event_id
        AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all pricing tiers"
  ON team_pricing_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Update existing events with default pricing (set to 0 if not already set)
UPDATE events 
SET 
  individual_price = 0,
  team_base_price = 0,
  price_per_member = 0
WHERE individual_price IS NULL;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '=== ENHANCED PRICING SYSTEM CREATED ===';
  RAISE NOTICE 'Tables: team_pricing_tiers';
  RAISE NOTICE 'Columns: individual_price, team_base_price, price_per_member, has_custom_team_pricing';
  RAISE NOTICE 'Payment tracking: amount_paid, payment_status, payment_method, transaction_id';
  RAISE NOTICE 'Functions: calculate_registration_price(), process_registration_payment(), get_event_pricing_summary()';
  RAISE NOTICE '=========================================';
END $$;
