# Database Migration Required

## Action Required

A new database migration has been created to add missing columns to the `website_settings` table.

**Migration File:** `supabase/migrations/20251227_add_missing_website_settings_columns.sql`

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
# Make sure you're logged in to Supabase
supabase login

# Link to your project if not already linked
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration to your database
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20251227_add_missing_website_settings_columns.sql`
4. Paste and run the SQL in the editor

### Option 3: Manual SQL Execution
Connect to your database and run the migration file directly:
```bash
psql YOUR_DATABASE_URL -f supabase/migrations/20251227_add_missing_website_settings_columns.sql
```

## What This Migration Does

Adds the following columns to `website_settings` table:
- `support_email` - Support email address for customer inquiries
- `business_hours` - Business operating hours
- `company_description` - Company description text
- `twitter_url` - Twitter/X profile URL
- `youtube_url` - YouTube channel URL
- `footer_copyright_text` - Copyright text displayed in footer
- `newsletter_enabled` - Enable/disable newsletter subscription feature
- `social_media_enabled` - Enable/disable social media links
- `topup_game_url` - URL for top-up game services
- `whatsapp_channel_url` - WhatsApp channel URL for announcements
- `hero_button_url` - Main call-to-action button URL on hero section

## After Running the Migration

The application will now properly fetch all settings from the database, including:
- Logo and favicon URLs
- All social media links
- Hero section URLs (topup, WhatsApp channel, etc.)
- Footer and business information

## Verification

After applying the migration, you can verify it worked by:
1. Opening the admin settings page
2. Checking that all fields load correctly from the database
3. Verifying that changes made in admin settings appear on the public site

## Note

The fallback URLs in the code have been updated to match your production values, but the primary source of truth should always be the database values set through the admin panel.
