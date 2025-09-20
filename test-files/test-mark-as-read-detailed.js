// Test mark as read dengan detail debugging
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testMarkAsReadDetailed() {
  console.log('🚀 Starting detailed mark as read test...\n');

  // Configuration
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  console.log('📋 Environment check:');
  console.log(`- SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`- ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`- SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    return;
  }

  // Create clients
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
    : null;

  console.log('🔧 Client setup:');
  console.log(`- Anon client: ${anonClient ? '✅' : '❌'}`);
  console.log(`- Service client: ${serviceClient ? '✅' : '❌'}\n`);

  try {
    // 1. Get a notification to test with
    console.log('1️⃣ Fetching notifications...');
    const { data: notifications, error: fetchError } = await anonClient
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching notifications:', fetchError);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.error('❌ No notifications found for testing');
      return;
    }

    const notification = notifications[0];
    console.log(`✅ Found notification: ${notification.id}`);
    console.log(`📋 Current is_read status: ${notification.is_read}`);
    console.log(`📋 Title: ${notification.title}\n`);

    // 2. Test with anon client first
    console.log('2️⃣ Testing update with ANON client...');
    const { data: anonUpdateData, error: anonUpdateError } = await anonClient
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', notification.id)
      .select();

    if (anonUpdateError) {
      console.error('❌ Anon client update failed:', anonUpdateError);
      console.log('📝 This might be due to RLS policy restrictions\n');
    } else {
      console.log('✅ Anon client update succeeded:', anonUpdateData);
    }

    // 3. Verify current status
    console.log('3️⃣ Verifying current status...');
    const { data: currentData, error: currentError } = await anonClient
      .from('admin_notifications')
      .select('id, is_read, updated_at')
      .eq('id', notification.id)
      .single();

    if (currentError) {
      console.error('❌ Error checking current status:', currentError);
    } else {
      console.log(`📋 Current status after anon update: is_read = ${currentData.is_read}`);
    }

    // 4. Test with service client if available
    if (serviceClient) {
      console.log('\n4️⃣ Testing update with SERVICE client...');
      const { data: serviceUpdateData, error: serviceUpdateError } = await serviceClient
        .from('admin_notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notification.id)
        .select();

      if (serviceUpdateError) {
        console.error('❌ Service client update failed:', serviceUpdateError);
      } else {
        console.log('✅ Service client update succeeded:', serviceUpdateData);
      }

      // 5. Final verification
      console.log('5️⃣ Final verification...');
      const { data: finalData, error: finalError } = await serviceClient
        .from('admin_notifications')
        .select('id, is_read, updated_at')
        .eq('id', notification.id)
        .single();

      if (finalError) {
        console.error('❌ Error in final check:', finalError);
      } else {
        console.log(`📋 Final status: is_read = ${finalData.is_read}`);
        if (finalData.is_read === true) {
          console.log('🎉 SUCCESS: Database is_read is now TRUE!');
        } else {
          console.log('💥 PROBLEM: Database is_read is still FALSE!');
        }
      }
    } else {
      console.log('\n4️⃣ Service client not available - skipping service key test');
    }

    // 6. Check RLS policies
    console.log('\n6️⃣ Checking table policies...');
    const { data: policies, error: policyError } = await serviceClient || anonClient
      .rpc('get_policies_for_table', { table_name: 'admin_notifications' })
      .catch(() => {
        // If RPC doesn't exist, try direct query
        return serviceClient || anonClient
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'admin_notifications');
      });

    if (policyError) {
      console.log('⚠️ Could not fetch policies (this is normal)');
    } else if (policies && policies.length > 0) {
      console.log('📋 Found RLS policies:', policies);
    } else {
      console.log('📋 No specific RLS policies found for admin_notifications');
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testMarkAsReadDetailed().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('\n💥 Test failed:', error);
});
