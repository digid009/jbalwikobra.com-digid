-- ===========================================================================
-- COMPLETE RLS FIX FOR FAVICON, LOGO, AND PUBLIC DATA ACCESS
-- ===========================================================================
-- 
-- This script fixes all RLS policies to allow anonymous (unauthenticated) users
-- to access public-facing data while maintaining security for sensitive operations.
--
-- TABLES AFFECTED:
-- 1. website_settings - For favicon, logo, and site information
-- 2. products - For product browsing
-- 3. banners - For homepage banners
-- 4. flash_sales - For flash sale listings
-- 5. categories - For product categories
-- 6. game_titles - For game listings
-- 7. tiers - For product tiers (if exists)
-- 8. rental_options - For rental product options
-- 9. reviews - For product reviews
-- 10. product_likes - For like counts
-- 11. feed_posts - For community feed
-- 12. feed_comments - For feed comments
-- 13. feed_post_likes - For feed likes
-- 14. storage.objects - For public images
--
-- RUN THIS SCRIPT: Copy and paste into Supabase SQL Editor
-- ===========================================================================

BEGIN;

-- ===========================================================================
-- 1. WEBSITE_SETTINGS - Critical for favicon and logo
-- ===========================================================================
DROP POLICY IF EXISTS "website_settings_auth_select" ON public.website_settings;

CREATE POLICY "website_settings_public_select" ON public.website_settings
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.website_settings TO anon;

-- ===========================================================================
-- 2. PRODUCTS - Allow public browsing of active products
-- ===========================================================================
DROP POLICY IF EXISTS "products_auth_select" ON public.products;

CREATE POLICY "products_public_select" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.products TO anon;

-- ===========================================================================
-- 3. BANNERS - Allow public viewing of banners
-- ===========================================================================
DROP POLICY IF EXISTS "banners_auth_select" ON public.banners;

CREATE POLICY "banners_public_select" ON public.banners
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.banners TO anon;

-- ===========================================================================
-- 4. FLASH_SALES - Allow public viewing of active flash sales
-- ===========================================================================
DROP POLICY IF EXISTS "flash_sales_auth_select" ON public.flash_sales;

CREATE POLICY "flash_sales_public_select" ON public.flash_sales
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.flash_sales TO anon;

-- ===========================================================================
-- 5. CATEGORIES - Allow public viewing of active categories
-- ===========================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_auth_select" ON public.categories;
DROP POLICY IF EXISTS "categories_select" ON public.categories;

CREATE POLICY "categories_public_select" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.categories TO anon;

-- ===========================================================================
-- 6. GAME_TITLES - Allow public viewing of active game titles
-- ===========================================================================
DROP POLICY IF EXISTS "game_titles_auth_select" ON public.game_titles;

CREATE POLICY "game_titles_public_select" ON public.game_titles
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.game_titles TO anon;

-- ===========================================================================
-- 7. TIERS - Allow public viewing of active tiers (if table exists)
-- ===========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tiers') THEN
    EXECUTE 'ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "tiers_auth_select" ON public.tiers';
    EXECUTE 'DROP POLICY IF EXISTS "tiers_select" ON public.tiers';
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'tiers' 
      AND policyname = 'tiers_public_select'
    ) THEN
      EXECUTE 'CREATE POLICY "tiers_public_select" ON public.tiers
        FOR SELECT TO anon, authenticated
        USING (is_active = true)';
    END IF;
    
    EXECUTE 'GRANT SELECT ON public.tiers TO anon';
  END IF;
END $$;

-- ===========================================================================
-- 8. RENTAL_OPTIONS - Allow public viewing of rental options
-- ===========================================================================
DROP POLICY IF EXISTS "rental_options_auth_select" ON public.rental_options;

CREATE POLICY "rental_options_public_select" ON public.rental_options
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.rental_options TO anon;

-- ===========================================================================
-- 9. REVIEWS - Allow public viewing of all reviews
-- ===========================================================================
DROP POLICY IF EXISTS "reviews_auth_select" ON public.reviews;

CREATE POLICY "reviews_public_select" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.reviews TO anon;

-- ===========================================================================
-- 10. PRODUCT_LIKES - Allow public viewing of likes (for counts)
-- ===========================================================================
DROP POLICY IF EXISTS "product_likes_auth_select" ON public.product_likes;

CREATE POLICY "product_likes_public_select" ON public.product_likes
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.product_likes TO anon;

-- ===========================================================================
-- 11. FEED_POSTS - Allow public viewing of non-deleted posts
-- ===========================================================================
DROP POLICY IF EXISTS "feed_posts_auth_select" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_unified_read" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_public_read" ON public.feed_posts;

CREATE POLICY "feed_posts_public_select" ON public.feed_posts
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false);

GRANT SELECT ON public.feed_posts TO anon;

-- ===========================================================================
-- 12. FEED_COMMENTS - Allow public viewing of comments
-- ===========================================================================
DROP POLICY IF EXISTS "feed_comments_auth_select" ON public.feed_comments;
DROP POLICY IF EXISTS "feed_comments_read_all" ON public.feed_comments;

CREATE POLICY "feed_comments_public_select" ON public.feed_comments
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.feed_comments TO anon;

-- ===========================================================================
-- 13. FEED_POST_LIKES - Allow public viewing of likes
-- ===========================================================================
DROP POLICY IF EXISTS "feed_post_likes_auth_select" ON public.feed_post_likes;
DROP POLICY IF EXISTS "feed_post_likes_read_all" ON public.feed_post_likes;

CREATE POLICY "feed_post_likes_public_select" ON public.feed_post_likes
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.feed_post_likes TO anon;

-- ===========================================================================
-- 14. STORAGE.OBJECTS - Allow public viewing of images
-- ===========================================================================
DROP POLICY IF EXISTS "storage_auth_select" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_public_select'
  ) THEN
    CREATE POLICY "storage_public_select" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id IN ('product-images', 'game-logos'));
  END IF;
END $$;

GRANT SELECT ON storage.objects TO anon;

-- ===========================================================================
-- VERIFICATION QUERIES
-- ===========================================================================
-- Run these to verify the policies are correctly set up:

-- Check website_settings policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_settings';

-- Check products policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products';

-- Check storage policies
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- ===========================================================================
-- IMPORTANT NOTES
-- ===========================================================================
-- 
-- 1. All admin write policies (website_settings_admin_all, products_admin_all, etc.)
--    are preserved and unchanged. Only SELECT policies were modified.
--
-- 2. User-specific policies (like reviews_user_all, product_likes_user_all) are
--    preserved for authenticated users to manage their own content.
--
-- 3. Sensitive tables (users, orders, payments, sessions, etc.) remain
--    protected and require authentication.
--
-- 4. This maintains security while allowing public browsing of product catalog
--    and loading of site branding (favicon, logo).
--
-- ===========================================================================

COMMIT;

-- Success! Anonymous users can now:
-- ✓ Load favicon and logo
-- ✓ Browse products and categories
-- ✓ View banners and flash sales
-- ✓ Read reviews and community feed
-- ✓ See product images
