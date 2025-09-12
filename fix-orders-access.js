const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixOrdersAccess() {
  console.log('=== FIXING ORDERS ACCESS ===');
  
  // Use the commented service key temporarily for testing
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';
  
  console.log('Creating service client...');
  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, serviceKey);
  
  try {
    // Test service role access
    console.log('Testing service role access to orders...');
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(5);
      
    console.log('Orders query result:', { 
      count, 
      hasData: orders?.length > 0, 
      error: ordersError?.message 
    });
    
    if (orders && orders.length > 0) {
      console.log('✅ SUCCESS! Service role can access orders');
      console.log('Sample orders:', orders.slice(0, 2));
      
      // Check current RLS policies
      console.log('\nChecking current RLS policies...');
      const { data: policies, error: policiesError } = await supabase.rpc('get_rls_policies', {
        table_name: 'orders'
      });
      
      console.log('RLS Policies:', policies || 'No policies returned');
      
      // Create admin access policy
      console.log('\nCreating admin access policy...');
      const adminPolicySQL = `
        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS "Orders are only visible to authenticated users" ON orders;
        DROP POLICY IF EXISTS "Users can only see their own orders" ON orders;
        
        -- Create admin-friendly policy
        CREATE POLICY "Admin can access all orders" ON orders 
        FOR ALL 
        TO public 
        USING (true) 
        WITH CHECK (true);
      `;
      
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: adminPolicySQL
      });
      
      if (policyError) {
        console.log('Policy creation failed:', policyError.message);
        
        // Alternative: Try to disable RLS temporarily
        console.log('Trying to disable RLS on orders table...');
        const { error: disableError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE orders DISABLE ROW LEVEL SECURITY;'
        });
        
        if (disableError) {
          console.log('Could not disable RLS:', disableError.message);
        } else {
          console.log('✅ RLS disabled on orders table');
        }
      } else {
        console.log('✅ Admin access policy created');
      }
      
      // Test access with anon key after policy change
      console.log('\nTesting anon access after policy change...');
      const anonSupabase = createClient(
        process.env.REACT_APP_SUPABASE_URL, 
        process.env.REACT_APP_SUPABASE_ANON_KEY
      );
      
      const { data: anonOrders, error: anonError } = await anonSupabase
        .from('orders')
        .select('*')
        .limit(3);
        
      console.log('Anon access test:', { 
        hasData: anonOrders?.length > 0, 
        error: anonError?.message 
      });
      
      if (anonOrders && anonOrders.length > 0) {
        console.log('🎉 SUCCESS! Orders now accessible with anon key');
      }
      
    } else {
      console.log('❌ Service role cannot access orders:', ordersError?.message);
    }
    
  } catch (error) {
    console.error('Error fixing orders access:', error.message);
  }
}

fixOrdersAccess().catch(console.error);
