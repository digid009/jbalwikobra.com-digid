require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkConstraints() {
  console.log('🔍 Checking Current Database Constraints...');
  
  try {
    // Check what foreign key constraints currently exist on notification_reads
    console.log('\n1. Checking foreign key constraints on notification_reads...');
    
    // Use a simple query that should work with ANON key
    const { data, error } = await supabase
      .rpc('check_notification_reads_constraints');
    
    if (error) {
      console.log('Custom RPC not available, trying direct table access...');
      
      // Try to insert a test record to see what specific error we get
      console.log('\n2. Testing with a dummy insert to see current constraint...');
      const { error: insertError } = await supabase
        .from('notification_reads')
        .insert({
          notification_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000'
        });
      
      if (insertError) {
        console.log('Insert error (expected):', insertError.message);
        
        if (insertError.message.includes('notification_reads_user_id_fkey')) {
          console.log('❌ Foreign key constraint still exists!');
          console.log('The constraint "notification_reads_user_id_fkey" is still active.');
          
          // Check what it references
          if (insertError.message.includes('auth.users')) {
            console.log('It appears to reference auth.users table.');
          } else if (insertError.message.includes('users')) {
            console.log('It appears to reference users table.');
          }
          
          console.log('\n🔧 Try running this SQL again in Supabase SQL Editor:');
          console.log('ALTER TABLE public.notification_reads DROP CONSTRAINT notification_reads_user_id_fkey;');
          
        } else if (insertError.message.includes('does not exist')) {
          console.log('✅ Foreign key constraint was removed - this is a different error');
          console.log('The error is probably due to the notification_id not existing');
        } else {
          console.log('Different error - foreign key might be fixed');
        }
      } else {
        console.log('✅ No error - foreign key constraint might be fixed');
      }
    }
    
    // Let's also test with a real user and notification
    console.log('\n3. Testing with real user and notification...');
    
    // Get a real user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    // Get a real notification  
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .is('user_id', null)
      .limit(1);
    
    if (userError || notifError || !users?.length || !notifications?.length) {
      console.log('Cannot get real user/notification data for testing');
      return;
    }
    
    const realUserId = users[0].id;
    const realNotificationId = notifications[0].id;
    
    console.log('Testing with real IDs...');
    console.log('User ID:', realUserId.slice(0, 8) + '...');
    console.log('Notification ID:', realNotificationId.slice(0, 8) + '...');
    
    const { error: realTestError } = await supabase
      .from('notification_reads')
      .insert({
        notification_id: realNotificationId,
        user_id: realUserId
      });
    
    if (realTestError) {
      console.log('❌ Real test failed:', realTestError.message);
      if (realTestError.message.includes('duplicate key')) {
        console.log('✅ Actually this means the constraint is fixed (duplicate key is OK)');
      }
    } else {
      console.log('✅ Real test succeeded - constraint is fixed!');
      
      // Clean up the test record
      await supabase
        .from('notification_reads')
        .delete()
        .eq('notification_id', realNotificationId)
        .eq('user_id', realUserId);
      console.log('Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Constraint check failed:', error);
  }
  
  process.exit(0);
}

checkConstraints().catch(console.error);
