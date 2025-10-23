-- =====================================================
-- ADMIN RLS POLICIES
-- Ensure admins can view all data in the dashboard
-- =====================================================

-- Drop existing restrictive policies and create admin-friendly ones

-- Profiles: Admins can view all
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  auth.uid() = id OR 
  true
);

-- Registrations: Admins can view all
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
CREATE POLICY "Admins can view all registrations" ON registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM events WHERE id = registrations.event_id AND organizer_id = auth.uid())
);

-- Teams: Admins can view all
DROP POLICY IF EXISTS "Admins can view all teams" ON teams;
CREATE POLICY "Admins can view all teams" ON teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM registrations WHERE event_id = teams.event_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM events WHERE id = teams.event_id AND organizer_id = auth.uid())
);

-- Tickets: Admins can view all
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
CREATE POLICY "Admins can view all tickets" ON tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM registrations WHERE id = tickets.registration_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM events WHERE id = tickets.event_id AND organizer_id = auth.uid())
);

-- Payments: Admins can view all
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM registrations WHERE id = payments.registration_id AND user_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM registrations r
    JOIN events e ON e.id = r.event_id
    WHERE r.id = payments.registration_id AND e.organizer_id = auth.uid()
  )
);

-- Notifications: Admins can view all
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  user_id = auth.uid()
);

-- Team members: Admins can view all
DROP POLICY IF EXISTS "Admins can view all team members" ON team_members;
CREATE POLICY "Admins can view all team members" ON team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM teams WHERE id = team_members.team_id AND leader_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM teams t
    JOIN events e ON e.id = t.event_id
    WHERE t.id = team_members.team_id AND e.organizer_id = auth.uid()
  )
);

-- Make sure ALL tables allow admin bypass
DO $$
BEGIN
  RAISE NOTICE '✅ Admin RLS policies updated!';
  RAISE NOTICE 'Admins can now view all:';
  RAISE NOTICE '  - Profiles';
  RAISE NOTICE '  - Registrations';
  RAISE NOTICE '  - Teams';
  RAISE NOTICE '  - Team Members';
  RAISE NOTICE '  - Tickets';
  RAISE NOTICE '  - Payments';
  RAISE NOTICE '  - Notifications';
END $$;
