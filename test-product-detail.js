// Test ProductDetailPage access issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductDetailAccess() {
  console.log('🔍 Testing product detail access issue...\n');
  
  try {
    // 1. Get list of products first
    console.log('📋 Getting available products...');
    const { data: products, error: listError } = await supabase
      .from('products')
      .select('id, name, is_active, archived_at')
      .eq('is_active', true)
      .is('archived_at', null)
      .limit(5);

    if (listError) {
      console.error('❌ Error fetching products list:', listError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('❌ No active products found in database');
      return;
    }

    console.log(`✅ Found ${products.length} active products:`);
    products.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.id} - ${p.name}`);
    });
    console.log('');

    // 2. Test getProductById with first product
    const testProductId = products[0].id;
    console.log(`🧪 Testing getProductById with ID: ${testProductId}`);
    
    const { data: productDetail, error: detailError } = await supabase
      .from('products')
      .select(`
        *,
        rental_options (*),
        tiers (*),
        game_titles (*),
        categories!fk_products_category (*)
      `)
      .eq('id', testProductId)
      .maybeSingle();

    if (detailError) {
      console.error('❌ Error fetching product detail:', detailError);
      console.error('❌ Error code:', detailError.code);
      console.error('❌ Error message:', detailError.message);
      return;
    }

    if (!productDetail) {
      console.log('❌ Product detail not found for ID:', testProductId);
      return;
    }

    console.log('✅ Product detail fetched successfully!');
    console.log('📋 Product details:');
    console.log(`   - ID: ${productDetail.id}`);
    console.log(`   - Name: ${productDetail.name}`);
    console.log(`   - Price: Rp ${productDetail.price?.toLocaleString()}`);
    console.log(`   - Active: ${productDetail.is_active}`);
    console.log(`   - Images: ${productDetail.images?.length || 0} photos`);
    console.log(`   - Category: ${productDetail.categories?.name || 'N/A'}`);
    console.log(`   - Game Title: ${productDetail.game_titles?.name || 'N/A'}`);
    console.log(`   - Tier: ${productDetail.tiers?.name || 'N/A'}`);
    console.log('');

    // 3. Test URL yang akan digunakan
    console.log('🌐 Product detail URLs that should work:');
    console.log(`   - http://localhost:3000/products/${testProductId}`);
    products.forEach((p, idx) => {
      if (idx < 3) { // Show first 3 only
        console.log(`   - http://localhost:3000/products/${p.id}`);
      }
    });
    console.log('');

    // 4. Test dengan ID yang tidak ada
    console.log('🧪 Testing with non-existent ID...');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { data: notFound, error: notFoundError } = await supabase
      .from('products')
      .select('*')
      .eq('id', fakeId)
      .maybeSingle();

    if (notFoundError) {
      console.log('❌ Error with fake ID (expected):', notFoundError.message);
    } else if (!notFound) {
      console.log('✅ Correctly returned null for non-existent ID');
    } else {
      console.log('❓ Unexpected: Found product with fake ID');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testProductDetailAccess();
