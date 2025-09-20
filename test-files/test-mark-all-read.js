require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMarkAllAsRead() {
  console.log('🔍 Testing Mark All as Read functionality...\n');

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

    // 2. Get count of unread notifications before
    const { data: beforeNotifications, error: beforeError } = await supabase
      .from('notifications')
      .select(`
        id,
        title,
        user_id,
        notification_reads!left (
          user_id,
          read_at
        )
      `)
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (beforeError) {
      console.log('❌ Error fetching notifications before:', beforeError);
      return;
    }

    const unreadBefore = beforeNotifications.filter(n => 
      !n.notification_reads.some(r => r.user_id === userId)
    ).length;
    
    console.log(`📊 Unread notifications before: ${unreadBefore}`);

    // 3. Test mark_all_notifications_read RPC
    console.log('\n4. Testing mark_all_notifications_read RPC...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('mark_all_notifications_read', { user_id: userId });

    if (rpcError) {
      console.log('❌ RPC mark_all_notifications_read failed:', rpcError.message);
      return;
    }

    console.log('✅ RPC mark_all_notifications_read completed successfully');
    console.log('📊 Notifications marked as read:', rpcData);

    // 4. Verify the results
    console.log('\n5. Checking read records created...');
    const { data: readRecords, error: readError } = await supabase
      .from('notification_reads')
      .select('*')
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(10);

    if (readError) {
      console.log('❌ Error fetching read records:', readError);
      return;
    }

    console.log(`✅ Total read records for user: ${readRecords.length}`);
    if (readRecords.length > 0) {
      console.log('📋 Recent read records:');
      readRecords.slice(0, 3).forEach(record => {
        console.log(`  - ${record.notification_id.substring(0, 8)}... read at ${record.read_at}`);
      });
    }

    // 5. Check unread count after
    const { data: afterNotifications, error: afterError } = await supabase
      .from('notifications')
      .select(`
        id,
        title,
        user_id,
        notification_reads!left (
          user_id,
          read_at
        )
      `)
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!afterError) {
      const unreadAfter = afterNotifications.filter(n => 
        !n.notification_reads.some(r => r.user_id === userId)
      ).length;
      
      console.log(`📊 Unread notifications after: ${unreadAfter}`);
      
      if (unreadAfter < unreadBefore) {
        console.log('✅ Mark all as read is working - unread count decreased!');
      } else {
        console.log('⚠️  Unread count didn\'t change - but RPC succeeded');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMarkAllAsRead();
