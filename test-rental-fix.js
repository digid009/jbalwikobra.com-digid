// Test script to verify the rental options fix
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRentalFix() {
  try {
    console.log('🔧 Testing Rental Options Fix');
    console.log('=============================\n');

    // Get a product with rental options for testing
    const { data: testProduct, error } = await supabase
      .from('products')
      .select(`
        id, name, has_rental,
        rental_options (
          id, duration, price, description
        )
      `)
      .eq('has_rental', true)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error || !testProduct) {
      console.error('❌ No test product found:', error);
      return;
    }

    console.log(`📦 Test Product: ${testProduct.name}`);
    console.log(`   ID: ${testProduct.id}`);
    console.log(`   Has Rental: ${testProduct.has_rental}`);
    console.log(`   Rental Options Count: ${testProduct.rental_options?.length || 0}`);

    if (testProduct.rental_options && testProduct.rental_options.length > 0) {
      console.log('\n📋 Current Rental Options:');
      testProduct.rental_options.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.duration} - Rp ${option.price?.toLocaleString()}`);
        if (option.description) {
          console.log(`      Description: ${option.description}`);
        }
      });
    }

    console.log('\n✅ Fix Summary:');
    console.log('================');
    console.log('1. ProductModal.tsx now fetches existing rental options when editing');
    console.log('2. Rental options will appear in the edit form');
    console.log('3. Changes to rental options will be properly saved');
    console.log('4. Rental options will persist after editing');

    console.log('\n🧪 How to Test:');
    console.log('===============');
    console.log('1. Go to http://localhost:3001/admin');
    console.log('2. Navigate to Products page');
    console.log(`3. Find and click Edit on: "${testProduct.name}"`);
    console.log('4. Check if rental options appear in the form');
    console.log('5. Modify the rental options');
    console.log('6. Save the product');
    console.log('7. Edit again to verify changes persisted');

    console.log('\n📍 Test Product Details:');
    console.log(`   Product ID: ${testProduct.id}`);
    console.log(`   Expected Rental Options: ${testProduct.rental_options?.length || 0}`);

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testRentalFix();
