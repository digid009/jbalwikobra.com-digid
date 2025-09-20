require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testMarkAsReadFlow() {
  console.log('🔍 Testing Mark as Read Flow for Global Notifications...');
  
  try {
    // 1. Get a real user ID (if any users exist)
    console.log('\n1. Getting a test user...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .limit(1);
    
    if (userError) {
      console.log('❌ Could not fetch users:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const testUserId = users[0].id;
    console.log('✅ Test user ID:', testUserId.slice(0, 8) + '...');
    
    // 2. Get a real global notification
    console.log('\n2. Getting a test notification...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, title, user_id')
      .is('user_id', null)
      .limit(1);
    
    if (notifError) {
      console.log('❌ Could not fetch notifications:', notifError.message);
      return;
    }
    
    if (!notifications || notifications.length === 0) {
      console.log('❌ No global notifications found');
      return;
    }
    
    const testNotificationId = notifications[0].id;
    console.log('✅ Test notification:', testNotificationId.slice(0, 8) + '...', notifications[0].title.slice(0, 30) + '...');
    
    // 3. Check if this user has already read this notification
    console.log('\n3. Checking current read status...');
    const { data: existingRead, error: readError } = await supabase
      .from('notification_reads')
      .select('*')
      .eq('notification_id', testNotificationId)
      .eq('user_id', testUserId);
    
    if (readError) {
      console.log('❌ Could not check read status:', readError.message);
      return;
    }
    
    console.log('Current read status:', existingRead && existingRead.length > 0 ? 'ALREADY READ' : 'UNREAD');
    
    // 4. Test mark_notification_read RPC
    console.log('\n4. Testing mark_notification_read RPC...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('mark_notification_read', { 
      n_id: testNotificationId, 
      u_id: testUserId 
    });
    
    if (rpcError) {
      console.log('❌ RPC mark_notification_read failed:', rpcError.message);
      return;
    }
    
    console.log('✅ RPC mark_notification_read completed successfully');
    
    // 5. Check if read record was created
    console.log('\n5. Checking if read record was created...');
    const { data: newRead, error: newReadError } = await supabase
      .from('notification_reads')
      .select('*')
      .eq('notification_id', testNotificationId)
      .eq('user_id', testUserId);
    
    if (newReadError) {
      console.log('❌ Could not check new read status:', newReadError.message);
      return;
    }
    
    if (newRead && newRead.length > 0) {
      console.log('✅ Read record created successfully:', {
        notification_id: newRead[0].notification_id.slice(0, 8) + '...',
        user_id: newRead[0].user_id.slice(0, 8) + '...',
        read_at: newRead[0].read_at
      });
    } else {
      console.log('❌ Read record was NOT created');
    }
    
    // 6. Test the notification fetching logic (simulating the app)
    console.log('\n6. Testing notification fetching logic...');
    
    // Get user notifications and global notifications
    const [userRes, globalRes, readsRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('id,user_id,type,title,body,link_url,is_read,created_at')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('notifications')
        .select('id,user_id,type,title,body,link_url,is_read,created_at')
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', testUserId)
    ]);
    
    const readMap = new Set((readsRes.data || []).map(r => r.notification_id));
    const merged = [...(userRes.data || []), ...(globalRes.data || [])];
    
    // For global notifications, compute is_read for this user using notification_reads
    const list = merged
      .map(n => ({
        ...n,
        is_read: n.user_id ? n.is_read : readMap.has(n.id)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    
    console.log('✅ Notifications with computed read status:');
    list.forEach(n => {
      console.log(`  - ${n.id.slice(0, 8)}... "${n.title.slice(0, 30)}..." is_read: ${n.is_read} (${n.user_id ? 'user-specific' : 'global'})`);
    });
    
    // 7. Find our test notification in the list
    const ourNotification = list.find(n => n.id === testNotificationId);
    if (ourNotification) {
      console.log('\n✅ Our test notification read status:', ourNotification.is_read ? 'READ' : 'UNREAD');
      if (ourNotification.is_read) {
        console.log('🎉 SUCCESS: Mark as read is working correctly!');
      } else {
        console.log('❌ PROBLEM: Notification still shows as unread despite being marked as read');
      }
    } else {
      console.log('❌ Could not find our test notification in the fetched list');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testMarkAsReadFlow().catch(console.error);
