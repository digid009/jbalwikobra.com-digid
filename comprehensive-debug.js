/**
 * COMPREHENSIVE DEBUG GUIDE for Mark as Read Issue
 * 
 * PROBLEM: Console shows success but database is_read remains false
 * SYMPTOMS: UI shows mark as read working, but database not updated
 */

// 1. BROWSER CONSOLE DEBUGGING
console.log('🔧 MARK AS READ DEBUGGING GUIDE');
console.log('=================================\n');

// First, let's check the exact issue by creating a comprehensive test
async function debugMarkAsReadIssue() {
  const notificationId = '897fa6b0-da5c-4679-9c01-95ebe1b76989';
  
  try {
    console.log('Step 1: Check if Supabase client is properly initialized...');
    
    // Import Supabase directly
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = 'https://mzrqjvvzdknpjrwftsiq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg4MjIsImV4cCI6MjA1MDk1NDgyMn0.LkOXqCKNuYGPUg3bMsYYF5LdgjQWVhQZtQ8qjDJpgSo';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    console.log('Step 2: Check current notification state...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (beforeError) {
      console.error('❌ Failed to fetch notification:', beforeError);
      return;
    }
    
    console.log('✅ Current state:');
    console.log('   ID:', beforeData.id);
    console.log('   Is Read:', beforeData.is_read);
    console.log('   Updated At:', beforeData.updated_at);
    
    console.log('Step 3: Attempt to update...');
    const updateTime = new Date().toISOString();
    
    const { data: updateData, error: updateError } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        updated_at: updateTime 
      })
      .eq('id', notificationId)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.log('Error details:', JSON.stringify(updateError, null, 2));
      
      // Check if it's RLS policy issue
      if (updateError.code === '42501' || updateError.message.includes('policy')) {
        console.log('🚨 This looks like a Row Level Security (RLS) policy issue!');
        console.log('   The update is being blocked by database security policies.');
        console.log('   This means the update command is working but being rejected by the database.');
      }
      
      return;
    }
    
    console.log('✅ Update executed');
    console.log('   Returned data:', updateData);
    console.log('   Rows affected:', updateData.length);
    
    if (updateData.length === 0) {
      console.log('🚨 NO ROWS WERE UPDATED!');
      console.log('   This suggests the WHERE clause didn\'t match any rows');
      console.log('   or RLS policy blocked the update');
    }
    
    console.log('Step 4: Verify the update...');
    const { data: afterData, error: afterError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (afterError) {
      console.error('❌ Failed to verify:', afterError);
      return;
    }
    
    console.log('✅ After update state:');
    console.log('   ID:', afterData.id);
    console.log('   Is Read:', afterData.is_read);
    console.log('   Updated At:', afterData.updated_at);
    console.log('   Changed:', beforeData.updated_at !== afterData.updated_at ? '✅ YES' : '❌ NO');
    console.log('   Success:', afterData.is_read === true ? '✅ YES' : '❌ NO');
    
    if (afterData.is_read === false && updateData.length > 0) {
      console.log('🚨 CRITICAL ISSUE IDENTIFIED:');
      console.log('   - Update command executed successfully');
      console.log('   - Supabase returned success response');
      console.log('   - But database value did not change');
      console.log('   - This indicates a Row Level Security (RLS) policy issue');
      console.log('   - The policy allows the UPDATE query to run but then rolls it back');
    }
    
  } catch (error) {
    console.error('❌ Debugging failed:', error);
  }
}

// 2. Test RLS Policy directly
async function testRLSPolicy() {
  console.log('\n🔒 TESTING RLS POLICY');
  console.log('====================');
  
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabase = createClient(
      'https://mzrqjvvzdknpjrwftsiq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cnFqdnZ6ZGtucGpyd2Z0c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzg4MjIsImV4cCI6MjA1MDk1NDgyMn0.LkOXqCKNuYGPUg3bMsYYF5LdgjQWVhQZtQ8qjDJpgSo'
    );
    
    // Test simple read access
    console.log('Testing READ access...');
    const { data: readData, error: readError } = await supabase
      .from('admin_notifications')
      .select('id, is_read')
      .limit(1);
    
    if (readError) {
      console.error('❌ READ access denied:', readError);
    } else {
      console.log('✅ READ access OK:', readData.length, 'rows');
    }
    
    // Test insert access
    console.log('Testing INSERT access...');
    const { data: insertData, error: insertError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'test',
        title: 'Test RLS Policy',
        message: 'Testing insert for RLS policy',
        is_read: false
      })
      .select();
    
    if (insertError) {
      console.error('❌ INSERT access denied:', insertError);
    } else {
      console.log('✅ INSERT access OK:', insertData);
    }
    
    // Test update access
    if (insertData && insertData.length > 0) {
      const testId = insertData[0].id;
      console.log('Testing UPDATE access...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', testId)
        .select();
      
      if (updateError) {
        console.error('❌ UPDATE access denied:', updateError);
      } else {
        console.log('✅ UPDATE access OK:', updateData);
      }
      
      // Clean up
      await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', testId);
    }
    
  } catch (error) {
    console.error('❌ RLS test failed:', error);
  }
}

console.log(`
🎯 DEBUGGING INSTRUCTIONS:
1. Copy and paste this entire script into browser console
2. Run: debugMarkAsReadIssue()
3. Run: testRLSPolicy()
4. Report the results to identify the root cause

The issue is likely one of these:
- RLS Policy blocking anonymous user updates
- Wrong user context (not authenticated as admin)
- Database trigger interfering with updates
- Caching issue where old data is displayed

Copy this command to start:
debugMarkAsReadIssue()
`);
