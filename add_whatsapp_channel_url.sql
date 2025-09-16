-- Add WhatsApp channel URL column to website_settings table
-- Run this SQL in Supabase Dashboard SQL Editor

-- Add whatsapp_channel_url column to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT;

-- Update the existing row with a default WhatsApp channel URL (optional)
-- You can update this with your actual WhatsApp channel URL
UPDATE public.website_settings 
SET whatsapp_channel_url = 'https://whatsapp.com/channel/0029VaC7K3a7DAX9YbCFSb1V'
WHERE whatsapp_channel_url IS NULL;

-- Verify the column was added successfully
SELECT 
  id,
  site_name,
  whatsapp_number,
  whatsapp_channel_url,
  updated_at
FROM public.website_settings;

-- Comment explaining the new column
COMMENT ON COLUMN public.website_settings.whatsapp_channel_url IS 'URL for WhatsApp channel broadcast link';
