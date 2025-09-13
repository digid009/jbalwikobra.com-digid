/**
 * Test Database Connection and Mark as Read with Service Key
 * Tests using service key for admin operations
 */

const { createClient } = require('@supabase/supabase-js');

// Try with service key for admin operations
const SUPABASE_URL = 'https://mzrqjvvzdknpjrwftsiq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTM3ODgyMiwiZXhwIjoyMDUwOTU0ODIyfQ.8YBdI4w5NcCGFa-fCIGe7xzJOk3o4G9qDTLRtKEHnw4'; // Service key bypasses RLS

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testWithServiceKey() {
  console.log('🔧 Testing Mark as Read with Service Key');
  console.log('=========================================\n');
  
  try {
    // First, get the existing notification from CSV
    const notificationId = '897fa6b0-da5c-4679-9c01-95ebe1b76989';
    
    console.log('1. Fetching existing notification...');
    const { data: existingNotif, error: fetchError } = await supabaseAdmin
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (fetchError) {
      console.error('❌ Failed to fetch notification:', fetchError);
      return;
    }
    
    console.log('✅ Found notification:');
    console.log('   ID:', existingNotif.id);
    console.log('   Title:', existingNotif.title);
    console.log('   Is Read (before):', existingNotif.is_read);
    console.log('   Updated At (before):', existingNotif.updated_at);
    
    // Now try to update it
    console.log('\n2. Marking notification as read...');
    const updateTime = new Date().toISOString();
    
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        updated_at: updateTime 
      })
      .eq('id', notificationId)
      .select();
    
    if (updateError) {
      console.error('❌ Failed to update notification:', updateError);
      return;
    }
    
    console.log('✅ Update executed successfully');
    console.log('   Returned data:', updatedData);
    
    // Verify the update
    console.log('\n3. Verifying update...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (verifyError) {
      console.error('❌ Failed to verify update:', verifyError);
      return;
    }
    
    console.log('✅ Verification complete:');
    console.log('   ID:', verifyData.id);
    console.log('   Is Read (after):', verifyData.is_read);
    console.log('   Updated At (after):', verifyData.updated_at);
    console.log('   Update successful:', verifyData.is_read === true ? '✅ YES' : '❌ NO');
    
    // Test again - mark as unread to reset for testing
    console.log('\n4. Resetting to unread for testing...');
    const { error: resetError } = await supabaseAdmin
      .from('admin_notifications')
      .update({ 
        is_read: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', notificationId);
    
    if (resetError) {
      console.error('❌ Failed to reset notification:', resetError);
    } else {
      console.log('✅ Reset to unread for future testing');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testWithServiceKey().catch(console.error);
