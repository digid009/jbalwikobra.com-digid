require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMarkAllAsReadSimple() {
  console.log('🔍 Testing Mark All as Read functionality (simple test)...\n');

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

    // 2. Count current read records
    const { data: beforeRecords, error: beforeError } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId);

    if (beforeError) {
      console.log('❌ Error counting before records:', beforeError);
      return;
    }

    console.log(`📊 Read records before: ${beforeRecords.length}`);

    // 3. Test mark_all_notifications_read RPC
    console.log('\n3. Testing mark_all_notifications_read RPC...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('mark_all_notifications_read', { user_id: userId });

    if (rpcError) {
      console.log('❌ RPC mark_all_notifications_read failed:', rpcError.message);
      return;
    }

    console.log('✅ RPC mark_all_notifications_read completed successfully');
    console.log('📊 Notifications marked as read:', rpcData);

    // 4. Count read records after
    const { data: afterRecords, error: afterError } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', userId);

    if (afterError) {
      console.log('❌ Error counting after records:', afterError);
      return;
    }

    console.log(`📊 Read records after: ${afterRecords.length}`);

    if (afterRecords.length > beforeRecords.length) {
      console.log(`✅ Success! Added ${afterRecords.length - beforeRecords.length} new read records`);
    } else if (afterRecords.length === beforeRecords.length) {
      console.log('✅ RPC completed (all notifications may have already been read)');
    }

    // 5. Show latest read records
    const { data: latestRecords, error: latestError } = await supabase
      .from('notification_reads')
      .select('notification_id, read_at')
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(5);

    if (!latestError && latestRecords.length > 0) {
      console.log('\n📋 Latest read records:');
      latestRecords.forEach(record => {
        console.log(`  - ${record.notification_id.substring(0, 8)}... at ${record.read_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMarkAllAsReadSimple();
