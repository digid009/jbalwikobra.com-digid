-- Comprehensive verification and setup of service_role policies for all admin tables
-- This ensures the admin API can access all necessary data when using service_role key

-- Users table - CRITICAL for admin user management
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_service_role_all" ON public.users;
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "users_service_role_all" ON public.users IS 
'Allows service role to access users for admin dashboard and user management.';

-- Orders table - CRITICAL for admin order management
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_service_role_all" ON public.orders;
CREATE POLICY "orders_service_role_all" ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "orders_service_role_all" ON public.orders IS 
'Allows service role to access orders for admin dashboard and order management.';

-- Products table - CRITICAL for admin product management
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_service_role_all" ON public.products;
CREATE POLICY "products_service_role_all" ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "products_service_role_all" ON public.products IS 
'Allows service role to access products for admin dashboard and product management.';

-- Payments table - for order payment information
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_service_role_all" ON public.payments;
CREATE POLICY "payments_service_role_all" ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "payments_service_role_all" ON public.payments IS 
'Allows service role to access payment records for admin order management.';

-- Notifications/Admin notifications table - for admin notifications
-- Check both possible table names
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "notifications_service_role_all" ON public.notifications;
    CREATE POLICY "notifications_service_role_all" ON public.notifications
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_notifications') THEN
    ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "admin_notifications_service_role_all" ON public.admin_notifications;
    CREATE POLICY "admin_notifications_service_role_all" ON public.admin_notifications
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Reviews table - for admin review management
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "reviews_service_role_all" ON public.reviews;
    CREATE POLICY "reviews_service_role_all" ON public.reviews
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Flash sales table - for admin flash sales management
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flash_sales') THEN
    ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "flash_sales_service_role_all" ON public.flash_sales;
    CREATE POLICY "flash_sales_service_role_all" ON public.flash_sales
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Website settings table - for admin settings management
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'website_settings') THEN
    ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "website_settings_service_role_all" ON public.website_settings;
    CREATE POLICY "website_settings_service_role_all" ON public.website_settings
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- User sessions table - for session management
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
    ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "user_sessions_service_role_all" ON public.user_sessions;
    CREATE POLICY "user_sessions_service_role_all" ON public.user_sessions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE 'Service role policies verified and updated for all admin tables';
END $$;
