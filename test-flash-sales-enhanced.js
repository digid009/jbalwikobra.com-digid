require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEnhancedFlashSales() {
  console.log('=== TESTING ENHANCED FLASH SALES WITH DUAL DISCOUNT SYSTEM ===');
  
  try {
    // Step 1: Check if discount_percentage column exists
    console.log('1. Checking table structure...');
    
    // Try to get any flash sale to check structure
    const { data: sampleFlashSale, error: sampleError } = await supabase
      .from('flash_sales')
      .select('*')
      .limit(1);
    
    let hasDiscountPercentage = false;
    if (sampleFlashSale && sampleFlashSale.length > 0) {
      const columns = Object.keys(sampleFlashSale[0]);
      console.log('📋 Current flash_sales columns:', columns.join(', '));
      hasDiscountPercentage = columns.includes('discount_percentage');
    } else {
      console.log('📋 No existing flash sales found, will test creation...');
    }
    
    console.log(`✅ discount_percentage column exists: ${hasDiscountPercentage}`);
    
    // Step 2: Get a test product
    console.log('\n2. Getting test product...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, is_active')
      .eq('is_active', true)
      .limit(1);
    
    if (productError || !products.length) {
      console.error('❌ No active products found:', productError);
      console.log('💡 Create some active products first');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Test product: ${testProduct.name} - Rp ${testProduct.price.toLocaleString()}`);
    
    // Step 3: Test flash sale creation - Scenario 1: Using Percentage
    console.log('\n3. TEST SCENARIO 1: Creating flash sale with percentage discount...');
    const discountPercentage = 25; // 25% discount
    const salePrice = Math.round(testProduct.price * (1 - discountPercentage / 100));
    const discountAmount = testProduct.price - salePrice;
    
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 5); // Start in 5 minutes
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // End in 2 hours
    
    const flashSaleData1 = {
      product_id: testProduct.id,
      original_price: testProduct.price,
      sale_price: salePrice,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      stock: 10,
      is_active: true
    };
    
    // Add discount_percentage if column exists
    if (hasDiscountPercentage) {
      flashSaleData1.discount_percentage = discountPercentage;
    }
    
    console.log('📊 Flash sale data (percentage-based):', {
      product: testProduct.name,
      original_price: `Rp ${testProduct.price.toLocaleString()}`,
      discount_percentage: hasDiscountPercentage ? `${discountPercentage}%` : 'N/A (column missing)',
      sale_price: `Rp ${salePrice.toLocaleString()}`,
      savings: `Rp ${discountAmount.toLocaleString()}`
    });
    
    const { data: flashSale1, error: createError1 } = await supabase
      .from('flash_sales')
      .insert(flashSaleData1)
      .select('*')
      .single();
    
    if (createError1) {
      console.error('❌ Percentage-based flash sale creation failed:', createError1);
      
      if (createError1.message.includes('discount_percentage') || createError1.message.includes('column')) {
        console.log('\n💡 SOLUTION REQUIRED:');
        console.log('   Run add-discount-percentage-column.sql in Supabase SQL Editor');
        console.log('   This will add the missing discount_percentage column');
      }
    } else {
      console.log('✅ Percentage-based flash sale created successfully!', {
        id: flashSale1.id,
        discount_percentage: flashSale1.discount_percentage || 'Column not available'
      });
    }
    
    // Step 4: Test flash sale creation - Scenario 2: Using Fixed Amount
    console.log('\n4. TEST SCENARIO 2: Creating flash sale with fixed amount discount...');
    const fixedDiscountAmount = 50000; // Rp 50,000 off
    const fixedSalePrice = Math.max(testProduct.price - fixedDiscountAmount, 0);
    const calculatedPercentage = ((testProduct.price - fixedSalePrice) / testProduct.price) * 100;
    
    const flashSaleData2 = {
      product_id: testProduct.id,
      original_price: testProduct.price,
      sale_price: fixedSalePrice,
      start_time: new Date(startTime.getTime() + 10 * 60 * 1000).toISOString(), // 10 minutes later
      end_time: new Date(startTime.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
      stock: 5,
      is_active: true
    };
    
    if (hasDiscountPercentage) {
      flashSaleData2.discount_percentage = Math.round(calculatedPercentage * 100) / 100;
    }
    
    console.log('📊 Flash sale data (fixed amount-based):', {
      product: testProduct.name,
      original_price: `Rp ${testProduct.price.toLocaleString()}`,
      fixed_discount: `Rp ${fixedDiscountAmount.toLocaleString()}`,
      calculated_percentage: hasDiscountPercentage ? `${calculatedPercentage.toFixed(2)}%` : 'N/A (column missing)',
      final_sale_price: `Rp ${fixedSalePrice.toLocaleString()}`
    });
    
    const { data: flashSale2, error: createError2 } = await supabase
      .from('flash_sales')
      .insert(flashSaleData2)
      .select('*')
      .single();
    
    if (createError2) {
      console.error('❌ Fixed amount flash sale creation failed:', createError2);
    } else {
      console.log('✅ Fixed amount flash sale created successfully!', {
        id: flashSale2.id,
        calculated_percentage: flashSale2.discount_percentage || 'Column not available'
      });
    }
    
    // Step 5: Test retrieval with product data
    if (flashSale1 || flashSale2) {
      console.log('\n5. Testing flash sale retrieval with product data...');
      
      const testId = flashSale1 ? flashSale1.id : flashSale2.id;
      const { data: retrieved, error: retrieveError } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products:product_id (
            name,
            price,
            image
          )
        `)
        .eq('id', testId)
        .single();
      
      if (retrieveError) {
        console.error('❌ Flash sale retrieval failed:', retrieveError);
      } else {
        console.log('✅ Flash sale retrieved with product data:', {
          product_name: retrieved.products?.name,
          discount: hasDiscountPercentage ? `${retrieved.discount_percentage}%` : 'N/A',
          final_price: `Rp ${retrieved.sale_price.toLocaleString()}`,
          stock: retrieved.stock
        });
      }
    }
    
    // Step 6: Clean up test data
    console.log('\n6. Cleaning up test data...');
    let cleanedUp = 0;
    
    if (flashSale1) {
      const { error: deleteError1 } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', flashSale1.id);
      
      if (!deleteError1) cleanedUp++;
    }
    
    if (flashSale2) {
      const { error: deleteError2 } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', flashSale2.id);
      
      if (!deleteError2) cleanedUp++;
    }
    
    console.log(`✅ Cleaned up ${cleanedUp} test flash sales`);
    
    // Final Summary
    console.log('\n🎉 ENHANCED FLASH SALES TEST COMPLETED!');
    console.log('\n📋 RESULTS SUMMARY:');
    console.log(`   ✅ Product selection: ${testProduct.name}`);
    console.log(`   ✅ Percentage-based creation: ${flashSale1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ✅ Fixed amount-based creation: ${flashSale2 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ✅ Database column support: ${hasDiscountPercentage ? 'READY' : 'NEEDS UPDATE'}`);
    
    console.log('\n📋 NEXT STEPS:');
    if (!hasDiscountPercentage) {
      console.log('   1. 🔥 URGENT: Run add-discount-percentage-column.sql in Supabase');
      console.log('   2. Test the enhanced admin form at http://localhost:3001/admin');
    } else {
      console.log('   1. ✅ Database is ready!');
      console.log('   2. Test the enhanced admin form at http://localhost:3001/admin');
      console.log('   3. Try both percentage and fixed amount discounts');
    }
    
    console.log('\n🚀 ADMIN FORM FEATURES TO TEST:');
    console.log('   • Switch between "Percentage" and "Fixed Amount" discount types');
    console.log('   • Watch automatic calculation of the other value');
    console.log('   • Real-time price preview updates');
    console.log('   • Form validation for both discount types');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the enhanced test
testEnhancedFlashSales().then(() => {
  console.log('\n🏁 Test completed. Check results above.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});
