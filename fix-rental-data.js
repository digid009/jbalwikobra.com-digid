// Check specific products with rental data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificRentalProduct() {
  try {
    console.log('🔍 Checking specific rental product...\n');

    // Check the product that has rental options
    const rentalProductId = 'ecbf53d6-7fb2-4acf-87dd-1b80ca5317e6';
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id, name, has_rental, is_active,
        rental_options (*)
      `)
      .eq('id', rentalProductId)
      .single();
    
    if (productError) {
      console.error('❌ Error fetching product:', productError);
      return;
    }
    
    if (product) {
      console.log(`📦 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Has Rental: ${product.has_rental}`);
      console.log(`   Is Active: ${product.is_active}`);
      console.log(`   Rental Options: ${product.rental_options?.length || 0}`);
      
      if (product.rental_options && product.rental_options.length > 0) {
        console.log(`   Rental Options Details:`);
        product.rental_options.forEach((option, index) => {
          console.log(`     ${index + 1}. ${option.duration} - Rp ${option.price?.toLocaleString()}`);
          console.log(`        Description: ${option.description || 'N/A'}`);
        });
      }
    }

    // Now check the other product with has_rental=true
    const otherProductId = 'e80de94b-db2b-4b7b-9949-77bbf291cd02';
    
    const { data: otherProduct, error: otherProductError } = await supabase
      .from('products')
      .select(`
        id, name, has_rental, is_active,
        rental_options (*)
      `)
      .eq('id', otherProductId)
      .single();
    
    if (otherProductError) {
      console.error('❌ Error fetching other product:', otherProductError);
      return;
    }
    
    if (otherProduct) {
      console.log(`\n📦 Other Product: ${otherProduct.name}`);
      console.log(`   ID: ${otherProduct.id}`);
      console.log(`   Has Rental: ${otherProduct.has_rental}`);
      console.log(`   Is Active: ${otherProduct.is_active}`);
      console.log(`   Rental Options: ${otherProduct.rental_options?.length || 0}`);
      
      if (otherProduct.rental_options && otherProduct.rental_options.length > 0) {
        console.log(`   Rental Options Details:`);
        otherProduct.rental_options.forEach((option, index) => {
          console.log(`     ${index + 1}. ${option.duration} - Rp ${option.price?.toLocaleString()}`);
          console.log(`        Description: ${option.description || 'N/A'}`);
        });
      }
    }

    // Update the product with rental options to have has_rental=true
    console.log(`\n🔧 Fixing rental data mismatch...`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ has_rental: true })
      .eq('id', rentalProductId)
      .select('id, name, has_rental');
    
    if (updateError) {
      console.error('❌ Error updating product:', updateError);
    } else {
      console.log('✅ Updated product with rental options to has_rental=true');
      console.log('Updated:', updateData);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkSpecificRentalProduct();
