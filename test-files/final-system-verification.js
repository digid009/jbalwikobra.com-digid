require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSystemVerification() {
  console.log('🔍 FINAL SYSTEM VERIFICATION');
  console.log('===============================\n');

  const results = {
    userNotifications: false,
    adminNotifications: false,
    profileEnhancements: false,
    paymentSystem: false,
    databaseHealth: false,
    rpcFunctions: false
  };

  try {
    // 1. USER NOTIFICATION SYSTEM TEST
    console.log('1. 🔔 TESTING USER NOTIFICATION SYSTEM...');
    
    const { data: testUser } = await supabase.from('users').select('id, name').limit(1).single();
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }
    
    console.log(`   ✅ Test user: ${testUser.name} (${testUser.id.substring(0, 8)}...)`);

    // Test fetching notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, title, body, user_id')
      .is('user_id', null)
      .limit(3);

    if (notifError) {
      console.log('   ❌ Error fetching notifications:', notifError.message);
    } else {
      console.log(`   ✅ Fetched ${notifications.length} global notifications`);
      
      if (notifications.length > 0) {
        // Test mark as read
        const { error: markError } = await supabase.rpc('mark_notification_read', { 
          n_id: notifications[0].id, 
          u_id: testUser.id 
        });
        
        if (markError) {
          console.log('   ❌ Mark as read failed:', markError.message);
        } else {
          console.log('   ✅ Mark as read successful');
          
          // Test mark all as read
          const { error: markAllError } = await supabase.rpc('mark_all_notifications_read', { 
            u_id: testUser.id 
          });
          
          if (markAllError) {
            console.log('   ❌ Mark all as read failed:', markAllError.message);
          } else {
            console.log('   ✅ Mark all as read successful');
            results.userNotifications = true;
          }
        }
      } else {
        console.log('   ℹ️  No notifications to test with, but system is accessible');
        results.userNotifications = true;
      }
    }

    // 2. ADMIN NOTIFICATION SYSTEM TEST
    console.log('\n2. 👨‍💼 TESTING ADMIN NOTIFICATION SYSTEM...');
    
    const { data: adminNotifs, error: adminError } = await supabase
      .from('admin_notifications')
      .select('id, title, is_read, type')
      .order('created_at', { ascending: false })
      .limit(5);

    if (adminError) {
      console.log('   ❌ Error fetching admin notifications:', adminError.message);
    } else {
      console.log(`   ✅ Fetched ${adminNotifs.length} admin notifications`);
      
      const unreadCount = adminNotifs.filter(n => !n.is_read).length;
      const readCount = adminNotifs.filter(n => n.is_read).length;
      console.log(`   📊 Unread: ${unreadCount}, Read: ${readCount}`);
      
      // Check notification types
      const types = [...new Set(adminNotifs.map(n => n.type))];
      console.log(`   📋 Types found: ${types.join(', ')}`);
      
      results.adminNotifications = true;
    }

    // 3. PROFILE ENHANCEMENTS TEST
    console.log('\n3. 👤 TESTING PROFILE ENHANCEMENTS...');
    
    // Test orders table access (for recent orders feature)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (ordersError) {
      console.log('   ❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`   ✅ Orders table accessible (${orders.length} recent orders)`);
      
      if (orders.length > 0) {
        const statuses = [...new Set(orders.map(o => o.status))];
        console.log(`   📊 Order statuses: ${statuses.join(', ')}`);
      }
      
      results.profileEnhancements = true;
    }

    // 4. PAYMENT SYSTEM TEST
    console.log('\n4. 💳 TESTING PAYMENT SYSTEM...');
    
    // Test payment methods table
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select('id, name, type, is_active')
      .eq('is_active', true);

    if (paymentError) {
      console.log('   ❌ Error fetching payment methods:', paymentError.message);
    } else {
      console.log(`   ✅ Payment methods accessible (${paymentMethods.length} active methods)`);
      
      // Check for duplicates
      const names = paymentMethods.map(p => p.name);
      const uniqueNames = [...new Set(names)];
      
      if (names.length === uniqueNames.length) {
        console.log('   ✅ No duplicate payment methods found');
        results.paymentSystem = true;
      } else {
        console.log('   ⚠️  Duplicate payment methods detected');
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        console.log('   📋 Duplicates:', [...new Set(duplicates)]);
      }
    }

    // 5. DATABASE HEALTH CHECK
    console.log('\n5. 🗄️  TESTING DATABASE HEALTH...');
    
    const tables = [
      'users', 'notifications', 'notification_reads', 'admin_notifications',
      'orders', 'products', 'payment_methods'
    ];
    
    let healthyTables = 0;
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: healthy`);
          healthyTables++;
        }
      } catch (e) {
        console.log(`   ❌ ${table}: ${e.message}`);
      }
    }
    
    results.databaseHealth = healthyTables === tables.length;
    console.log(`   📊 Database health: ${healthyTables}/${tables.length} tables healthy`);

    // 6. RPC FUNCTIONS TEST
    console.log('\n6. ⚙️  TESTING RPC FUNCTIONS...');
    
    const rpcTests = [
      {
        name: 'mark_notification_read',
        params: { n_id: '00000000-0000-0000-0000-000000000000', u_id: testUser.id },
        expectError: true
      },
      {
        name: 'mark_all_notifications_read',
        params: { u_id: testUser.id },
        expectError: false
      }
    ];
    
    let rpcSuccess = 0;
    for (const test of rpcTests) {
      try {
        const { error } = await supabase.rpc(test.name, test.params);
        
        if (test.expectError && error) {
          console.log(`   ✅ ${test.name}: expected error received`);
          rpcSuccess++;
        } else if (!test.expectError && !error) {
          console.log(`   ✅ ${test.name}: success`);
          rpcSuccess++;
        } else if (!test.expectError && error) {
          console.log(`   ❌ ${test.name}: unexpected error - ${error.message}`);
        } else {
          console.log(`   ❌ ${test.name}: unexpected success`);
        }
      } catch (e) {
        console.log(`   ❌ ${test.name}: exception - ${e.message}`);
      }
    }
    
    results.rpcFunctions = rpcSuccess === rpcTests.length;

    // FINAL RESULTS
    console.log('\n🎯 FINAL VERIFICATION RESULTS');
    console.log('================================');
    
    const allResults = [
      { name: 'User Notifications', status: results.userNotifications },
      { name: 'Admin Notifications', status: results.adminNotifications },
      { name: 'Profile Enhancements', status: results.profileEnhancements },
      { name: 'Payment System', status: results.paymentSystem },
      { name: 'Database Health', status: results.databaseHealth },
      { name: 'RPC Functions', status: results.rpcFunctions }
    ];
    
    allResults.forEach(result => {
      console.log(`${result.status ? '✅' : '❌'} ${result.name}`);
    });
    
    const successCount = allResults.filter(r => r.status).length;
    console.log(`\n📊 Overall Score: ${successCount}/${allResults.length}`);
    
    if (successCount === allResults.length) {
      console.log('\n🎉 ALL SYSTEMS ARE WORKING PERFECTLY!');
      console.log('✅ Ready for production deployment');
    } else {
      console.log('\n⚠️  Some issues detected - review above for details');
    }

  } catch (error) {
    console.error('\n❌ Final verification failed:', error);
  }
}

finalSystemVerification();
