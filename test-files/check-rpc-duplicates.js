require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRPCFunctionDuplicates() {
  console.log('🔍 Checking for RPC Function Duplicates...\n');

  try {
    // Check if we can query pg_proc to see function definitions
    const { data: functions, error: funcError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            proname as function_name,
            pronargs as arg_count,
            proargnames as arg_names,
            prosrc as function_body
          FROM pg_proc 
          WHERE proname LIKE '%notification%'
          ORDER BY proname;
        `
      });

    if (funcError) {
      console.log('❌ Cannot query pg_proc directly, testing function behavior...');
      
      // Test function behavior to detect duplicates
      console.log('\n1. Testing mark_notification_read behavior...');
      
      // Call with correct parameters
      const { error: error1 } = await supabase.rpc('mark_notification_read', { 
        n_id: '00000000-0000-0000-0000-000000000000', 
        u_id: '00000000-0000-0000-0000-000000000000' 
      });
      
      console.log('With n_id, u_id:', error1 ? 'Expected error: ' + error1.message.slice(0, 100) : 'Unexpected success');
      
      // Test with old parameter names to see if there are duplicate functions
      const { error: error2 } = await supabase.rpc('mark_notification_read', { 
        notification_id: '00000000-0000-0000-0000-000000000000', 
        user_id: '00000000-0000-0000-0000-000000000000' 
      });
      
      console.log('With notification_id, user_id:', error2 ? 'Error: ' + error2.message.slice(0, 100) : 'Unexpected success');
      
      console.log('\n2. Testing mark_all_notifications_read behavior...');
      
      // Call with correct parameters
      const { error: error3 } = await supabase.rpc('mark_all_notifications_read', { 
        u_id: '00000000-0000-0000-0000-000000000000'
      });
      
      console.log('With u_id:', error3 ? 'Expected behavior: ' + (error3.message.includes('schema') ? 'NOT FOUND' : 'EXISTS') : 'SUCCESS');
      
      // Test with old parameter name
      const { error: error4 } = await supabase.rpc('mark_all_notifications_read', { 
        user_id: '00000000-0000-0000-0000-000000000000'
      });
      
      console.log('With user_id:', error4 ? 'Error: ' + error4.message.slice(0, 100) : 'Unexpected success');
      
    } else {
      console.log('✅ Found notification-related functions:');
      functions.forEach(func => {
        console.log(`- ${func.function_name} (${func.arg_count} args)`);
        if (func.arg_names) {
          console.log(`  Parameters: ${func.arg_names.join(', ')}`);
        }
      });
    }

    // Check for any SQL migration files that might create duplicate functions
    console.log('\n3. Looking for SQL files that might create duplicate functions...');
    
  } catch (error) {
    console.error('❌ RPC check failed:', error);
  }
}

checkRPCFunctionDuplicates();
