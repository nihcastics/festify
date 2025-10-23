-- Quick fix: Add pricing columns to events table
-- Run this in Supabase SQL Editor to enable event pricing

-- Create participation type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE participation_type AS ENUM ('individual', 'team', 'both');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS participation_type participation_type DEFAULT 'individual';

ALTER TABLE events
ADD COLUMN IF NOT EXISTS individual_price DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE events
ADD COLUMN IF NOT EXISTS team_base_price DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE events
ADD COLUMN IF NOT EXISTS price_per_member DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE events
ADD COLUMN IF NOT EXISTS has_custom_team_pricing BOOLEAN DEFAULT false;

-- Update existing events to have default pricing based on their data
UPDATE events
SET individual_price = 100
WHERE (individual_price = 0 OR individual_price IS NULL)
  AND participation_type IS NULL;

-- Set participation_type for events that don't have it
UPDATE events
SET participation_type = 'individual'
WHERE participation_type IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRICING COLUMNS ADDED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added columns to events table:';
  RAISE NOTICE '  - participation_type (ENUM)';
  RAISE NOTICE '  - individual_price (DECIMAL) - defaults to ₹100';
  RAISE NOTICE '  - team_base_price (DECIMAL)';
  RAISE NOTICE '  - price_per_member (DECIMAL)';
  RAISE NOTICE '  - has_custom_team_pricing (BOOLEAN)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All existing events now have ₹100 as default price';
  RAISE NOTICE 'You can update prices in the admin dashboard!';
  RAISE NOTICE '========================================';
END $$;
