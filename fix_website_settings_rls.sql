-- Fix Website Settings RLS Policy for Admin Updates
-- Run this SQL in Supabase Dashboard SQL Editor

-- Check current RLS policies on website_settings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'website_settings';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "settings_write_auth" ON public.website_settings;
DROP POLICY IF EXISTS "settings_read_all" ON public.website_settings;

-- Create new permissive policies for website_settings
-- Allow anyone to read settings (needed for public website)
CREATE POLICY "website_settings_read_all" 
ON public.website_settings 
FOR SELECT 
USING (true);

-- Allow authenticated users to update settings (for admin panel)
CREATE POLICY "website_settings_update_auth" 
ON public.website_settings 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert settings (for initial setup)
CREATE POLICY "website_settings_insert_auth" 
ON public.website_settings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'website_settings';

-- Test if we can read current settings
SELECT id, site_name, hero_button_url, topup_game_url, whatsapp_channel_url, updated_at
FROM public.website_settings;
