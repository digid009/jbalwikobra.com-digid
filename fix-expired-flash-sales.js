require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

function getSupabaseCredentials() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_SERVICE_KEY; // Using service key to bypass RLS
  
  if (!url || !key) {
    throw new Error('Supabase credentials not found in environment variables');
  }
  
  return { url, key };
}

async function fixExpiredFlashSales() {
  const { url, key } = getSupabaseCredentials();
  const supabase = createClient(url, key);
  
  console.log('=== FIXING EXPIRED FLASH SALES ===');
  
  // Get expired flash sales
  const { data: expiredSales, error } = await supabase
    .from('flash_sales')
    .select('id, end_time, products(name)')
    .eq('is_active', true)
    .lt('end_time', new Date().toISOString());

  if (error) {
    console.log('❌ Query error:', error.message);
    return;
  }

  console.log(`Found ${expiredSales?.length || 0} expired flash sales`);
  
  if (expiredSales && expiredSales.length > 0) {
    // Set new end time to 24 hours from now
    const newEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log(`🔄 Setting new end time to: ${newEndTime.toISOString()}`);
    
    for (const sale of expiredSales) {
      console.log(`\nUpdating: ${sale.products?.name || 'Unknown Product'}`);
      console.log(`  Old end time: ${sale.end_time}`);
      
      const { error: updateError } = await supabase
        .from('flash_sales')
        .update({ end_time: newEndTime.toISOString() })
        .eq('id', sale.id);
        
      if (updateError) {
        console.log(`  ❌ Failed: ${updateError.message}`);
      } else {
        console.log(`  ✅ Updated successfully`);
      }
    }
    
    console.log('\n🎉 All expired flash sales have been updated!');
    console.log('Now all flash sales should show timers and discounts.');
  } else {
    console.log('✅ No expired flash sales found.');
  }
}

fixExpiredFlashSales().catch(console.error);
