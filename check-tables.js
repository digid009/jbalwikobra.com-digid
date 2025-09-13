const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    // Check what tables exist by trying different table names
    const tables = ['users', 'orders', 'products', 'profiles', 'product_reviews'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table '${table}' error:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists`);
          if (data && data.length > 0) {
            console.log(`   Columns:`, Object.keys(data[0]).join(', '));
          } else {
            console.log(`   No data found`);
          }
        }
      } catch (e) {
        console.log(`❌ Table '${table}' not accessible:`, e.message);
      }
      console.log();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
