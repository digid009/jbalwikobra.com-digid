-- Fix RLS policies for public access to banners and feed_posts
-- This allows frontend to read public data without authentication

-- For banners table - allow public read access
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;
CREATE POLICY "banners_public_read" ON public.banners
  FOR SELECT
  USING (is_active = true);

-- For feed_posts table - allow public read access to non-deleted posts
DROP POLICY IF EXISTS "feed_posts_public_read" ON public.feed_posts;
CREATE POLICY "feed_posts_public_read" ON public.feed_posts
  FOR SELECT
  USING (is_deleted = false);

-- Enable RLS if not already enabled
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.banners TO anon;
GRANT SELECT ON public.feed_posts TO anon;
GRANT SELECT ON public.banners TO authenticated;
GRANT SELECT ON public.feed_posts TO authenticated;
