const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile() {
  console.log('🔧 Executing RLS fix for orders table...\n');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-orders-rls-simple.sql', 'utf8');
    
    // Split SQL commands by semicolon and execute one by one
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.includes('DO $$') || command.includes('END $$')) {
        // Skip complex blocks for now
        console.log(`⏭️  Skipping complex SQL block ${i + 1}`);
        continue;
      }
      
      if (command.includes('NOTIFY pgrst')) {
        console.log(`⏭️  Skipping NOTIFY command ${i + 1}`);
        continue;
      }
      
      console.log(`🔄 Executing command ${i + 1}: ${command.substring(0, 60)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: command + ';'
      });
      
      if (error) {
        console.log(`⚠️  Command ${i + 1} failed:`, error.message);
        // Continue with next command
      } else {
        console.log(`✅ Command ${i + 1} completed`);
      }
    }
    
    // Test the fix
    console.log('\n🧪 Testing the fix...');
    
    // Test anonymous access
    const anonClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    const { data: anonOrders, error: anonError } = await anonClient
      .from('orders')
      .select('id, customer_name, amount')
      .limit(5);
    
    if (anonError) {
      console.log('❌ Anonymous access still failing:', anonError.message);
    } else {
      console.log(`✅ Anonymous access working! Found ${anonOrders?.length || 0} orders`);
      if (anonOrders?.length > 0) {
        console.log('📊 Sample orders:', anonOrders.map(o => ({ id: o.id, customer: o.customer_name, amount: o.amount })));
      }
    }
    
  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
  }
}

executeSQLFile();
