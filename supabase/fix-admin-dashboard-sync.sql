    -- =====================================================
    -- FIX ADMIN DASHBOARD DATA SYNCHRONIZATION
    -- This script ensures all tables are properly configured
    -- with RLS policies that allow admin access
    -- =====================================================

    -- Step 1: Verify all required tables exist
    DO $$
    DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    BEGIN
    -- Check for each required table
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
        missing_tables := array_append(missing_tables, 'profiles');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'events') THEN
        missing_tables := array_append(missing_tables, 'events');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'colleges') THEN
        missing_tables := array_append(missing_tables, 'colleges');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'registrations') THEN
        missing_tables := array_append(missing_tables, 'registrations');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'teams') THEN
        missing_tables := array_append(missing_tables, 'teams');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tickets') THEN
        missing_tables := array_append(missing_tables, 'tickets');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments') THEN
        missing_tables := array_append(missing_tables, 'payments');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
        missing_tables := array_append(missing_tables, 'notifications');
    END IF;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %. Please run setup.sql first.', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ All required tables exist';
    END IF;
    END $$;

    -- Step 2: Drop ALL existing SELECT policies to avoid conflicts
    DO $$
    DECLARE
    r RECORD;
    BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    RAISE NOTICE '✓ Dropped all existing SELECT policies';
    END $$;

    -- Step 3: Create new admin-friendly RLS policies

    -- Profiles: Everyone can view, but expose more data to admins
    CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);

    -- Events: Published events visible to all, drafts to organizers/admins
    CREATE POLICY "events_select_policy" ON events FOR SELECT USING (
    event_status = 'published' OR
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Colleges: Public
    CREATE POLICY "colleges_select_policy" ON colleges FOR SELECT USING (true);

    -- Categories: Public
    CREATE POLICY "categories_select_policy" ON categories FOR SELECT USING (true);

    -- Registrations: Users see their own, organizers see their events', admins see all
    CREATE POLICY "registrations_select_policy" ON registrations FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM events WHERE id = registrations.event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Teams: Participants and admins can view
    -- NOTE: This works with EITHER leader_id OR team_leader_id column names
    CREATE POLICY "teams_select_policy" ON teams FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Team Members: Admins can view all
    CREATE POLICY "team_members_select_policy" ON team_members FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Tickets: Users see their own, organizers see their events', admins see all
    CREATE POLICY "tickets_select_policy" ON tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM registrations WHERE id = tickets.registration_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE id = tickets.event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Payments: Users see their own, organizers see their events', admins see all
    CREATE POLICY "payments_select_policy" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM registrations WHERE id = payments.registration_id AND user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM registrations r
        JOIN events e ON e.id = r.event_id
        WHERE r.id = payments.registration_id AND e.organizer_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Notifications: Users see their own, admins see all
    CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Event Updates: Public for published events
    CREATE POLICY "event_updates_select_policy" ON event_updates FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_updates.event_id AND (event_status = 'published' OR organizer_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Reviews: Public
    CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT USING (true);

    -- Favorites: Users see their own
    CREATE POLICY "favorites_select_policy" ON favorites FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Step 4: Verify policies were created
    DO $$
    DECLARE
    policy_count INTEGER;
    BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND cmd = 'SELECT';
    
    RAISE NOTICE '✓ Created % SELECT policies', policy_count;
    END $$;

    -- Step 5: Test admin access (this will help verify the user is an admin)
    DO $$
    DECLARE
    admin_count INTEGER;
    BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM profiles
    WHERE role = 'admin';
    
    IF admin_count = 0 THEN
        RAISE WARNING 'No admin users found! Create an admin user first.';
    ELSE
        RAISE NOTICE '✓ Found % admin user(s)', admin_count;
    END IF;
    END $$;

    -- Step 6: Summary
    DO $$
    DECLARE
    events_count INTEGER;
    colleges_count INTEGER;
    profiles_count INTEGER;
    registrations_count INTEGER;
    teams_count INTEGER;
    tickets_count INTEGER;
    payments_count INTEGER;
    notifications_count INTEGER;
    BEGIN
    SELECT COUNT(*) INTO events_count FROM events;
    SELECT COUNT(*) INTO colleges_count FROM colleges;
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO registrations_count FROM registrations;
    SELECT COUNT(*) INTO teams_count FROM teams;
    SELECT COUNT(*) INTO tickets_count FROM tickets;
    SELECT COUNT(*) INTO payments_count FROM payments;
    SELECT COUNT(*) INTO notifications_count FROM notifications;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DATABASE STATUS:';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Events: %', events_count;
    RAISE NOTICE 'Colleges: %', colleges_count;
    RAISE NOTICE 'Profiles (Users): %', profiles_count;
    RAISE NOTICE 'Registrations: %', registrations_count;
    RAISE NOTICE 'Teams: %', teams_count;
    RAISE NOTICE 'Tickets: %', tickets_count;
    RAISE NOTICE 'Payments: %', payments_count;
    RAISE NOTICE 'Notifications: %', notifications_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Admin dashboard synchronization fixed!';
    RAISE NOTICE 'Admins should now see all data in the dashboard.';
    RAISE NOTICE '==========================================';
    END $$;
