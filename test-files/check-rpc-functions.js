require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAvailableRPCs() {
  console.log('🔍 Checking available RPC functions...\n');

  try {
    // Test mark_notification_read (we know this one works)
    console.log('1. Testing mark_notification_read...');
    const { error: singleError } = await supabase
      .rpc('mark_notification_read', { 
        notification_id: 'test-id', 
        user_id: 'test-user' 
      });
    
    if (singleError) {
      if (singleError.message.includes('violates')) {
        console.log('✅ mark_notification_read function exists (constraint error expected)');
      } else if (singleError.message.includes('schema cache')) {
        console.log('❌ mark_notification_read function not found');
      } else {
        console.log('✅ mark_notification_read function exists:', singleError.message);
      }
    } else {
      console.log('✅ mark_notification_read function exists and worked');
    }

    // Test mark_all_notifications_read
    console.log('\n2. Testing mark_all_notifications_read...');
    const { error: allError } = await supabase
      .rpc('mark_all_notifications_read', { 
        user_id: 'test-user' 
      });
    
    if (allError) {
      if (allError.message.includes('schema cache')) {
        console.log('❌ mark_all_notifications_read function not found - needs to be created');
      } else {
        console.log('✅ mark_all_notifications_read function exists:', allError.message);
      }
    } else {
      console.log('✅ mark_all_notifications_read function exists and worked');
    }

    // Test with different parameter names
    console.log('\n3. Testing alternative function names...');
    const alternativeNames = [
      'mark_all_read',
      'mark_notifications_read_all',
      'mark_user_notifications_read'
    ];

    for (const funcName of alternativeNames) {
      const { error } = await supabase.rpc(funcName, { user_id: 'test' });
      if (error && !error.message.includes('schema cache')) {
        console.log(`✅ ${funcName} exists:`, error.message);
      } else if (!error) {
        console.log(`✅ ${funcName} exists and worked`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkAvailableRPCs();
