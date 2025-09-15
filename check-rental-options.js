// Debug script to check rental options data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRentalOptions() {
  try {
    console.log('🔍 Checking Rental Options Data...\n');

    // 1. Check if rental_options table exists and has data
    const { data: rentalOptions, error: rentalError } = await supabase
      .from('rental_options')
      .select('*')
      .limit(10);
    
    if (rentalError) {
      console.error('❌ Error fetching rental options:', rentalError);
      return;
    }
    
    console.log(`📊 Total rental options found: ${rentalOptions?.length || 0}`);
    
    if (rentalOptions && rentalOptions.length > 0) {
      console.log('\n📋 Sample rental options:');
      rentalOptions.forEach((option, index) => {
        console.log(`${index + 1}. Product ID: ${option.product_id}`);
        console.log(`   Duration: ${option.duration}`);
        console.log(`   Price: Rp ${option.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Description: ${option.description || 'N/A'}`);
        console.log('   ---');
      });
    }

    // 2. Check products with has_rental flag
    const { data: productsWithRental, error: productsError } = await supabase
      .from('products')
      .select('id, name, has_rental')
      .eq('has_rental', true)
      .eq('is_active', true)
      .limit(10);
    
    if (productsError) {
      console.error('❌ Error fetching products with rental:', productsError);
      return;
    }
    
    console.log(`\n📦 Products with has_rental=true: ${productsWithRental?.length || 0}`);
    
    if (productsWithRental && productsWithRental.length > 0) {
      console.log('\n📋 Products with rental enabled:');
      productsWithRental.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }

    // 3. Test a specific product with full rental data
    console.log('\n🔧 Testing product detail with rental options...');
    
    const { data: testProduct, error: testError } = await supabase
      .from('products')
      .select(`
        id, name, has_rental,
        rental_options (*)
      `)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (testError) {
      console.error('❌ Error fetching test product:', testError);
      return;
    }
    
    if (testProduct) {
      console.log(`\n🎯 Test product: ${testProduct.name}`);
      console.log(`   ID: ${testProduct.id}`);
      console.log(`   Has Rental: ${testProduct.has_rental}`);
      console.log(`   Rental Options: ${testProduct.rental_options?.length || 0}`);
      
      if (testProduct.rental_options && testProduct.rental_options.length > 0) {
        console.log(`   Rental Options Details:`);
        testProduct.rental_options.forEach((option, index) => {
          console.log(`     ${index + 1}. ${option.duration} - Rp ${option.price?.toLocaleString()}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkRentalOptions();
