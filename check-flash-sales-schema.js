require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFlashSalesSchema() {
  console.log('=== CHECKING FLASH_SALES TABLE SCHEMA ===');
  
  try {
    // Get table information
    const { data, error } = await supabase
      .rpc('get_table_schema', { table_name: 'flash_sales' })
      .single();
    
    if (error) {
      console.log('RPC not available, using alternative method...');
      
      // Alternative: Get a sample record to see structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('flash_sales')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error('Error getting sample data:', sampleError);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('Current flash_sales columns based on sample data:');
        Object.keys(sampleData[0]).forEach(column => {
          console.log(`  - ${column}`);
        });
      } else {
        console.log('No flash sales records found. Attempting to insert test record to see required fields...');
        
        // Try to get table info from information_schema
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'flash_sales')
          .eq('table_schema', 'public');
          
        if (!schemaError && schemaData) {
          console.log('Flash_sales table columns:');
          schemaData.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
        }
      }
    } else {
      console.log('Table schema:', data);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkFlashSalesSchema();
