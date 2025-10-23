-- Quick fix: Add only the essential payment columns to registrations table
-- Run this file FIRST in Supabase SQL Editor to enable payment processing

-- Create payment_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'payment_status enum already exists, skipping';
END $$;

-- Add payment columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT false;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_transaction ON registrations(transaction_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PAYMENT COLUMNS ADDED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added columns to registrations table:';
  RAISE NOTICE '  - is_team (BOOLEAN)';
  RAISE NOTICE '  - team_size (INTEGER)';
  RAISE NOTICE '  - payment_status (ENUM)';
  RAISE NOTICE '  - payment_amount (DECIMAL)';
  RAISE NOTICE '  - payment_method (TEXT)';
  RAISE NOTICE '  - transaction_id (TEXT)';
  RAISE NOTICE '  - paid_at (TIMESTAMPTZ)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'You can now process payments!';
  RAISE NOTICE '========================================';
END $$;
