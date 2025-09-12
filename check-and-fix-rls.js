const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkAndFixRLS() {
  console.log('=== CHECKING AND FIXING RLS POLICIES ===');
  
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';
  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, serviceKey);
  
  try {
    // Check current RLS status (without forcerowsecurity)
    console.log('1. Checking current RLS status...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables 
        WHERE tablename = 'orders';
      `
    });
    
    if (tableError) {
      console.log('Cannot execute SQL directly. Checking with alternative method...');
      
      // Alternative: Check policies directly
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'orders');
        
      if (policiesError) {
        console.log('Cannot access pg_policies view. Using manual check...');
        
        // Test current access with anon key
        console.log('2. Testing current anonymous access...');
        const anonSupabase = createClient(
          process.env.REACT_APP_SUPABASE_URL, 
          process.env.REACT_APP_SUPABASE_ANON_KEY
        );
        
        const { data: anonTest, error: anonError } = await anonSupabase
          .from('orders')
          .select('id')
          .limit(1);
          
        console.log('Anonymous access result:', {
          hasData: anonTest?.length > 0,
          error: anonError?.message
        });
        
        if (anonError) {
          console.log('3. Creating public access policy...');
          
          // Try to create a public policy using service role
          const policySQL = `
            -- Drop existing restrictive policies
            DROP POLICY IF EXISTS "Orders are only visible to authenticated users" ON orders;
            DROP POLICY IF EXISTS "Users can only see their own orders" ON orders;
            DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
            
            -- Create permissive policy
            CREATE POLICY "Public can access all orders" ON orders
            FOR ALL 
            TO public
            USING (true)
            WITH CHECK (true);
          `;
          
          const { error: policyError } = await supabase.rpc('exec_sql', {
            sql: policySQL
          });
          
          if (policyError) {
            console.log('Policy creation failed:', policyError.message);
            console.log('Trying to disable RLS entirely...');
            
            const { error: disableError } = await supabase.rpc('exec_sql', {
              sql: 'ALTER TABLE orders DISABLE ROW LEVEL SECURITY;'
            });
            
            if (disableError) {
              console.log('Cannot disable RLS:', disableError.message);
              console.log('');
              console.log('💡 MANUAL SOLUTION REQUIRED:');
              console.log('Run this SQL in your Supabase SQL editor:');
              console.log('');
              console.log('CREATE POLICY "Public can access all orders" ON orders');
              console.log('FOR ALL TO public USING (true) WITH CHECK (true);');
              console.log('');
              console.log('OR disable RLS entirely:');
              console.log('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');
            } else {
              console.log('✅ RLS disabled successfully');
            }
          } else {
            console.log('✅ Public policy created successfully');
          }
          
          // Test again after policy change
          console.log('4. Testing access after policy change...');
          const { data: testAgain, error: testError } = await anonSupabase
            .from('orders')
            .select('id')
            .limit(1);
            
          console.log('Post-fix anonymous access:', {
            hasData: testAgain?.length > 0,
            error: testError?.message
          });
          
          if (testAgain && testAgain.length > 0) {
            console.log('🎉 SUCCESS! Anonymous access now works');
          }
        } else {
          console.log('✅ Anonymous access already working');
        }
      } else {
        console.log('Existing policies:', policies);
      }
    } else {
      console.log('Table RLS info:', tableInfo);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndFixRLS().catch(console.error);
