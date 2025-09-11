require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsSchema() {
  console.log('=== CHECKING PRODUCTS TABLE SCHEMA ===');
  
  try {
    // Get a few products to see the actual structure
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Products table structure:');
      console.log('Fields found:', Object.keys(data[0]));
      console.log('\nSample product data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('No products found in the table');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProductsSchema();
