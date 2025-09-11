-- Simple RLS fix for orders table to allow admin dashboard access
-- This creates minimal policies for the admin interface to function

-- Drop all existing policies on orders
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON orders';
    END LOOP;
END $$;

-- Disable RLS temporarily to clear any issues
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for backend operations)
CREATE POLICY "service_role_all_orders" ON orders
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- For admin dashboard: Allow read access to anonymous role
-- This is needed because the admin service uses anon key
-- In production, this should be replaced with proper auth
CREATE POLICY "admin_dashboard_read_orders" ON orders
    FOR SELECT TO anon, authenticated
    USING (true);

-- Grant necessary table permissions
GRANT SELECT ON orders TO anon;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
