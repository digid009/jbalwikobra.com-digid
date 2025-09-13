const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function getSupabaseCredentials() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/REACT_APP_SUPABASE_URL=([^\s]+)/);
  const keyMatch = envContent.match(/REACT_APP_SUPABASE_ANON_KEY=([^\s]+)/);
  return {
    url: urlMatch[1]?.trim(),
    key: keyMatch[1]?.trim()
  };
}

async function quickFlashSalesTest() {
  const { url, key } = getSupabaseCredentials();
  const supabase = createClient(url, key);
  
  console.log('=== QUICK FLASH SALES TEST ===');
  
  // Test the exact query that ProductService should use
  const { data, error } = await supabase
    .from('flash_sales')
    .select(`
      *,
      products (*)
    `)
    .eq('is_active', true)
    .gte('end_time', new Date().toISOString())
    .limit(2);

  if (error) {
    console.log('❌ Query error:', error.message);
    return;
  }

  console.log(`✅ Found ${data?.length || 0} flash sales`);
  
  if (data && data.length > 0) {
    const sale = data[0];
    const product = sale.products;
    
    console.log('\n📊 Raw Flash Sale Data:');
    console.log({
      flash_sale_id: sale.id,
      product_id: sale.product_id,
      sale_price: sale.sale_price,
      original_price: sale.original_price,
      end_time: sale.end_time,
      stock: sale.stock
    });
    
    console.log('\n📦 Raw Product Data:');
    console.log({
      id: product?.id,
      name: product?.name,
      price: product?.price,
      original_price: product?.original_price,
    });
    
    console.log('\n🔄 Mapped Product (what FlashSalesPage should get):');
    const mappedProduct = {
      ...product,
      id: product?.id,
      isFlashSale: true,
      price: sale.sale_price,
      originalPrice: sale.original_price,
      flashSaleEndTime: sale.end_time,
      stock: sale.stock || product?.stock
    };
    
    console.log(mappedProduct);
    
    const discountPercent = mappedProduct.originalPrice ? 
      Math.round(((mappedProduct.originalPrice - mappedProduct.price) / mappedProduct.originalPrice) * 100) : 0;
    
    console.log(`\n💰 Discount Check: ${discountPercent}%`);
    console.log(`Original: ${mappedProduct.originalPrice?.toLocaleString()}`);
    console.log(`Sale: ${mappedProduct.price?.toLocaleString()}`);
  }
}

quickFlashSalesTest().catch(console.error);
