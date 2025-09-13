// Reset notification to unread untuk testing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function resetNotificationForTesting() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const notificationId = '897fa6b0-da5c-4679-9c01-95ebe1b76989';

  console.log('🔄 Resetting notification to unread for testing...');

  try {
    const { data, error } = await serviceClient
      .from('admin_notifications')
      .update({ 
        is_read: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Reset successful:', data[0]);
      console.log(`📋 is_read is now: ${data[0].is_read}`);
    }
  } catch (error) {
    console.error('💥 Failed:', error);
  }
}

resetNotificationForTesting();
