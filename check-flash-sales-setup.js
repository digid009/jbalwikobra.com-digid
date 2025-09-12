const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function checkFlashSalesSetup() {
  console.log('=== CHECKING FLASH SALES SETUP ===');
  
  try {
    // 1. Check if flash_sales table exists
    console.log('\n1. Checking flash_sales table...');
    const { data: flashSales, error: flashError } = await supabase
      .from('flash_sales')
      .select('*')
      .limit(1);
    
    if (flashError) {
      console.log('❌ Flash sales table error:', flashError.message);
      if (flashError.message.includes('does not exist')) {
        console.log('💡 Flash sales table needs to be created');
      }
    } else {
      console.log('✅ Flash sales table exists');
      console.log('Sample data:', flashSales);
    }
    
    // 2. Check products available for flash sales
    console.log('\n2. Checking products for flash sales...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, is_active')
      .eq('is_active', true)
      .limit(10);
      
    if (prodError) {
      console.log('❌ Products query error:', prodError.message);
    } else {
      console.log(`✅ ${products.length} active products available for flash sales:`);
      products.forEach((p, i) => console.log(`   ${i+1}. ${p.name} - Rp ${p.price.toLocaleString()}`));
    }
    
    // 3. Check table schema
    console.log('\n3. Checking flash_sales table schema...');
    const { data: schema, error: schemaError } = await supabase.rpc('get_table_schema', {
      table_name: 'flash_sales'
    });
    
    if (schemaError) {
      console.log('⚠️ Could not fetch schema:', schemaError.message);
    } else {
      console.log('✅ Table schema available');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

checkFlashSalesSetup();
