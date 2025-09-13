// Final test: Simulasi mark as read via adminNotificationService
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Simulasi adminNotificationService.markAsRead()
async function testServiceMarkAsRead() {
  console.log('🚀 Testing adminNotificationService.markAsRead() simulation...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const notificationId = '897fa6b0-da5c-4679-9c01-95ebe1b76989';

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  // Create supabaseAdmin (sama seperti di service)
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('📋 Service configuration:');
  console.log(`- supabaseAdmin available: ${!!supabaseAdmin}`);
  console.log(`- Target notification: ${notificationId}\n`);

  try {
    console.log(`🔄 Marking notification ${notificationId} as read...`);
    
    // CRITICAL: Admin operations MUST use service key to bypass RLS
    if (!supabaseAdmin) {
      console.error('❌ Service key client not available - admin operations require service key');
      throw new Error('Admin client not available. Check SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }
    
    console.log(`🔧 Using Admin client (Service Key) - required for admin operations`);
    
    // First, let's verify the notification exists
    const { data: existingNotification, error: selectError } = await supabaseAdmin
      .from('admin_notifications')
      .select('id, is_read, title')
      .eq('id', notificationId)
      .single();
      
    if (selectError) {
      console.error('❌ Error finding notification:', selectError);
      throw selectError;
    }
    
    if (!existingNotification) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    console.log(`📋 Found notification:`, existingNotification);
    
    // Now perform the update with service key (bypasses RLS)
    const updatePayload = { 
      is_read: true, 
      updated_at: new Date().toISOString() 
    };
    
    console.log(`📝 Update payload:`, updatePayload);
    
    const { data, error } = await supabaseAdmin
      .from('admin_notifications')
      .update(updatePayload)
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('❌ Database error when marking as read:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ Update completed but no rows returned');
    } else {
      console.log('✅ Successfully updated notification in database:', data[0]);
      console.log(`✅ Confirmed: is_read = ${data[0].is_read}`);
    }
    
    // Verify the update by reading it back
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('admin_notifications')
      .select('id, is_read, updated_at')
      .eq('id', notificationId)
      .single();
      
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
    } else {
      console.log('🔍 Verification result:', verifyData);
      if (verifyData.is_read === true) {
        console.log('🎉 SUCCESS: Database update confirmed - is_read is now TRUE!');
      } else {
        console.error('❌ FAILURE: Database update failed - is_read is still FALSE!');
      }
    }
    
    console.log('✅ Cache would be invalidated after mark as read');
  } catch (error) {
    console.error('❌ Failed to mark notification as read:', error);
    throw error;
  }

  console.log('\n🧪 Service simulation completed successfully!');
}

testServiceMarkAsRead().catch(console.error);
