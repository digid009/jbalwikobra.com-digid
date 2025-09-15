// Test WhatsApp API key configuration in database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testWhatsAppConfig() {
  console.log('Testing WhatsApp API configuration...');
  
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
    return;
  }
  
  console.log('✅ Supabase configuration found');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Check if whatsapp_api_keys table exists and has data
    console.log('🔍 Checking whatsapp_api_keys table...');
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('whatsapp_api_keys')
      .select('*')
      .eq('is_active', true);
    
    if (apiKeysError) {
      console.error('❌ Error accessing whatsapp_api_key table:', apiKeysError);
      return;
    }
    
    console.log('📋 Active WhatsApp API keys found:', apiKeys?.length || 0);
    if (apiKeys && apiKeys.length > 0) {
      apiKeys.forEach((key, index) => {
        console.log(`\n🔑 API Key ${index + 1}:`);
        console.log('  - Key ID:', key.key_id);
        console.log('  - Provider:', key.provider_name);
        console.log('  - API Key:', key.api_key ? `${key.api_key.substring(0, 8)}...` : 'NOT SET');
        console.log('  - Is Active:', key.is_active);
        console.log('  - Created:', key.created_at);
      });
    } else {
      console.log('⚠️  No active WhatsApp API keys found in database');
    }
    
    // Check if RPC function exists
    console.log('\n🔍 Testing get_active_api_key RPC function...');
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_active_api_key', {
        provider_name: 'woo-wa'
      });
      
      if (rpcError) {
        console.error('❌ RPC function error:', rpcError);
        console.log('💡 You may need to create the get_active_api_key function in the database');
      } else {
        console.log('✅ RPC function works! Data:', rpcData);
      }
    } catch (rpcError) {
      console.error('❌ RPC function not found:', rpcError.message);
      console.log('💡 Creating the get_active_api_key function may be needed');
    }
    
    console.log('\n✅ WhatsApp configuration test completed');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testWhatsAppConfig().catch(console.error);
