-- Create users table for admin panel
-- This table stores user information needed for the admin panel
-- It syncs with auth.users and extends with additional fields

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" ON public.users
      FOR SELECT
      USING (auth.uid() = id);
  END IF;
END$$;

-- Users can update their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" ON public.users
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END$$;

-- Admins can read all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users" ON public.users
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      );
  END IF;
END$$;

-- Admins can update all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Admins can update all users'
  ) THEN
    CREATE POLICY "Admins can update all users" ON public.users
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      );
  END IF;
END$$;

-- Service role can do everything (for backend operations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Service role can do anything'
  ) THEN
    CREATE POLICY "Service role can do anything" ON public.users
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END$$;

-- Create trigger to sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_users_updated_at();

-- Migrate existing profiles data to users table
INSERT INTO public.users (id, name, role, is_admin, created_at, updated_at)
SELECT 
  p.id,
  p.name,
  p.role,
  p.role IN ('admin', 'superadmin', 'super-admin', 'owner') as is_admin,
  p.created_at,
  p.updated_at
FROM public.profiles p
ON CONFLICT (id) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, public.users.name),
  role = COALESCE(EXCLUDED.role, public.users.role),
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- Sync email from auth.users
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND u.email IS NULL;

-- Comment on table
COMMENT ON TABLE public.users IS 'User profiles for the application. Synced with auth.users and extends with additional application-specific fields.';
