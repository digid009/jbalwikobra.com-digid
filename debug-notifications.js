// Debug script to test notification creation
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set ✓' : 'Missing ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Set ✓' : 'Missing ❌');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testNotificationCreation() {
  try {
    console.log('\n=== Testing Notification Creation ===');
    
    const testNotification = {
      type: 'new_order',
      title: 'Test Order Notification',
      message: 'This is a test notification for debugging',
      order_id: 'debug-test-' + Date.now(),
      customer_name: 'Debug Customer',
      product_name: 'Debug Product',
      amount: 50000,
      is_read: false,
      metadata: {
        priority: 'normal',
        category: 'order',
        debug: true
      },
      created_at: new Date().toISOString()
    };

    console.log('Test notification payload:', testNotification);

    // Test 1: Direct insert
    console.log('\n--- Test 1: Direct Insert ---');
    const { data, error } = await sb
      .from('admin_notifications')
      .insert(testNotification)
      .select('*')
      .single();

    if (error) {
      console.error('Insert error:', error);
      console.log('Error details:');
      console.log('- Code:', error.code);
      console.log('- Message:', error.message);
      console.log('- Details:', error.details);
      console.log('- Hint:', error.hint);
    } else {
      console.log('Insert successful! Notification created:', data);
      
      // Test 2: Verify it exists
      console.log('\n--- Test 2: Verify Exists ---');
      const { data: existsData, error: existsError } = await sb
        .from('admin_notifications')
        .select('*')
        .eq('id', data.id);
        
      if (existsError) {
        console.error('Query error:', existsError);
      } else {
        console.log('Query successful! Found notification:', existsData);
      }
      
      // Clean up
      console.log('\n--- Cleanup ---');
      const { error: deleteError } = await sb
        .from('admin_notifications')
        .delete()
        .eq('id', data.id);
        
      if (deleteError) {
        console.error('Cleanup error:', deleteError);
      } else {
        console.log('Cleanup successful!');
      }
    }

    // Test 3: Check RLS policies
    console.log('\n--- Test 3: Check RLS Policies ---');
    const { data: policies, error: policyError } = await sb
      .from('admin_notifications')
      .select('*')
      .limit(1);
      
    if (policyError) {
      console.error('Policy check error:', policyError);
    } else {
      console.log('Policy check successful - can read table');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testNotificationCreation();
