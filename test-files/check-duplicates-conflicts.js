require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForDuplicatesAndConflicts() {
  console.log('🔍 Checking for Duplicates and Conflicts...\n');

  try {
    // 1. Check notification_reads table constraints
    console.log('1. Checking notification_reads table constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            tc.constraint_name, 
            tc.constraint_type,
            kcu.column_name,
            kcu.referenced_table_name,
            kcu.referenced_column_name
          FROM 
            information_schema.table_constraints tc
            LEFT JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
          WHERE 
            tc.table_name = 'notification_reads' 
            AND tc.table_schema = 'public'
            AND tc.constraint_type = 'FOREIGN KEY'
          ORDER BY tc.constraint_name;
        `
      });

    if (constraintsError) {
      console.log('❌ Could not check constraints via RPC, trying manual test...');
      
      // Test constraint by trying an insert
      const { error: insertError } = await supabase
        .from('notification_reads')
        .insert({ 
          notification_id: '00000000-0000-0000-0000-000000000000', 
          user_id: '00000000-0000-0000-0000-000000000000' 
        });
      
      if (insertError) {
        if (insertError.message.includes('foreign key constraint')) {
          console.log('⚠️  Foreign key constraint still exists:', insertError.message);
        } else {
          console.log('✅ No foreign key constraint blocking (other error expected):', insertError.message);
        }
      } else {
        console.log('⚠️  Insert succeeded - this might indicate missing constraints');
      }
    } else {
      console.log('✅ Constraints check:', constraints);
    }

    // 2. Check for duplicate RPC functions
    console.log('\n2. Checking for duplicate RPC functions...');
    
    // Test mark_notification_read
    const { error: rpc1Error } = await supabase.rpc('mark_notification_read', { 
      n_id: '00000000-0000-0000-0000-000000000000', 
      u_id: '00000000-0000-0000-0000-000000000000' 
    });
    
    console.log('mark_notification_read:', rpc1Error ? 
      (rpc1Error.message.includes('schema cache') ? '❌ NOT FOUND' : '✅ EXISTS') : 
      '✅ EXISTS');

    // Test mark_all_notifications_read
    const { error: rpc2Error } = await supabase.rpc('mark_all_notifications_read', { 
      u_id: '00000000-0000-0000-0000-000000000000' 
    });
    
    console.log('mark_all_notifications_read:', rpc2Error ? 
      (rpc2Error.message.includes('schema cache') ? '❌ NOT FOUND' : '✅ EXISTS') : 
      '✅ EXISTS');

    // 3. Check notification tables structure
    console.log('\n3. Checking notification tables...');
    
    const tables = ['notifications', 'notification_reads', 'admin_notifications'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    }

    // 4. Test notification flow end-to-end
    console.log('\n4. Testing notification flow for conflicts...');
    
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (userError) {
      console.log('❌ Cannot get test user:', userError.message);
      return;
    }

    // Test creating a read record
    const testNotificationId = '9da64267-8b25-44f1-8f02-ba82e9f69d73'; // Known notification
    const { error: readError } = await supabase.rpc('mark_notification_read', { 
      n_id: testNotificationId, 
      u_id: testUser.id 
    });

    if (readError) {
      console.log('⚠️  Mark as read test error:', readError.message);
    } else {
      console.log('✅ Mark as read test successful');
    }

    // 5. Check for any orphaned data
    console.log('\n5. Checking for orphaned data...');
    
    const { data: orphanedReads, error: orphanError } = await supabase
      .from('notification_reads')
      .select('notification_id, user_id')
      .limit(5);

    if (!orphanError && orphanedReads) {
      console.log(`📊 notification_reads records: ${orphanedReads.length}`);
      
      // Check if these notification IDs actually exist
      if (orphanedReads.length > 0) {
        const notificationIds = orphanedReads.map(r => r.notification_id);
        const { data: existingNotifs, error: existError } = await supabase
          .from('notifications')
          .select('id')
          .in('id', notificationIds);

        if (!existError) {
          console.log(`📊 Corresponding notifications exist: ${existingNotifs.length}/${orphanedReads.length}`);
          
          if (existingNotifs.length < orphanedReads.length) {
            console.log('⚠️  Some notification_reads records point to non-existent notifications');
          }
        }
      }
    }

    console.log('\n✅ Duplicate and conflict check completed');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkForDuplicatesAndConflicts();
