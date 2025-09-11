-- Fix RLS policies for orders table to allow admin access
-- This will enable the admin dashboard to display order data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can read orders" ON orders;
DROP POLICY IF EXISTS "Admin can insert orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;

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
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id
      WHERE u.id = auth.uid()
        AND au.is_active = true
        AND au.role IN ('super_admin', 'admin')
    )
  );

-- Allow authenticated admin users to insert orders
CREATE POLICY "Admin users can insert orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id
      WHERE u.id = auth.uid()
        AND au.is_active = true
        AND au.role IN ('super_admin', 'admin')
    )
  );

-- Allow authenticated admin users to update orders
CREATE POLICY "Admin users can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id
      WHERE u.id = auth.uid()
        AND au.is_active = true
        AND au.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id
      WHERE u.id = auth.uid()
        AND au.is_active = true
        AND au.role IN ('super_admin', 'admin')
    )
  );

-- Allow authenticated admin users to delete orders
CREATE POLICY "Admin users can delete orders" ON orders
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN auth.users u ON au.user_id = u.id
      WHERE u.id = auth.uid()
        AND au.is_active = true
        AND au.role IN ('super_admin', 'admin')
    )
  );

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
