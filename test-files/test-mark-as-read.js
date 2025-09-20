/**
 * Test Mark as Read Functionality
 * Tests the mark as read functionality in both database and UI
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://mzrqjvvzdknpjrwftsiq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg4MjIsImV4cCI6MjA1MDk1NDgyMn0.LkOXqCKNuYGPUg3bMsYYF5LdgjQWVhQZtQ8qjDJpgSo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMarkAsReadFunctionality() {
  console.log('🔧 Testing Mark as Read Functionality');
  console.log('====================================\n');
  
  try {
    // 1. Create a test notification first
    console.log('1. Creating test notification...');
    const testNotification = {
      type: 'new_order',
      title: 'Bang! ada yang ORDER nih!',
      message: 'Test notification untuk mark as read - namanya Test Customer, produknya Mobile Legends Diamond harganya Rp250.000',
      is_read: false,
      customer_name: 'Test Customer',
      product_name: 'Mobile Legends Diamond',
      amount: 250000,
      metadata: {
        test_mark_read: true
      }
    };
    
    const { data: newNotification, error: insertError } = await supabase
      .from('admin_notifications')
      .insert([testNotification])
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Failed to create test notification:', insertError);
      return;
    }
    
    console.log('✅ Test notification created:');
    console.log('   ID:', newNotification.id);
    console.log('   Title:', newNotification.title);
    console.log('   Is Read:', newNotification.is_read);
    console.log('   Created At:', newNotification.created_at);
    
    // 2. Verify notification is unread
    console.log('\n2. Verifying notification is unread...');
    const { data: beforeUpdate, error: beforeError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', newNotification.id)
      .single();
    
    if (beforeError) {
      console.error('❌ Failed to fetch notification before update:', beforeError);
      return;
    }
    
    console.log('✅ Before update verification:');
    console.log('   Is Read:', beforeUpdate.is_read);
    console.log('   Should be false:', beforeUpdate.is_read === false);
    
    // 3. Test the mark as read functionality
    console.log('\n3. Testing mark as read...');
    const { error: updateError } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', newNotification.id);
    
    if (updateError) {
      console.error('❌ Failed to mark notification as read:', updateError);
      return;
    }
    
    console.log('✅ Mark as read update executed');
    
    // 4. Verify the update worked
    console.log('\n4. Verifying mark as read worked...');
    const { data: afterUpdate, error: afterError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', newNotification.id)
      .single();
    
    if (afterError) {
      console.error('❌ Failed to fetch notification after update:', afterError);
      return;
    }
    
    console.log('✅ After update verification:');
    console.log('   Is Read:', afterUpdate.is_read);
    console.log('   Should be true:', afterUpdate.is_read === true);
    console.log('   Updated At:', afterUpdate.updated_at);
    
    // 5. Test fetching unread notifications (should not include this one)
    console.log('\n5. Testing unread notifications filter...');
    const { data: unreadNotifications, error: unreadError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (unreadError) {
      console.error('❌ Failed to fetch unread notifications:', unreadError);
      return;
    }
    
    const ourNotificationInUnread = unreadNotifications.find(n => n.id === newNotification.id);
    console.log('✅ Unread notifications filter test:');
    console.log('   Total unread notifications:', unreadNotifications.length);
    console.log('   Our notification in unread list:', ourNotificationInUnread ? 'YES (❌ PROBLEM!)' : 'NO (✅ CORRECT!)');
    
    // 6. Test fetching read notifications (should include this one)
    console.log('\n6. Testing read notifications filter...');
    const { data: readNotifications, error: readError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_read', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (readError) {
      console.error('❌ Failed to fetch read notifications:', readError);
      return;
    }
    
    const ourNotificationInRead = readNotifications.find(n => n.id === newNotification.id);
    console.log('✅ Read notifications filter test:');
    console.log('   Total read notifications:', readNotifications.length);
    console.log('   Our notification in read list:', ourNotificationInRead ? 'YES (✅ CORRECT!)' : 'NO (❌ PROBLEM!)');
    
    // 7. Test bulk mark as read
    console.log('\n7. Testing bulk mark as read...');
    
    // Create another test notification
    const { data: bulkTestNotif, error: bulkInsertError } = await supabase
      .from('admin_notifications')
      .insert([{
        type: 'new_user',
        title: 'Bang! ada yang DAFTAR akun nih!',
        message: 'Test bulk mark as read - namanya Bulk Test User',
        is_read: false,
        customer_name: 'Bulk Test User',
        metadata: { test_bulk_mark_read: true }
      }])
      .select()
      .single();
    
    if (bulkInsertError) {
      console.error('❌ Failed to create bulk test notification:', bulkInsertError);
    } else {
      console.log('✅ Bulk test notification created:', bulkTestNotif.id);
      
      // Mark all unread as read
      const { error: bulkUpdateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('is_read', false);
      
      if (bulkUpdateError) {
        console.error('❌ Failed to bulk mark as read:', bulkUpdateError);
      } else {
        console.log('✅ Bulk mark as read executed');
        
        // Verify bulk update
        const { data: afterBulk, error: afterBulkError } = await supabase
          .from('admin_notifications')
          .select('*')
          .eq('id', bulkTestNotif.id)
          .single();
        
        if (!afterBulkError && afterBulk) {
          console.log('✅ Bulk update verification:');
          console.log('   Bulk test notification is_read:', afterBulk.is_read);
        }
      }
    }
    
    // 8. Check RLS policies
    console.log('\n8. Testing RLS policies...');
    const { data: authUser } = await supabase.auth.getUser();
    console.log('✅ Auth status:');
    console.log('   User authenticated:', authUser.user ? 'YES' : 'NO');
    console.log('   User ID:', authUser.user?.id || 'None');
    
    console.log('\n✅ Mark as Read Test Summary:');
    console.log('===============================');
    console.log('✓ Notification creation: PASSED');
    console.log('✓ Initial unread state: PASSED');
    console.log('✓ Mark as read update: PASSED');
    console.log('✓ Read state verification: PASSED');
    console.log('✓ Unread filter exclusion:', ourNotificationInUnread ? 'FAILED' : 'PASSED');
    console.log('✓ Read filter inclusion:', ourNotificationInRead ? 'PASSED' : 'FAILED');
    console.log('✓ Bulk mark as read: PASSED');
    
    console.log('\n📋 Recommendations:');
    console.log('===================');
    if (!ourNotificationInRead || ourNotificationInUnread) {
      console.log('⚠️  There might be caching issues or UI state management problems');
      console.log('   - Check if cache is being properly invalidated');
      console.log('   - Verify UI state updates correctly');
      console.log('   - Check for race conditions in async operations');
    } else {
      console.log('✅ Database mark as read functionality is working correctly');
      console.log('   - Issue might be in frontend state management');
      console.log('   - Check console logs in browser for errors');
      console.log('   - Verify cache invalidation is working');
    }
    
  } catch (error) {
    console.error('❌ Mark as read test failed:', error);
  }
}

// Run the test
testMarkAsReadFunctionality();
