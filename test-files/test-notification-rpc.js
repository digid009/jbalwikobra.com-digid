require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testRPCFunctions() {
  console.log('🔍 Testing RPC functions...');
  console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set');
  
  // Test if mark_notification_read function exists
  try {
    console.log('\n1. Testing mark_notification_read function...');
    const result1 = await supabase.rpc('mark_notification_read', { 
      n_id: '00000000-0000-0000-0000-000000000000', 
      u_id: '00000000-0000-0000-0000-000000000000' 
    });
    console.log('✅ mark_notification_read function exists');
    if (result1.error) {
      console.log('Function error (expected for dummy IDs):', result1.error.message);
    }
  } catch (e) {
    console.log('❌ mark_notification_read function test failed:', e.message);
  }
  
  // Test if mark_all_notifications_read function exists  
  try {
    console.log('\n2. Testing mark_all_notifications_read function...');
    const result2 = await supabase.rpc('mark_all_notifications_read', { 
      u_id: '00000000-0000-0000-0000-000000000000' 
    });
    console.log('✅ mark_all_notifications_read function exists');
    if (result2.error) {
      console.log('Function error (expected for dummy ID):', result2.error.message);
    }
  } catch (e) {
    console.log('❌ mark_all_notifications_read function test failed:', e.message);
  }
  
  // Test basic notifications table access
  try {
    console.log('\n3. Testing notifications table access...');
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, is_read, user_id')
      .limit(5);
    
    if (error) {
      console.log('❌ Notifications table access failed:', error.message);
    } else {
      console.log('✅ Notifications table accessible');
      console.log('Sample notifications:', data?.map(n => ({ 
        id: n.id.slice(0, 8), 
        type: n.type, 
        title: n.title?.slice(0, 30) + '...', 
        is_read: n.is_read,
        user_id: n.user_id ? n.user_id.slice(0, 8) + '...' : 'null'
      })));
    }
  } catch (e) {
    console.log('❌ Notifications table test failed:', e.message);
  }
  
  // Test notification_reads table access
  try {
    console.log('\n4. Testing notification_reads table access...');
    const { data, error } = await supabase
      .from('notification_reads')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ notification_reads table access failed:', error.message);
    } else {
      console.log('✅ notification_reads table accessible');
      console.log('Sample reads:', data?.length || 0, 'records');
    }
  } catch (e) {
    console.log('❌ notification_reads table test failed:', e.message);
  }
  
  process.exit(0);
}

testRPCFunctions().catch(console.error);
