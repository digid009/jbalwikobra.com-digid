// Test Admin Settings Functionality with Real Database Data
// Run: node test-admin-settings-crud.js

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xeithuvgldzxnggxadri.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWebsiteSettingsCRUD() {
  console.log('🧪 Testing Website Settings CRUD Operations');
  console.log('🌐 Database URL:', SUPABASE_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Read current settings
    console.log('\n1️⃣ Reading Current Website Settings...');
    const { data: currentSettings, error: readError } = await supabase
      .from('website_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (readError) {
      console.error('❌ Failed to read settings:', readError);
      return;
    }

    if (!currentSettings) {
      console.log('⚠️ No settings found in database');
      return;
    }

    console.log('✅ Current Settings:', {
      id: currentSettings.id,
      site_name: currentSettings.site_name,
      logo_url: currentSettings.logo_url ? 'Present' : 'Missing',
      contact_email: currentSettings.contact_email,
      whatsapp_number: currentSettings.whatsapp_number,
      whatsapp_channel_url: currentSettings.whatsapp_channel_url,
      topup_game_url: currentSettings.topup_game_url,
      company_description: currentSettings.company_description ? 'Present' : 'Missing',
      newsletter_enabled: currentSettings.newsletter_enabled,
      social_media_enabled: currentSettings.social_media_enabled,
    });

    // 2. Test Update Operation (like admin settings form would do)
    console.log('\n2️⃣ Testing Update Operation...');
    const testUpdate = {
      site_name: currentSettings.site_name + ' [UPDATED]',
      company_description: 'Test company description updated by admin settings test',
      newsletter_enabled: !currentSettings.newsletter_enabled,
      business_hours: '24/7 Customer Support [UPDATED]',
      footer_copyright_text: 'All rights reserved [UPDATED]',
    };

    const { data: updatedSettings, error: updateError } = await supabase
      .from('website_settings')
      .update(testUpdate)
      .eq('id', currentSettings.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('❌ Failed to update settings:', updateError);
      return;
    }

    console.log('✅ Update Successful:', {
      site_name: updatedSettings.site_name,
      company_description: updatedSettings.company_description,
      newsletter_enabled: updatedSettings.newsletter_enabled,
      business_hours: updatedSettings.business_hours,
      footer_copyright_text: updatedSettings.footer_copyright_text,
    });

    // 3. Revert changes (restore original values)
    console.log('\n3️⃣ Reverting Test Changes...');
    const revertUpdate = {
      site_name: currentSettings.site_name,
      company_description: currentSettings.company_description,
      newsletter_enabled: currentSettings.newsletter_enabled,
      business_hours: currentSettings.business_hours,
      footer_copyright_text: currentSettings.footer_copyright_text,
    };

    const { error: revertError } = await supabase
      .from('website_settings')
      .update(revertUpdate)
      .eq('id', currentSettings.id);

    if (revertError) {
      console.error('❌ Failed to revert settings:', revertError);
      return;
    }

    console.log('✅ Changes Reverted Successfully');

    // 4. Test Column Availability
    console.log('\n4️⃣ Checking All Expected Columns...');
    const expectedColumns = [
      'id', 'site_name', 'logo_url', 'favicon_url', 'contact_email', 'support_email',
      'contact_phone', 'whatsapp_number', 'address', 'business_hours',
      'hero_title', 'hero_subtitle', 'facebook_url', 'instagram_url', 'tiktok_url',
      'youtube_url', 'twitter_url', 'company_description', 'footer_copyright_text',
      'newsletter_enabled', 'social_media_enabled', 'whatsapp_channel_url', 'topup_game_url'
    ];

    const missingColumns = [];
    const presentColumns = [];

    expectedColumns.forEach(column => {
      if (currentSettings.hasOwnProperty(column)) {
        presentColumns.push(column);
      } else {
        missingColumns.push(column);
      }
    });

    console.log('✅ Present Columns:', presentColumns.length);
    console.log('⚠️ Missing Columns:', missingColumns);

    if (missingColumns.length > 0) {
      console.log('\n📝 Missing columns need to be added to database:');
      console.log('Run: add_missing_website_settings_columns.sql');
    }

    // 5. Final Summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Read Operation: SUCCESS');
    console.log('✅ Update Operation: SUCCESS');
    console.log('✅ Revert Operation: SUCCESS');
    console.log(`✅ Column Coverage: ${presentColumns.length}/${expectedColumns.length}`);
    
    if (missingColumns.length === 0) {
      console.log('\n🎉 All tests passed! Admin Settings can fully edit website_settings table.');
    } else {
      console.log('\n⚠️ Some columns missing. Run the migration script first.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWebsiteSettingsCRUD().catch(console.error);
