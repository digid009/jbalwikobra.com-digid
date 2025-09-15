// Test the fixed rental product
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRentalProduct() {
  try {
    console.log('🔍 Testing the fixed rental product...\n');

    const productId = 'ecbf53d6-7fb2-4acf-87dd-1b80ca5317e6';
    
    // Test the same query that ProductService.getProductById uses
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        rental_options (*),
        tiers (*),
        game_titles (*),
        categories!fk_products_category (*)
      `)
      .eq('id', productId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error fetching product:', error);
      return;
    }
    
    if (!data) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log(`📦 Product: ${data.name}`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Has Rental: ${data.has_rental}`);
    console.log(`   Is Active: ${data.is_active}`);
    
    const rentalOptions = data.rental_options || [];
    console.log(`   Rental Options Count: ${rentalOptions.length}`);
    
    if (rentalOptions.length > 0) {
      console.log(`   Rental Options:`);
      rentalOptions.forEach((option, index) => {
        console.log(`     ${index + 1}. ID: ${option.id}`);
        console.log(`        Duration: ${option.duration}`);
        console.log(`        Price: Rp ${option.price?.toLocaleString()}`);
        console.log(`        Description: ${option.description || 'N/A'}`);
      });
    }
    
    // Test the final transformed data as ProductService would return it
    const result = {
      ...data,
      rentalOptions,
      hasRental: data.has_rental ?? (rentalOptions.length > 0),
      tierData: data.tiers,
      gameTitleData: data.game_titles,
      categoryData: data.categories ? {
        id: data.categories.id,
        name: data.categories.name,
        slug: data.categories.slug,
        description: data.categories.description,
        icon: data.categories.icon,
        color: data.categories.color,
        isActive: data.categories.is_active ?? data.categories.isActive,
        sortOrder: data.categories.sort_order ?? data.categories.sortOrder,
      } : undefined,
      categoryId: data.categories?.id || data.category_id || data.categoryId,
      isActive: data.is_active ?? data.isActive ?? true,
      archivedAt: data.archived_at ?? data.archivedAt ?? null,
    };
    
    console.log(`\n🎯 Final transformed data:`);
    console.log(`   Has Rental: ${result.hasRental}`);
    console.log(`   Rental Options: ${result.rentalOptions?.length || 0}`);
    console.log(`   Tier: ${result.tierData?.name || 'N/A'}`);
    console.log(`   Game: ${result.gameTitleData?.name || 'N/A'}`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testRentalProduct();
