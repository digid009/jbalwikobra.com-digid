require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPCWithCorrectParams() {
  console.log('🔍 Testing RPC functions with correct parameter names...\n');

  try {
    // 1. Get a test user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('❌ No test user found');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Test user ID: ${userId.substring(0, 8)}...`);

    // 2. Test mark_notification_read with correct parameter names (n_id, u_id)
    console.log('\n2. Testing mark_notification_read with n_id, u_id...');
    const { error: singleError } = await supabase
      .rpc('mark_notification_read', { 
        n_id: '00000000-0000-0000-0000-000000000000', 
        u_id: userId 
      });
    
    if (singleError) {
      if (singleError.message.includes('violates') || singleError.message.includes('exist')) {
        console.log('✅ mark_notification_read function exists (expected error for fake UUID)');
      } else {
        console.log('❌ mark_notification_read error:', singleError.message);
      }
    } else {
      console.log('✅ mark_notification_read function exists and worked');
    }

    // 3. Test mark_all_notifications_read with correct parameter name (u_id)
    console.log('\n3. Testing mark_all_notifications_read with u_id...');
    const { data: allData, error: allError } = await supabase
      .rpc('mark_all_notifications_read', { 
        u_id: userId 
      });
    
    if (allError) {
      console.log('❌ mark_all_notifications_read error:', allError.message);
    } else {
      console.log('✅ mark_all_notifications_read function exists and worked');
      console.log('📊 Result:', allData);
    }

    // 4. Count read records after mark all
    const { data: readRecords, error: readError } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId);

    if (!readError) {
      console.log(`📊 Total read records for user: ${readRecords.length}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRPCWithCorrectParams();
