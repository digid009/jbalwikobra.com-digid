-- Fix RLS policies for users table
-- Date: 2025-12-30
-- Issue: Admin API cannot query users due to RLS policies
-- 975 users exist in database but queries return 0

-- Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users are viewable by admins" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role can do everything (bypass RLS)
-- This ensures admin API with service role key can query all users
CREATE POLICY "Service role has full access"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Authenticated users can view all users (read-only)
CREATE POLICY "Authenticated users can view all users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can view their own data
CREATE POLICY "Users can view own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 5: Admin users can do everything
CREATE POLICY "Admin users have full access"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Verify policies
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated for users table';
  RAISE NOTICE 'Service role: Full access (bypass RLS)';
  RAISE NOTICE 'Authenticated: Read all, update own';
  RAISE NOTICE 'Admins: Full access';
END $$;

-- Test query (should return count of users)
SELECT COUNT(*) as total_users FROM users;
