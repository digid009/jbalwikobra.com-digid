require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testWithAuthUser() {
  console.log('🔍 Testing Mark as Read with Auth User...');
  
  try {
    // 1. Create a test auth user first 
    console.log('\n1. Creating a test auth user...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test-' + Date.now() + '@test.com',
      password: 'testpassword123'
    });
    
    if (authError) {
      console.log('❌ Could not create auth user:', authError.message);
      // Try to get an existing auth user instead
      console.log('\n1b. Trying to get session from auth...');
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        console.log('✅ Found existing auth user:', session.session.user.id.slice(0, 8) + '...');
        const testUserId = session.session.user.id;
        await testMarkAsRead(testUserId);
      } else {
        console.log('❌ No authenticated user available');
        // Let's try with a direct approach - remove the foreign key constraint
        await tryRemoveForeignKey();
      }
      return;
    }
    
    if (authData?.user) {
      console.log('✅ Created auth user:', authData.user.id.slice(0, 8) + '...');
      await testMarkAsRead(authData.user.id);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    // Try the direct approach
    await tryRemoveForeignKey();
  }
}

async function testMarkAsRead(userId) {
  console.log('\n2. Testing mark as read with auth user ID:', userId.slice(0, 8) + '...');
  
  // Get a notification
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('id, title')
    .is('user_id', null)
    .limit(1);
  
  if (notifError || !notifications || notifications.length === 0) {
    console.log('❌ Could not get test notification');
    return;
  }
  
  const notificationId = notifications[0].id;
  console.log('Testing with notification:', notificationId.slice(0, 8) + '...', notifications[0].title.slice(0, 30) + '...');
  
  // Try to mark as read
  const { error: rpcError } = await supabase.rpc('mark_notification_read', { 
    n_id: notificationId, 
    u_id: userId 
  });
  
  if (rpcError) {
    console.log('❌ RPC still failed:', rpcError.message);
    console.log('The foreign key constraint is the issue - needs to be fixed in database');
  } else {
    console.log('✅ RPC succeeded with auth user!');
  }
}

async function tryRemoveForeignKey() {
  console.log('\n🔧 The issue is a foreign key constraint.');
  console.log('The notification_reads.user_id has a foreign key that references auth.users,');
  console.log('but our app uses custom user IDs from the users table.');
  console.log('\nTo fix this, we need to remove the foreign key constraint.');
  console.log('\nPlease run this SQL in your Supabase SQL editor:');
  console.log('');
  console.log('-- Remove the problematic foreign key constraint');
  console.log('ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;');
  console.log('');
  console.log('-- Optionally, add a new foreign key that references our users table');
  console.log('-- ALTER TABLE public.notification_reads');
  console.log('-- ADD CONSTRAINT notification_reads_user_id_fkey'); 
  console.log('-- FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;');
  console.log('');
  console.log('After running this SQL, the mark as read functionality should work.');
}

testWithAuthUser().then(() => process.exit(0)).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
