-- Set admin flag for admin@jbalwikobra.com
-- This fixes the issue where admin users are not recognized as admin after login

-- Update the admin user to ensure is_admin is set to true
UPDATE public.users 
SET is_admin = true
WHERE email = 'admin@jbalwikobra.com';

-- Verify the update
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.users WHERE email = 'admin@jbalwikobra.com' AND is_admin = true;
  
  IF admin_count = 0 THEN
    RAISE WARNING 'Admin user not found or not updated. Please verify admin@jbalwikobra.com exists in the users table.';
  ELSE
    RAISE NOTICE 'Successfully set is_admin = true for admin@jbalwikobra.com';
  END IF;
END $$;
