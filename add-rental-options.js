// Add rental options to products for testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRentalOptions() {
  try {
    console.log('🔧 Adding rental options to test products...\n');

    // Product that already has has_rental=true but no rental options
    const productWithFlag = 'e80de94b-db2b-4b7b-9949-77bbf291cd02'; // MOBILE LEGENDS A17
    
    // Add rental options to this product
    const rentalOptions = [
      {
        product_id: productWithFlag,
        duration: '6 HOURS',
        price: 150000,
        description: 'Rental 6 jam untuk bermain ranked'
      },
      {
        product_id: productWithFlag,
        duration: '1 DAY',
        price: 250000,
        description: 'Rental 1 hari full access'
      },
      {
        product_id: productWithFlag,
        duration: '3 DAYS',
        price: 600000,
        description: 'Rental 3 hari untuk push rank'
      }
    ];
    
    const { data: insertedOptions, error: insertError } = await supabase
      .from('rental_options')
      .insert(rentalOptions)
      .select('*');
    
    if (insertError) {
      console.error('❌ Error inserting rental options:', insertError);
      return;
    }
    
    console.log('✅ Added rental options to MOBILE LEGENDS A17:');
    insertedOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.duration} - Rp ${option.price.toLocaleString()}`);
      console.log(`      ${option.description}`);
    });

    // Add rental options to a Free Fire product as well
    const { data: freeFireProducts, error: ffError } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .ilike('name', '%FREE FIRE%')
      .limit(1);
    
    if (ffError || !freeFireProducts || freeFireProducts.length === 0) {
      console.log('⚠️  No Free Fire products found for rental options');
      return;
    }
    
    const ffProduct = freeFireProducts[0];
    console.log(`\n🔧 Adding rental options to ${ffProduct.name}...`);
    
    const ffRentalOptions = [
      {
        product_id: ffProduct.id,
        duration: '12 HOURS',
        price: 100000,
        description: 'Rental 12 jam untuk grinding'
      },
      {
        product_id: ffProduct.id,
        duration: '2 DAYS',
        price: 350000,
        description: 'Rental 2 hari untuk event'
      }
    ];
    
    const { data: ffInserted, error: ffInsertError } = await supabase
      .from('rental_options')
      .insert(ffRentalOptions)
      .select('*');
    
    if (ffInsertError) {
      console.error('❌ Error inserting Free Fire rental options:', ffInsertError);
      return;
    }
    
    // Update the Free Fire product to have has_rental=true
    const { error: updateError } = await supabase
      .from('products')
      .update({ has_rental: true })
      .eq('id', ffProduct.id);
    
    if (updateError) {
      console.error('❌ Error updating Free Fire product:', updateError);
    } else {
      console.log(`✅ Added rental options to ${ffProduct.name}:`);
      ffInserted.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.duration} - Rp ${option.price.toLocaleString()}`);
        console.log(`      ${option.description}`);
      });
      console.log(`✅ Updated ${ffProduct.name} has_rental flag to true`);
    }

    console.log('\n🎯 Summary:');
    console.log('Now you have products with rental options that should show:');
    console.log('1. MOBILE LEGENDS A7 (existing)');
    console.log('2. MOBILE LEGENDS A17 (just added)');
    console.log(`3. ${ffProduct.name} (just added)`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

addRentalOptions();
