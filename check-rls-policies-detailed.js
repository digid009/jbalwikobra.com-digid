const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking current RLS policies on orders table...\n');

  try {
    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_status', {
      table_name: 'orders'
    });
    
    if (rlsError) {
      // Try alternative method
      const { data: tableInfo, error: tableError } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', 'orders')
        .single();
        
      if (!tableError) {
        console.log(`📋 RLS Status: ${tableInfo.relrowsecurity ? 'ENABLED' : 'DISABLED'}`);
      }
    } else {
      console.log(`📋 RLS Status: ${rlsStatus ? 'ENABLED' : 'DISABLED'}`);
    }

    // Check existing policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'orders');
    
    if (policiesError) {
      console.log('⚠️ Could not fetch policies:', policiesError.message);
    } else {
      console.log(`\n📜 Current policies on orders table: ${policies.length} found`);
      
      policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. Policy: "${policy.policyname}"`);
        console.log(`   - Command: ${policy.cmd}`);
        console.log(`   - Roles: ${policy.roles?.join(', ') || 'N/A'}`);
        console.log(`   - Using: ${policy.qual || 'N/A'}`);
        console.log(`   - With Check: ${policy.with_check || 'N/A'}`);
      });
    }

    // Test access with service role
    console.log('\n🔧 Testing service role access...');
    const { data: serviceRoleOrders, error: serviceError } = await supabase
      .from('orders')
      .select('id')
      .limit(5);
    
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError.message);
    } else {
      console.log(`✅ Service role can access ${serviceRoleOrders?.length || 0} orders`);
    }

    // Test access with anonymous (what the admin client sees)
    console.log('\n🔧 Testing anonymous access...');
    const anonClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    const { data: anonOrders, error: anonError } = await anonClient
      .from('orders')
      .select('id')
      .limit(5);
    
    if (anonError) {
      console.log('❌ Anonymous access failed:', anonError.message);
    } else {
      console.log(`📊 Anonymous can access ${anonOrders?.length || 0} orders`);
    }

    // Check users table for admin users
    console.log('\n👥 Checking for admin users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, name, email, is_admin')
      .eq('is_admin', true)
      .limit(3);
    
    if (adminError) {
      console.log('❌ Could not check admin users:', adminError.message);
    } else {
      console.log(`✅ Found ${adminUsers?.length || 0} admin users:`);
      adminUsers?.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking RLS:', error.message);
  }
}

checkRLSPolicies();
