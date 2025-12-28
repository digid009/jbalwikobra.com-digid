-- Add service_role policies to all admin-related tables
-- This ensures the admin API can access all necessary data when using service_role key

-- Notifications table - for admin notifications
CREATE POLICY IF NOT EXISTS "notifications_service_role_all" ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "notifications_service_role_all" ON public.notifications IS 
'Allows service role to access notifications for admin dashboard.';

-- Payments table - for order payment information
CREATE POLICY IF NOT EXISTS "payments_service_role_all" ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "payments_service_role_all" ON public.payments IS 
'Allows service role to access payment records for admin order management.';

-- Products table - for admin product management
CREATE POLICY IF NOT EXISTS "products_service_role_all" ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "products_service_role_all" ON public.products IS 
'Allows service role to access products for admin dashboard and product management.';

-- Reviews table - for admin review management
CREATE POLICY IF NOT EXISTS "reviews_service_role_all" ON public.reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "reviews_service_role_all" ON public.reviews IS 
'Allows service role to access reviews for admin dashboard statistics.';

-- Flash sales table - for admin flash sales management
CREATE POLICY IF NOT EXISTS "flash_sales_service_role_all" ON public.flash_sales
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "flash_sales_service_role_all" ON public.flash_sales IS 
'Allows service role to access flash sales for admin dashboard statistics.';

-- Website settings table - for admin settings management
CREATE POLICY IF NOT EXISTS "website_settings_service_role_all" ON public.website_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "website_settings_service_role_all" ON public.website_settings IS 
'Allows service role to access and update website settings from admin API.';
