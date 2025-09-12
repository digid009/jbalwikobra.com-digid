-- This script helps debug RLS issues for the admin panel

-- First, let's check what RLS policies exist for the orders table
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- Check if RLS is enabled for orders table
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- Temporarily create a policy for admin access (if needed)
-- This should be run with admin privileges

-- CREATE POLICY "Admin can access all orders" ON orders
-- FOR ALL
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);

-- Or alternatively, check if we need to grant SELECT permissions
-- GRANT SELECT ON orders TO authenticated;

-- Let's also check what the current user/role is
SELECT current_user, current_setting('role');

-- Check table permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'orders';

-- Sample query to test if data is accessible
SELECT COUNT(*) as total_orders FROM orders LIMIT 1;
