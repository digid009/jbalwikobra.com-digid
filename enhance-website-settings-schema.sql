-- Add additional fields to website_settings table for enhanced footer functionality
-- Run this after the main website_settings table exists

-- Add Twitter/X URL field
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500);

-- Add company description field
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- Add support email field (separate from contact email)
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS support_email VARCHAR(255);

-- Add business hours field
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS business_hours TEXT;

-- Add footer copyright text field
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS footer_copyright_text VARCHAR(500);

-- Add newsletter signup enabled flag
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT true;

-- Add social media display preferences
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS social_media_enabled BOOLEAN DEFAULT true;

-- Update existing row with default values if empty (handle any existing row)
UPDATE website_settings 
SET 
  company_description = COALESCE(company_description, 'Platform terpercaya untuk jual beli akun game dengan harga terbaik. Aman, cepat, dan mudah untuk semua gamers Indonesia.'),
  footer_copyright_text = COALESCE(footer_copyright_text, 'All rights reserved.'),
  newsletter_enabled = COALESCE(newsletter_enabled, true),
  social_media_enabled = COALESCE(social_media_enabled, true),
  business_hours = COALESCE(business_hours, '24/7 Customer Support');

-- Insert a default row if none exists
INSERT INTO website_settings (
  id,
  site_name,
  company_description,
  contact_email,
  contact_phone,
  address,
  footer_copyright_text,
  newsletter_enabled,
  social_media_enabled,
  business_hours
) 
SELECT 
  gen_random_uuid(),
  'JBalwikobra',
  'Platform terpercaya untuk jual beli akun game dengan harga terbaik. Aman, cepat, dan mudah untuk semua gamers Indonesia.',
  'support@jbalwikobra.com',
  '+62 812-3456-7890',
  'Jakarta, Indonesia',
  'All rights reserved.',
  true,
  true,
  '24/7 Customer Support'
WHERE NOT EXISTS (SELECT 1 FROM website_settings);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_website_settings_updated_at ON website_settings(updated_at);

-- Add comments for documentation
COMMENT ON COLUMN website_settings.company_description IS 'Company description shown in footer';
COMMENT ON COLUMN website_settings.support_email IS 'Dedicated support email address';
COMMENT ON COLUMN website_settings.twitter_url IS 'Twitter/X social media URL';
COMMENT ON COLUMN website_settings.business_hours IS 'Business operation hours text';
COMMENT ON COLUMN website_settings.footer_copyright_text IS 'Custom copyright text for footer';
COMMENT ON COLUMN website_settings.newsletter_enabled IS 'Enable/disable newsletter subscription';
COMMENT ON COLUMN website_settings.social_media_enabled IS 'Show/hide social media links in footer';

-- Verify the changes
SELECT 
  site_name,
  company_description,
  contact_email,
  support_email,
  contact_phone,
  address,
  facebook_url,
  instagram_url,
  twitter_url,
  tiktok_url,
  youtube_url,
  business_hours,
  footer_copyright_text,
  newsletter_enabled,
  social_media_enabled
FROM website_settings 
LIMIT 1;
