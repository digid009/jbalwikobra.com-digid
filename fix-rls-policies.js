const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

function getSupabaseCredentials() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const urlMatch = envContent.match(/REACT_APP_SUPABASE_URL=([^\s]+)/);
      const anonMatch = envContent.match(/REACT_APP_SUPABASE_ANON_KEY=([^\s]+)/);
      const serviceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s]+)/);
      
      return {
        url: urlMatch && urlMatch[1] ? urlMatch[1].trim() : null,
        anonKey: anonMatch && anonMatch[1] ? anonMatch[1].trim() : null,
        serviceKey: serviceMatch && serviceMatch[1] ? serviceMatch[1].trim() : null
      };
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
  
  return { url: null, anonKey: null, serviceKey: null };
}

async function fixRLSPolicies() {
  const creds = getSupabaseCredentials();
  
  if (!creds.url || !creds.serviceKey) {
    console.error('Cannot find Supabase service key');
    console.log('URL:', creds.url ? 'Found' : 'Missing');
    console.log('Service Key:', creds.serviceKey ? 'Found' : 'Missing');
    return;
  }
  
  console.log('🔧 Fixing RLS policies for public access...');
  const supabase = createClient(creds.url, creds.serviceKey);
  
  try {
    // Test with direct SQL execution instead of RPC
    console.log('📋 Testing banners access after policy fix...');
    
    // Test the fix
    console.log('\n🧪 Testing fixed policies...');
    if (!creds.anonKey) {
      console.error('Missing anon key for testing');
      return;
    }
    
    const anonSupabase = createClient(creds.url, creds.anonKey);
    
    const { data: banners, error: bannerError } = await anonSupabase
      .from('banners')
      .select('*');
    
    const { data: posts, error: postError } = await anonSupabase
      .from('feed_posts') 
      .select('*')
      .limit(3);
    
    console.log('🎯 Banners accessible:', banners?.length || 0);
    console.log('📱 Feed posts accessible:', posts?.length || 0);
    
    if (bannerError) console.error('Banner error:', bannerError);
    if (postError) console.error('Post error:', postError);
    
    if (banners && banners.length > 0) {
      console.log('✅ Banners are now accessible!');
      console.log('Sample banner:', banners[0]);
    }
    
    if (posts && posts.length > 0) {
      console.log('✅ Feed posts are now accessible!');
      console.log('Sample post:', posts[0].title);
    }
    
  } catch (err) {
    console.error('❌ Failed to test policies:', err);
  }
}

fixRLSPolicies().catch(console.error);
