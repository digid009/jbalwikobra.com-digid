// Test script to debug admin notification system
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables:');
  console.error('SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

console.log('🚀 Testing admin notification system...');
console.log('URL:', SUPABASE_URL.substring(0, 30) + '...');
console.log('Service Key:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testNotificationSystem() {
  try {
    console.log('\n📋 1. Checking admin_notifications table structure...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('admin_notifications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    
    console.log('✅ Table exists and accessible');
    
    console.log('\n🆕 2. Testing notification creation...');
    const testNotification = {
      type: 'new_order',
      title: 'Test Order - Debug Mode',
      message: 'This is a test notification for debugging purposes',
      order_id: 'test-order-' + Date.now(),
      customer_name: 'Test Customer',
      product_name: 'Test Product',
      amount: 50000,
      is_read: false,
      metadata: {
        priority: 'normal',
        category: 'order',
        test: true
      },
      created_at: new Date().toISOString()
    };
    
    const { data: created, error: createError } = await supabaseAdmin
      .from('admin_notifications')
      .insert(testNotification)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Creation error:', createError);
      return;
    }
    
    console.log('✅ Notification created successfully:', created.id);
    
    console.log('\n📖 3. Testing mark as read...');
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', created.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }
    
    console.log('✅ Notification marked as read:', updated.is_read);
    
    console.log('\n🗑️ 4. Cleaning up test notification...');
    const { error: deleteError } = await supabaseAdmin
      .from('admin_notifications')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
    } else {
      console.log('✅ Test notification cleaned up');
    }
    
    console.log('\n🎉 All tests passed! Admin notification system is working correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testNotificationSystem().then(() => {
  console.log('\n✨ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
