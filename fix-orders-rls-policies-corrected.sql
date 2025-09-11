-- Fix RLS policies for orders table to allow admin access
-- This will enable the admin dashboard to display order data
-- Using existing users table with is_admin field

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can read orders" ON orders;
DROP POLICY IF EXISTS "Admin can insert orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to orders
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admin users to read all orders
CREATE POLICY "Admin users can read orders" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = true
        AND u.is_active = true
    )
  );

-- Allow authenticated admin users to insert orders
CREATE POLICY "Admin users can insert orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = true
        AND u.is_active = true
    )
  );

-- Allow authenticated admin users to update orders
CREATE POLICY "Admin users can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = true
        AND u.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = true
        AND u.is_active = true
    )
  );

-- Allow authenticated admin users to delete orders
CREATE POLICY "Admin users can delete orders" ON orders
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.is_admin = true
        AND u.is_active = true
    )
  );

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
