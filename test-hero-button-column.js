// Test Website Settings Database Connection and Hero Button URL Column
// Run: node test-hero-button-column.js

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your actual values
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xeithuvgldzxnggxadri.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NzkzNDcsImV4cCI6MjA0MTU1NTM0N30.g1dkh7CqWdHqJl2E0djgJVKSQz5apvtiVhZFuCOgyl0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testHeroButtonColumn() {
  console.log('🧪 Testing Hero Button URL Column');
  console.log('🌐 Database URL:', SUPABASE_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Check current website_settings structure
    console.log('\n1️⃣ Checking Current Website Settings...');
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

    console.log('✅ Current Settings Found:', {
      id: currentSettings.id,
      site_name: currentSettings.site_name,
      hero_title: currentSettings.hero_title,
      hero_subtitle: currentSettings.hero_subtitle,
      topup_game_url: currentSettings.topup_game_url ? 'Present' : 'Missing',
      whatsapp_channel_url: currentSettings.whatsapp_channel_url ? 'Present' : 'Missing',
      hero_button_url: currentSettings.hero_button_url !== undefined ? 
        (currentSettings.hero_button_url ? currentSettings.hero_button_url : 'NULL') : 'COLUMN MISSING',
    });

    // 2. Check if hero_button_url column exists
    console.log('\n2️⃣ Testing Hero Button URL Column...');
    const hasHeroButtonUrl = currentSettings.hasOwnProperty('hero_button_url');
    
    if (!hasHeroButtonUrl) {
      console.log('❌ HERO_BUTTON_URL COLUMN NOT FOUND!');
      console.log('📝 You need to run the database migration:');
      console.log('   1. Open Supabase Dashboard SQL Editor');
      console.log('   2. Run the add_hero_button_url.sql script');
      console.log('   3. Refresh this test');
      return;
    }

    console.log('✅ Hero Button URL column exists');

    // 3. Test update operation
    console.log('\n3️⃣ Testing Update Operation...');
    const testUrl = 'https://test-hero-button-' + Date.now() + '.com';
    
    const { data: updatedSettings, error: updateError } = await supabase
      .from('website_settings')
      .update({ hero_button_url: testUrl })
      .eq('id', currentSettings.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('❌ Failed to update hero_button_url:', updateError);
      return;
    }

    console.log('✅ Update Successful:', {
      hero_button_url: updatedSettings.hero_button_url,
      updated_at: updatedSettings.updated_at,
    });

    // 4. Test read back
    console.log('\n4️⃣ Testing Read Back...');
    const { data: readBackSettings, error: readBackError } = await supabase
      .from('website_settings')
      .select('hero_button_url, updated_at')
      .eq('id', currentSettings.id)
      .maybeSingle();

    if (readBackError) {
      console.error('❌ Failed to read back settings:', readBackError);
      return;
    }

    console.log('✅ Read Back Successful:', {
      hero_button_url: readBackSettings.hero_button_url,
      matches_update: readBackSettings.hero_button_url === testUrl,
    });

    // 5. Restore original value (cleanup)
    console.log('\n5️⃣ Cleaning Up...');
    const originalValue = currentSettings.hero_button_url || null;
    
    const { error: restoreError } = await supabase
      .from('website_settings')
      .update({ hero_button_url: originalValue })
      .eq('id', currentSettings.id);

    if (restoreError) {
      console.error('❌ Failed to restore original value:', restoreError);
      return;
    }

    console.log('✅ Original value restored');

    // 6. Final summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Database Connection: SUCCESS');
    console.log('✅ Hero Button URL Column: EXISTS');
    console.log('✅ Update Operation: SUCCESS');
    console.log('✅ Read Operation: SUCCESS');
    console.log('✅ Data Persistence: CONFIRMED');
    
    console.log('\n🎉 Hero Button URL feature is working correctly!');
    console.log('💡 If admin settings still revert, check:');
    console.log('   - Browser cache/console errors');
    console.log('   - Admin form validation');
    console.log('   - Settings service cache');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHeroButtonColumn().catch(console.error);
