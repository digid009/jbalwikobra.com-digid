-- Add Missing Website Settings Columns
-- Run this SQL in Supabase Dashboard SQL Editor to ensure all columns are present

-- Add missing columns to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT,
ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS social_media_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT,
ADD COLUMN IF NOT EXISTS topup_game_url TEXT;

-- Update any NULL values for boolean fields to have defaults
UPDATE public.website_settings 
SET 
  newsletter_enabled = COALESCE(newsletter_enabled, true),
  social_media_enabled = COALESCE(social_media_enabled, true)
WHERE newsletter_enabled IS NULL OR social_media_enabled IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.website_settings.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.website_settings.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN public.website_settings.company_description IS 'Company description for footer and about sections';
COMMENT ON COLUMN public.website_settings.support_email IS 'Support email address';
COMMENT ON COLUMN public.website_settings.business_hours IS 'Business operating hours';
COMMENT ON COLUMN public.website_settings.footer_copyright_text IS 'Copyright text for footer';
COMMENT ON COLUMN public.website_settings.newsletter_enabled IS 'Enable newsletter signup in footer';
COMMENT ON COLUMN public.website_settings.social_media_enabled IS 'Show social media links in footer';
COMMENT ON COLUMN public.website_settings.whatsapp_channel_url IS 'WhatsApp channel broadcast URL';
COMMENT ON COLUMN public.website_settings.topup_game_url IS 'Top up game redirect URL';

-- Verify all columns exist
SELECT 
  id,
  site_name,
  logo_url,
  favicon_url,
  contact_email,
  support_email,
  contact_phone,
  whatsapp_number,
  address,
  business_hours,
  hero_title,
  hero_subtitle,
  facebook_url,
  instagram_url,
  tiktok_url,
  youtube_url,
  twitter_url,
  company_description,
  footer_copyright_text,
  newsletter_enabled,
  social_media_enabled,
  whatsapp_channel_url,
  topup_game_url,
  updated_at
FROM public.website_settings;
