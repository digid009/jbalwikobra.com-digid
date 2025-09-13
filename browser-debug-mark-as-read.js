/**
 * BROWSER DEBUG SCRIPT - Copy and paste this into browser console
 * Tests mark as read functionality directly in the browser
 */

// Step 1: Test current notification service
console.log('🔧 TESTING MARK AS READ FUNCTIONALITY');
console.log('=====================================\n');

// Step 2: Import the notification service if not already available
// Make sure you're on a page where adminNotificationService is loaded

// Step 3: Test marking specific notification as read
const testNotificationId = '897fa6b0-da5c-4679-9c01-95ebe1b76989';

// Function to test mark as read
async function testMarkAsReadInBrowser() {
  try {
    console.log('1. Testing adminNotificationService.markAsRead()...');
    
    // Check if service is available
    if (typeof window.adminNotificationService === 'undefined') {
      console.log('⚠️ adminNotificationService not found on window. Trying to import...');
      
      // Try to access from React component or create new instance
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      
      const supabase = createClient(
        'https://mzrqjvvzdknpjrwftsiq.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg4MjIsImV4cCI6MjA1MDk1NDgyMn0.LkOXqCKNuYGPUg3bMsYYF5LdgjQWVhQZtQ8qjDJpgSo'
      );
      
      console.log('✅ Created Supabase client');
      
      // Test direct Supabase update
      console.log('2. Testing direct Supabase update...');
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', testNotificationId)
        .select();
      
      if (error) {
        console.error('❌ Direct Supabase update failed:', error);
        return;
      }
      
      console.log('✅ Direct Supabase update successful:', data);
      
      // Verify the update
      console.log('3. Verifying update...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('id', testNotificationId)
        .single();
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
        return;
      }
      
      console.log('✅ Verification result:');
      console.log('   ID:', verifyData.id);
      console.log('   Is Read:', verifyData.is_read);
      console.log('   Updated At:', verifyData.updated_at);
      console.log('   SUCCESS:', verifyData.is_read === true ? '✅ YES' : '❌ NO');
      
    } else {
      // Use existing service
      console.log('✅ Found adminNotificationService, using it...');
      await window.adminNotificationService.markAsRead(testNotificationId);
      console.log('✅ Called adminNotificationService.markAsRead()');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Step 4: Also test fetching current state
async function checkCurrentNotificationState() {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabase = createClient(
      'https://mzrqjvvzdknpjrwftsiq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg4MjIsImV4cCI6MjA1MDk1NDgyMn0.LkOXqCKNuYGPUg3bMsYYF5LdgjQWVhQZtQ8qjDJpgSo'
    );
    
    console.log('📋 CURRENT NOTIFICATION STATE:');
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', testNotificationId)
      .single();
    
    if (error) {
      console.error('❌ Failed to fetch current state:', error);
      return;
    }
    
    console.log('✅ Current notification state:');
    console.log('   ID:', data.id);
    console.log('   Title:', data.title);
    console.log('   Is Read:', data.is_read);
    console.log('   Updated At:', data.updated_at);
    console.log('   Created At:', data.created_at);
    
  } catch (error) {
    console.error('❌ Failed to check current state:', error);
  }
}

// Instructions
console.log(`
📋 INSTRUCTIONS:
1. First run: checkCurrentNotificationState()
2. Then run: testMarkAsReadInBrowser()  
3. Then run: checkCurrentNotificationState() again to verify

Copy and paste these function calls one by one:
checkCurrentNotificationState()
testMarkAsReadInBrowser()
checkCurrentNotificationState()
`);
