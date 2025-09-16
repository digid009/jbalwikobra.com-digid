-- Add Top Up Game URL column to website_settings table
-- Run this SQL in Supabase Dashboard SQL Editor

-- Add topup_game_url column to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS topup_game_url TEXT;

-- Update the existing row with a default Top Up Game URL (optional)
-- You can update this with your actual Top Up Game URL
UPDATE public.website_settings 
SET topup_game_url = 'https://jbalwikobra.com/topup-game'
WHERE topup_game_url IS NULL;

-- Verify the column was added successfully
SELECT 
  id,
  site_name,
  whatsapp_number,
  whatsapp_channel_url,
  topup_game_url,
  updated_at
FROM public.website_settings;

-- Comment explaining the new column
COMMENT ON COLUMN public.website_settings.topup_game_url IS 'URL for Top Up Game button redirect';
