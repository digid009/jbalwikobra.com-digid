const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function testFlashSalesCreation() {
  console.log('=== TESTING FLASH SALES CREATION ===');
  
  try {
    // 1. Get a sample product for testing
    console.log('\n1. Finding a product for flash sale...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, is_active')
      .eq('is_active', true)
      .limit(1);
      
    if (prodError || !products || products.length === 0) {
      console.log('❌ No active products found');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Using product: ${testProduct.name} (Rp ${testProduct.price.toLocaleString()})`);
    
    // 2. Create a test flash sale
    console.log('\n2. Creating test flash sale...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const flashSaleData = {
      product_id: testProduct.id,
      original_price: testProduct.price,
      sale_price: Math.round(testProduct.price * 0.8), // 20% discount
      discount_percentage: 20,
      start_time: now.toISOString(),
      end_time: tomorrow.toISOString(),
      is_active: true,
      stock: 5
    };
    
    const { data: newFlashSale, error: createError } = await supabase
      .from('flash_sales')
      .insert([flashSaleData])
      .select(`
        *,
        products(name, price, image)
      `)
      .single();
    
    if (createError) {
      console.log('❌ Flash sale creation failed:', createError.message);
      console.log('Error details:', createError);
      return;
    }
    
    console.log('✅ Flash sale created successfully!');
    console.log('Flash sale ID:', newFlashSale.id);
    console.log('Product:', newFlashSale.products?.name);
    console.log('Discount:', `${newFlashSale.discount_percentage}%`);
    console.log('Sale Price: Rp', newFlashSale.sale_price.toLocaleString());
    
    // 3. Test fetching flash sales with products
    console.log('\n3. Testing flash sales query...');
    const { data: flashSales, error: queryError } = await supabase
      .from('flash_sales')
      .select(`
        *,
        products(name, price, image)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (queryError) {
      console.log('❌ Query error:', queryError.message);
    } else {
      console.log(`✅ Found ${flashSales.length} flash sales:`);
      flashSales.forEach((sale, i) => {
        console.log(`   ${i+1}. ${sale.products?.name} - ${sale.discount_percentage}% off`);
      });
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testFlashSalesCreation();
