-- Complete Fix for Website Settings Admin Panel Issue
-- This addresses both RLS policies and missing column
-- Run this SQL in Supabase Dashboard SQL Editor

-- Step 1: Add hero_button_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'website_settings' 
        AND column_name = 'hero_button_url'
    ) THEN
        ALTER TABLE public.website_settings 
        ADD COLUMN hero_button_url TEXT;
        
        UPDATE public.website_settings 
        SET hero_button_url = 'https://jbalwikobra.com/special-offer'
        WHERE hero_button_url IS NULL;
        
        RAISE NOTICE 'hero_button_url column added successfully';
    ELSE
        RAISE NOTICE 'hero_button_url column already exists';
    END IF;
END $$;

-- Step 2: Fix RLS policies
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "settings_write_auth" ON public.website_settings;
DROP POLICY IF EXISTS "settings_read_all" ON public.website_settings;
DROP POLICY IF EXISTS "website_settings_read_all" ON public.website_settings;
DROP POLICY IF EXISTS "website_settings_update_auth" ON public.website_settings;
DROP POLICY IF EXISTS "website_settings_insert_auth" ON public.website_settings;

-- Create new permissive policies
-- Allow anyone to read settings (needed for public website)
CREATE POLICY "website_settings_select_public" 
ON public.website_settings 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update/delete settings (for admin panel)
CREATE POLICY "website_settings_all_auth" 
ON public.website_settings 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 3: Verify everything is working
-- Check policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'website_settings'
ORDER BY policyname;

-- Check column exists and show current data
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'website_settings' 
AND column_name IN ('hero_button_url', 'topup_game_url', 'whatsapp_channel_url')
ORDER BY column_name;

-- Show current settings data
SELECT 
  id,
  site_name,
  hero_button_url,
  topup_game_url,
  whatsapp_channel_url,
  updated_at
FROM public.website_settings;
