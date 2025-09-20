require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...');
  
  try {
    // 1. Check the notification_reads table structure
    console.log('\n1. Checking notification_reads table structure...');
    const { data: schema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'notification_reads')
      .eq('table_schema', 'public');
    
    if (schemaError) {
      console.log('❌ Could not fetch schema:', schemaError.message);
    } else {
      console.log('✅ notification_reads table structure:');
      schema.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // 2. Check foreign key constraints
    console.log('\n2. Checking foreign key constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'notification_reads')
      .eq('table_schema', 'public')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (constraintError) {
      console.log('❌ Could not fetch constraints:', constraintError.message);
    } else {
      console.log('✅ Foreign key constraints on notification_reads:');
      constraints.forEach(con => {
        console.log(`  - ${con.constraint_name}: ${con.constraint_type}`);
      });
    }
    
    // 3. Check what table the user_id references
    console.log('\n3. Checking foreign key references...');
    const { data: keyUsage, error: keyError } = await supabase
      .from('information_schema.key_column_usage')
      .select('column_name, referenced_table_name, referenced_column_name')
      .eq('table_name', 'notification_reads')
      .eq('table_schema', 'public');
    
    if (keyError) {
      console.log('❌ Could not fetch key usage:', keyError.message);
    } else {
      console.log('✅ Foreign key references:');
      keyUsage.forEach(key => {
        console.log(`  - Column ${key.column_name} references ${key.referenced_table_name}.${key.referenced_column_name}`);
      });
    }
    
    // 4. Check available user tables
    console.log('\n4. Checking available user-related tables...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%user%');
    
    if (tableError) {
      console.log('❌ Could not fetch tables:', tableError.message);
    } else {
      console.log('✅ User-related tables:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 5. Check auth.users table (if accessible)
    console.log('\n5. Checking auth schema...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id')
        .limit(1);
      
      if (authError) {
        console.log('❌ Could not access auth.users:', authError.message);
      } else {
        console.log('✅ auth.users table is accessible');
        if (authUsers && authUsers.length > 0) {
          console.log('Sample auth user ID:', authUsers[0].id.slice(0, 8) + '...');
        }
      }
    } catch (e) {
      console.log('❌ Cannot access auth.users:', e.message);
    }
    
    // 6. Check our users table
    console.log('\n6. Checking our users table...');
    const { data: ourUsers, error: ourUserError } = await supabase
      .from('users')
      .select('id, name')
      .limit(3);
    
    if (ourUserError) {
      console.log('❌ Could not fetch from users table:', ourUserError.message);
    } else {
      console.log('✅ Our users table data:');
      ourUsers.forEach(user => {
        console.log(`  - ID: ${user.id.slice(0, 8)}... Name: ${user.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
  
  process.exit(0);
}

checkDatabaseSchema().catch(console.error);
