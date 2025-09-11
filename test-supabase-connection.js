const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required Supabase environment variables');
    console.log('Please update .env file with your actual Supabase credentials');
    return;
  }
  
  console.log('\n🔗 Connection Details:');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    // Test with anon key (frontend connection)
    console.log('\n📱 Testing Frontend Connection (Anon Key)...');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { data, error } = await supabaseClient
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Frontend connection error:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Frontend connection successful');
      console.log('Sample data:', data);
    }
    
    // Test with service role key (backend connection)
    if (supabaseServiceKey) {
      console.log('\n🔧 Testing Backend Connection (Service Role)...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('products')
        .select('count')
        .limit(1);
      
      if (adminError) {
        console.log('❌ Backend connection error:', adminError.message);
      } else {
        console.log('✅ Backend connection successful');
        console.log('Admin access confirmed');
      }
    }
    
    // Test database tables
    console.log('\n📊 Testing Database Tables...');
    const tables = ['products', 'users', 'orders', 'categories'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          if (error.message.includes('not found') || error.message.includes('does not exist')) {
            console.log(`⚠️  Table '${table}': Does not exist`);
          } else {
            console.log(`❌ Table '${table}': ${error.message}`);
          }
        } else {
          console.log(`✅ Table '${table}': Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
  } catch (error) {
    console.log('\n❌ Connection test failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n🎯 Connection Test Complete');
}

// Run the test
testSupabaseConnection().catch(console.error);
