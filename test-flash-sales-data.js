#!/usr/bin/env node

/**
 * Test Flash Sales Data
 * Verifies that flash sales data is properly loaded from the database
 */

const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

function getSupabaseCredentials() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const urlMatch = envContent.match(/REACT_APP_SUPABASE_URL=([^\s]+)/);
      const keyMatch = envContent.match(/REACT_APP_SUPABASE_ANON_KEY=([^\s]+)/);
      
      return {
        url: urlMatch && urlMatch[1] ? urlMatch[1].trim() : null,
        key: keyMatch && keyMatch[1] ? keyMatch[1].trim() : null
      };
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
  
  return { url: null, key: null };
}

async function testFlashSalesData() {
  console.log('\n🔥 TESTING FLASH SALES DATA CONNECTION');
  console.log('=========================================');

  try {
    // Get Supabase credentials
    const { url, key } = getSupabaseCredentials();
    
    if (!url || !key) {
      console.log('❌ Supabase credentials not found in .env');
      console.log('   Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
      return;
    }

    console.log('✅ Supabase credentials found');
    console.log(`📍 URL: ${url.substring(0, 30)}...`);
    console.log(`🔑 Key: ${key.substring(0, 20)}...`);

    // Import and initialize Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key);

    console.log('\n📊 Testing Flash Sales Table...');

    // Test flash_sales table
    const { data: flashSales, error: flashError, count: flashCount } = await supabase
      .from('flash_sales')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString())
      .limit(10);

    if (flashError) {
      console.log(`❌ Flash Sales table error: ${flashError.message}`);
      
      if (flashError.message.includes('does not exist')) {
        console.log('\n📝 Creating Flash Sales test data...');
        
        // Test if products table exists first
        const { data: products, error: prodError } = await supabase
          .from('products')
          .select('id, name, price')
          .eq('is_active', true)
          .limit(5);

        if (prodError) {
          console.log(`❌ Products table error: ${prodError.message}`);
        } else if (products && products.length > 0) {
          console.log(`✅ Found ${products.length} products for flash sales`);
          products.forEach(p => {
            console.log(`  - ${p.name}: $${p.price}`);
          });
        } else {
          console.log('⚠️ No products found in database');
        }
      }
    } else {
      console.log(`✅ Flash Sales table accessible`);
      console.log(`📊 Total active flash sales: ${flashCount}`);
      
      if (flashSales && flashSales.length > 0) {
        console.log('\n🎯 Active Flash Sales:');
        flashSales.forEach(sale => {
          const endDate = new Date(sale.end_time);
          const timeLeft = endDate - new Date();
          const hoursLeft = Math.round(timeLeft / (1000 * 60 * 60));
          console.log(`  - ID: ${sale.id}, Product: ${sale.product_id}, Sale Price: $${sale.sale_price}, Ends in: ${hoursLeft}h`);
        });
      } else {
        console.log('⚠️ No active flash sales found');
      }
    }

    // Test products with flash sale flags
    console.log('\n📦 Testing Products with Flash Sale flags...');
    const { data: flashProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, original_price, is_flash_sale, flash_sale_end_time')
      .eq('is_active', true)
      .eq('is_flash_sale', true)
      .limit(10);

    if (prodError) {
      console.log(`❌ Products with flash sale flags error: ${prodError.message}`);
    } else {
      console.log(`✅ Products with flash sale flags accessible`);
      
      if (flashProducts && flashProducts.length > 0) {
        console.log(`📊 Found ${flashProducts.length} products marked as flash sales:`);
        flashProducts.forEach(p => {
          const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
          console.log(`  - ${p.name}: $${p.price} (${discount}% off) - Ends: ${p.flash_sale_end_time?.split('T')[0] || 'No end time'}`);
        });
      } else {
        console.log('⚠️ No products marked with is_flash_sale=true found');
      }
    }

    console.log('\n📱 Testing Frontend Flash Sales Service...');
    
    // Simulate the ProductService.getFlashSales() call
    let hasFlashSalesTable = !flashError;
    let flashSalesData = [];

    if (hasFlashSalesTable && flashSales && flashSales.length > 0) {
      // Fetch products for flash sales
      const productIds = flashSales.map(s => s.product_id);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (!productsError && productsData) {
        flashSalesData = flashSales.map(sale => {
          const product = productsData.find(p => p.id === sale.product_id);
          return {
            id: sale.id,
            productId: sale.product_id,
            salePrice: sale.sale_price,
            originalPrice: sale.original_price,
            startTime: sale.start_time,
            endTime: sale.end_time,
            stock: sale.stock,
            isActive: sale.is_active,
            createdAt: sale.created_at,
            product: {
              ...product,
              price: sale.sale_price,
              originalPrice: sale.original_price,
              isFlashSale: true,
              flashSaleEndTime: sale.end_time
            }
          };
        });
      }
    } else if (flashProducts && flashProducts.length > 0) {
      // Fallback to products marked with is_flash_sale
      flashSalesData = flashProducts.map(product => ({
        id: `flash-${product.id}`,
        productId: product.id,
        salePrice: product.price,
        originalPrice: product.original_price || product.price,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: product.flash_sale_end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        stock: product.stock || 0,
        isActive: true,
        createdAt: product.created_at,
        product: {
          ...product,
          isFlashSale: true
        }
      }));
    }

    if (flashSalesData.length > 0) {
      console.log(`✅ Flash Sales Service would return ${flashSalesData.length} items`);
      console.log(`📱 Frontend will show real data instead of mock data`);
    } else {
      console.log(`⚠️ Flash Sales Service would return empty array`);
      console.log(`📱 Frontend will show "no flash sales" message`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }

  console.log('\n🏁 Flash Sales Data Test Complete');
  console.log(`🕐 Completed: ${new Date().toLocaleString()}`);
}

// Run the test
testFlashSalesData();
