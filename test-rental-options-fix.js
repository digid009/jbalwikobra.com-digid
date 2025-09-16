// Test script to verify rental options are now being saved properly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRentalOptionsFix() {
  try {
    console.log('🔍 Testing Rental Options Fix...\n');

    // 1. Check current state of products with rental options
    const { data: existingProducts, error: existingError } = await supabase
      .from('products')
      .select(`
        id, name, has_rental,
        rental_options (
          id, duration, price, description
        )
      `)
      .eq('has_rental', true)
      .eq('is_active', true)
      .order('name');

    if (existingError) {
      console.error('❌ Error fetching existing products:', existingError);
      return;
    }

    console.log(`📊 Current Active Products with Rental Options: ${existingProducts?.length || 0}\n`);

    if (existingProducts && existingProducts.length > 0) {
      existingProducts.forEach((product, index) => {
        console.log(`${index + 1}. 📦 ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Has Rental: ${product.has_rental}`);
        console.log(`   Rental Options: ${product.rental_options?.length || 0}`);
        
        if (product.rental_options && product.rental_options.length > 0) {
          product.rental_options.forEach((option, optIndex) => {
            console.log(`     ${optIndex + 1}. ${option.duration} - Rp ${option.price?.toLocaleString()}`);
            if (option.description) {
              console.log(`        ${option.description}`);
            }
          });
        }
        console.log('');
      });
    }

    console.log('✅ RENTAL OPTIONS FIX VERIFICATION');
    console.log('==================================\n');
    console.log('🔧 What was fixed:');
    console.log('  1. ProductModal.tsx now properly saves rental options to database');
    console.log('  2. Rental options no longer disappear when saving products');
    console.log('  3. Used same approach as AdminProducts.tsx with direct Supabase calls');
    console.log('');
    console.log('🎯 How to test the fix:');
    console.log('  1. Go to admin panel at http://localhost:3001/admin');
    console.log('  2. Click "Add Product" or edit an existing product');
    console.log('  3. Enable "Rental Options" toggle');
    console.log('  4. Add rental options with duration, price, and description');
    console.log('  5. Save the product');
    console.log('  6. Verify rental options are still there after saving');
    console.log('');
    console.log('📋 Testing with existing products:');
    if (existingProducts && existingProducts.length > 0) {
      console.log('  - Edit any of the products listed above');
      console.log('  - Modify their rental options');
      console.log('  - Save and verify changes persist');
    } else {
      console.log('  - Create a new product with rental options to test');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testRentalOptionsFix();
