-- Add New Hero Button URL column to website_settings table
-- Run this SQL in Supabase Dashboard SQL Editor

-- Add hero_button_url column to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS hero_button_url TEXT;

-- Update the existing row with a default URL (optional)
-- You can update this with your actual hero button URL
UPDATE public.website_settings 
SET hero_button_url = 'https://jbalwikobra.com/special-offer'
WHERE hero_button_url IS NULL;

-- Verify the column was added successfully
SELECT 
  id,
  site_name,
  hero_title,
  hero_subtitle,
  hero_button_url,
  topup_game_url,
  whatsapp_channel_url,
  updated_at
FROM public.website_settings;

-- Add comment for documentation
COMMENT ON COLUMN public.website_settings.hero_button_url IS 'URL for the new hero section button';
