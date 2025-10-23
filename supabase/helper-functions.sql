-- =====================================================
-- Helper Functions for Event Management
-- =====================================================

-- Function to increment event attendees count
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_attendees = current_attendees + 1
  WHERE id = event_id
    AND (max_attendees IS NULL OR current_attendees < max_attendees);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement event attendees count
CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events 
  SET current_attendees = GREATEST(0, current_attendees - 1)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if event is full
CREATE OR REPLACE FUNCTION is_event_full(event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_attendees INTEGER;
  v_current_attendees INTEGER;
BEGIN
  SELECT max_attendees, current_attendees 
  INTO v_max_attendees, v_current_attendees
  FROM events 
  WHERE id = event_id;
  
  IF v_max_attendees IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_current_attendees >= v_max_attendees;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can register for event
CREATE OR REPLACE FUNCTION can_user_register(p_user_id UUID, p_event_id UUID)
RETURNS TABLE(
  can_register BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_event_status event_status;
  v_is_global BOOLEAN;
  v_event_college_id UUID;
  v_user_college_id UUID;
  v_registration_exists BOOLEAN;
  v_is_full BOOLEAN;
BEGIN
  -- Get event details
  SELECT event_status, is_global, college_id
  INTO v_event_status, v_is_global, v_event_college_id
  FROM events
  WHERE id = p_event_id;
  
  -- Check if event exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Event not found';
    RETURN;
  END IF;
  
  -- Check if event is published
  IF v_event_status != 'published' THEN
    RETURN QUERY SELECT FALSE, 'Event is not published';
    RETURN;
  END IF;
  
  -- Check if already registered
  SELECT EXISTS(
    SELECT 1 FROM registrations 
    WHERE event_id = p_event_id AND user_id = p_user_id
  ) INTO v_registration_exists;
  
  IF v_registration_exists THEN
    RETURN QUERY SELECT FALSE, 'Already registered for this event';
    RETURN;
  END IF;
  
  -- Check if event is full
  SELECT is_event_full(p_event_id) INTO v_is_full;
  IF v_is_full THEN
    RETURN QUERY SELECT FALSE, 'Event is full';
    RETURN;
  END IF;
  
  -- Check college eligibility if not global
  IF NOT v_is_global AND v_event_college_id IS NOT NULL THEN
    SELECT college_id INTO v_user_college_id
    FROM profiles
    WHERE id = p_user_id;
    
    IF v_user_college_id IS NULL THEN
      RETURN QUERY SELECT FALSE, 'Please update your profile with college information';
      RETURN;
    END IF;
    
    IF v_user_college_id != v_event_college_id THEN
      RETURN QUERY SELECT FALSE, 'This event is only available to students from a specific college';
      RETURN;
    END IF;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT TRUE, 'Can register';
END;
$$ LANGUAGE plpgsql;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '=== HELPER FUNCTIONS CREATED ===';
  RAISE NOTICE 'increment_event_attendees() - Safely increments attendee count';
  RAISE NOTICE 'decrement_event_attendees() - Safely decrements attendee count';
  RAISE NOTICE 'is_event_full() - Checks if event has reached capacity';
  RAISE NOTICE 'can_user_register() - Validates user eligibility for event registration';
  RAISE NOTICE '===================================';
END $$;
