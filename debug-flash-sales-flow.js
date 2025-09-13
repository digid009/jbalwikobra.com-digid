#!/usr/bin/env node

/**
 * Debug Flash Sales Data Fetching
 * This script tests the exact same data flow as the FlashSalesPage
 */

const path = require('path');
const fs = require('fs');

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

async function debugFlashSalesFlow() {
  console.log('\n🔍 DEBUGGING FLASH SALES DATA FLOW');
  console.log('=====================================');

  try {
    const { url, key } = getSupabaseCredentials();
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key);

    // Simulate ProductService.getFlashSales() exactly
    console.log('\n📊 Step 1: Fetching flash sales from database...');
    
    // First try the relational join
    const { data: joinData, error: joinError } = await supabase
      .from('flash_sales')
      .select(`
        *,
        products (*)
      `)
      .eq('is_active', true)
      .gte('end_time', new Date().toISOString());

    console.log(`Relational join result: ${joinData?.length || 0} records`);
    if (joinError) {
      console.log('Relational join error:', joinError.message);
    }

    let flashSalesData = [];

    if (!joinError && joinData && joinData.length > 0) {
      console.log('✅ Using relational join data');
      flashSalesData = joinData.map((sale) => {
        const product = sale.products || {};
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
            isFlashSale: true,
            flashSaleEndTime: sale.end_time,
            price: sale.sale_price,
            originalPrice: sale.original_price
          }
        };
      });
    } else {
      console.log('⚠️ Fallback to separate queries');
      // Fallback to separate queries
      const { data: salesData, error: salesError } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString());

      if (salesError) {
        console.log('❌ Sales data error:', salesError.message);
        return;
      }

      if (salesData && salesData.length > 0) {
        const productIds = salesData.map(s => s.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.log('❌ Products data error:', productsError.message);
          return;
        }

        flashSalesData = salesData.map(sale => {
          const product = productsData?.find(p => p.id === sale.product_id) || {};
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
              isFlashSale: true,
              flashSaleEndTime: sale.end_time,
              price: sale.sale_price,
              originalPrice: sale.original_price
            }
          };
        });
      }
    }

    console.log(`\n📦 Step 2: Flash sales data processed: ${flashSalesData.length} items`);

    if (flashSalesData.length > 0) {
      console.log('\n🎯 Step 3: Sample flash sale data analysis:');
      
      flashSalesData.slice(0, 3).forEach((sale, index) => {
        const discountPct = sale.originalPrice > 0 
          ? Math.round(((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100)
          : 0;
        
        const endTime = new Date(sale.endTime);
        const timeLeft = endTime - new Date();
        const hoursLeft = Math.round(timeLeft / (1000 * 60 * 60));

        console.log(`\n${index + 1}. ${sale.product.name || 'Unknown Product'}`);
        console.log(`   Product ID: ${sale.productId}`);
        console.log(`   Sale Price: Rp ${sale.salePrice?.toLocaleString()}`);
        console.log(`   Original Price: Rp ${sale.originalPrice?.toLocaleString()}`);
        console.log(`   Discount: ${discountPct}%`);
        console.log(`   Time Left: ${hoursLeft} hours`);
        console.log(`   Stock: ${sale.stock}`);
        console.log(`   End Time: ${sale.endTime}`);
        console.log(`   Flash Sale ID: ${sale.id}`);
      });

      // Simulate FlashSalesPage mapping
      console.log('\n🔄 Step 4: Simulating FlashSalesPage data mapping...');
      const mappedProducts = flashSalesData.map(sale => ({
        ...sale.product,
        id: sale.product.id,
        isFlashSale: true,
        price: sale.salePrice,
        originalPrice: sale.originalPrice,
        flashSaleEndTime: sale.endTime,
        stock: sale.stock || sale.product.stock,
        flashSaleId: sale.id,
        flashSaleStartTime: sale.startTime
      }));

      console.log(`✅ Mapped products: ${mappedProducts.length}`);
      console.log('\n📊 Final data that FlashSalesPage should receive:');
      
      mappedProducts.slice(0, 2).forEach((product, index) => {
        const discountPct = product.originalPrice > 0 
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0;

        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Price: Rp ${product.price?.toLocaleString()}`);
        console.log(`   Original: Rp ${product.originalPrice?.toLocaleString()}`);
        console.log(`   Discount: ${discountPct}%`);
        console.log(`   Is Flash Sale: ${product.isFlashSale}`);
        console.log(`   End Time: ${product.flashSaleEndTime}`);
        console.log(`   Stock: ${product.stock}`);
      });

    } else {
      console.log('❌ No flash sales data found');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }

  console.log('\n🏁 Debug Complete');
}

debugFlashSalesFlow();
