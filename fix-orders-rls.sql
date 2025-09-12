-- Direct SQL commands to fix RLS policies on orders table
-- Compatible with PostgreSQL versions without forcerowsecurity column

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- Check existing policies (if accessible)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Orders are only visible to authenticated users" ON orders;
DROP POLICY IF EXISTS "Users can only see their own orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "orders_policy" ON orders;

-- Create a permissive policy that allows public access
CREATE POLICY "Public can access all orders" ON orders
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- Alternative: Disable RLS entirely (uncomment if policy approach doesn't work)
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Verify the new policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orders';
