-- Safe Hero Button URL Column Addition
-- This script checks if column exists before adding it

DO $$
BEGIN
    -- Check if hero_button_url column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'website_settings' 
        AND column_name = 'hero_button_url'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.website_settings 
        ADD COLUMN hero_button_url TEXT;
        
        -- Add default value for existing rows
        UPDATE public.website_settings 
        SET hero_button_url = 'https://jbalwikobra.com/special-offer'
        WHERE hero_button_url IS NULL;
        
        RAISE NOTICE 'hero_button_url column added successfully';
    ELSE
        RAISE NOTICE 'hero_button_url column already exists';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.website_settings.hero_button_url IS 'URL for the hero section special offer button';

-- Verify the column exists and show current data
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
