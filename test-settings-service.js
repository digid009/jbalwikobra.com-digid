// Test SettingsService functionality with environment variables
// Run: node test-settings-service.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get environment variables the same way React does
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Testing SettingsService Implementation');
console.log('🔧 Environment Variables:');
console.log('  - URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 40) + '...' : 'Missing');
console.log('  - Key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'Missing');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulate SettingsService.get() method
async function testSettingsServiceGet() {
  console.log('\n1️⃣ Testing SettingsService.get() simulation...');
  
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.log('❌ Database Error:', error.message);
      return null;
    }
    
    if (!data) {
      console.log('⚠️ No settings found in database');
      return null;
    }
    
    // Simulate the mapping that happens in SettingsService
    const result = {
      id: data.id ?? 'default',
      siteName: data.site_name ?? 'JB Alwikobra',
      logoUrl: data.logo_url ?? undefined,
      faviconUrl: data.favicon_url ?? undefined,
      contactEmail: data.contact_email ?? undefined,
      supportEmail: data.support_email ?? undefined,
      contactPhone: data.contact_phone ?? undefined,
      whatsappNumber: data.whatsapp_number ?? undefined,
      address: data.address ?? undefined,
      businessHours: data.business_hours ?? undefined,
      companyDescription: data.company_description ?? undefined,
      facebookUrl: data.facebook_url ?? undefined,
      instagramUrl: data.instagram_url ?? undefined,
      tiktokUrl: data.tiktok_url ?? undefined,
      youtubeUrl: data.youtube_url ?? undefined,
      twitterUrl: data.twitter_url ?? undefined,
      heroTitle: data.hero_title ?? undefined,
      heroSubtitle: data.hero_subtitle ?? undefined,
      footerCopyrightText: data.footer_copyright_text ?? undefined,
      newsletterEnabled: data.newsletter_enabled ?? true,
      socialMediaEnabled: data.social_media_enabled ?? true,
      topupGameUrl: data.topup_game_url ?? undefined,
      whatsappChannelUrl: data.whatsapp_channel_url ?? undefined,
      updatedAt: data.updated_at ?? undefined,
    };
    
    console.log('✅ Settings fetched successfully!');
    console.log('📊 Mapped Data:');
    console.log('  - Site Name:', result.siteName);
    console.log('  - Contact Email:', result.contactEmail || 'Not set');
    console.log('  - WhatsApp Number:', result.whatsappNumber || 'Not set');
    console.log('  - Business Hours:', result.businessHours || 'Not set');
    console.log('  - Company Description:', result.companyDescription ? 'Set' : 'Not set');
    console.log('  - Newsletter Enabled:', result.newsletterEnabled);
    console.log('  - WhatsApp Channel URL:', result.whatsappChannelUrl || 'Not set');
    console.log('  - Top-up Game URL:', result.topupGameUrl || 'Not set');
    
    return result;
    
  } catch (e) {
    console.log('❌ Unexpected Error:', e.message);
    return null;
  }
}

// Run the test
testSettingsServiceGet()
  .then(result => {
    if (result) {
      console.log('\n✅ TEST PASSED: SettingsService simulation successful');
      console.log('🎯 The React app should be able to fetch this data');
    } else {
      console.log('\n❌ TEST FAILED: Could not fetch settings');
    }
  })
  .catch(err => {
    console.log('\n❌ TEST ERROR:', err.message);
  });
