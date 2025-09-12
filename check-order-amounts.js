const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function checkOrderAmounts() {
  console.log('=== CHECKING ORDER AMOUNTS ===');
  
  // Try different column names that might store amount/price
  const columns = ['amount', 'total_amount', 'total', 'price', 'order_amount'];
  
  for (const col of columns) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(col)
        .limit(3);
      
      if (!error && data && data.length > 0 && data[0][col] !== undefined) {
        console.log(`✅ Column '${col}' exists with data:`, data);
      } else {
        console.log(`❌ Column '${col}' error:`, error?.message || 'no data/null values');
      }
    } catch (e) {
      console.log(`❌ Column '${col}' exception:`, e.message);
    }
  }
  
  // Check full record structure with all numeric fields
  const { data: sample } = await supabase
    .from('orders')
    .select('*')
    .limit(2);
    
  console.log('\n=== FULL RECORD SAMPLE ===');
  console.log(JSON.stringify(sample, null, 2));
}

checkOrderAmounts();
