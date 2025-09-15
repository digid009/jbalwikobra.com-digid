// Final verification of rental options fix
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRentalFix() {
  try {
    console.log('🔍 Final Verification of Rental Options Fix\n');
    console.log('===========================================\n');

    // Get all products with rental options
    const { data: productsWithRentals, error } = await supabase
      .from('products')
      .select(`
        id, name, has_rental, is_active,
        rental_options (
          id, duration, price, description
        )
      `)
      .eq('has_rental', true)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📊 Total Active Products with Rental Options: ${productsWithRentals?.length || 0}\n`);

    if (productsWithRentals && productsWithRentals.length > 0) {
      productsWithRentals.forEach((product, index) => {
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

    console.log('✅ RENTAL OPTIONS FIX SUMMARY');
    console.log('==============================');
    console.log('');
    console.log('🔧 Issues Fixed:');
    console.log('  1. Fixed data inconsistency where products had rental_options but has_rental=false');
    console.log('  2. Removed overly restrictive condition in ProductRentalOptions component');
    console.log('  3. Added debug logging to help identify future issues');
    console.log('  4. Added test rental data for multiple products');
    console.log('');
    console.log('📋 Test Products Available:');
    if (productsWithRentals && productsWithRentals.length > 0) {
      productsWithRentals.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.rental_options?.length || 0} rental options`);
      });
    }
    console.log('');
    console.log('🎯 How to Test:');
    console.log('  1. Go to http://localhost:3001');
    console.log('  2. Navigate to Products page');
    console.log('  3. Look for products with "Tersedia Rental" green badge');
    console.log('  4. Click on any product with rental options');
    console.log('  5. Scroll down to see "Opsi Rental" section');
    console.log('  6. Rental options should now be visible!');
    console.log('');
    console.log('🔍 Debug Info:');
    console.log('  - Check browser console for "ProductRentalOptions Debug:" logs');
    console.log('  - Rental options will show regardless of navigation source now');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

verifyRentalFix();
