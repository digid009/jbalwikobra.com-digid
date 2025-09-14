// Test admin pagination and filtering
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminPagination() {
  try {
    console.log('🔧 Testing Admin Pagination and Filtering...\n');
    
    // Test default admin query (page 1, statusFilter='all')
    console.log('1️⃣ Testing Default Admin Query (Page 1, Status=All)');
    console.log('='.repeat(60));
    
    const currentPage = 1;
    const itemsPerPage = 20;
    const statusFilter = 'all';
    const selectedGame = '';
    const selectedTier = '';
    const debouncedSearch = '';
    
    let query = supabase
      .from('products')
      .select(`
        id, name, description, price, original_price,
        is_active, archived_at, created_at, images, game_title_id, tier_id,
        tiers (id, name, slug, color, background_gradient),
        game_titles (id, name, slug, icon)
      `, { count: 'exact' });

    // Apply filters at DATABASE level (like AdminProducts.tsx)
    if (statusFilter === 'active') {
      query = query.eq('is_active', true).is('archived_at', null);
    } else if (statusFilter === 'archived') {
      query = query.or('is_active.eq.false,archived_at.not.is.null');
    }
    // Note: 'all' means no filter applied

    if (debouncedSearch.trim()) {
      query = query.or(`name.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%`);
    }

    if (selectedGame !== 'all' && selectedGame) {
      query = query.eq('game_title_id', selectedGame);
    }

    if (selectedTier !== 'all' && selectedTier) {
      query = query.eq('tier_id', selectedTier);
    }

    // Database-level pagination
    const offset = (currentPage - 1) * itemsPerPage;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    const { data: productData, error: productError, count } = await query;

    if (productError) {
      console.error('❌ Query error:', productError);
      return;
    }

    console.log(`📊 Total products found: ${count}`);
    console.log(`📦 Products on page 1: ${productData.length}`);
    console.log('');
    
    if (productData.length > 0) {
      console.log('📋 First 5 products on page 1:');
      productData.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Active: ${product.is_active}`);
        console.log(`   Archived: ${product.archived_at ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
        console.log('   ---');
      });
    }
    
    // Test with active filter
    console.log('\n2️⃣ Testing Active Products Filter');
    console.log('='.repeat(60));
    
    let activeQuery = supabase
      .from('products')
      .select('id, name, is_active, created_at', { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .range(0, 19);
    
    const { data: activeProducts, error: activeError, count: activeCount } = await activeQuery;
    
    if (activeError) {
      console.error('❌ Active query error:', activeError);
      return;
    }
    
    console.log(`📊 Active products found: ${activeCount}`);
    console.log(`📦 First 20 active products: ${activeProducts.length}`);
    
    if (activeProducts.length > 0) {
      console.log('\n📋 First 3 active products:');
      activeProducts.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (Active: ${product.is_active})`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
      });
    }
    
    // Check if the new "test" product is in the results
    console.log('\n3️⃣ Checking if "test" product appears in queries');
    console.log('='.repeat(60));
    
    const testProduct = productData.find(p => p.name === 'test');
    const testActiveProduct = activeProducts.find(p => p.name === 'test');
    
    if (testProduct) {
      console.log('✅ "test" product found in main query (all products)');
      console.log(`   Position: ${productData.findIndex(p => p.name === 'test') + 1} of ${productData.length}`);
    } else {
      console.log('❌ "test" product NOT found in main query');
    }
    
    if (testActiveProduct) {
      console.log('✅ "test" product found in active products query');
      console.log(`   Position: ${activeProducts.findIndex(p => p.name === 'test') + 1} of ${activeProducts.length}`);
    } else {
      console.log('❌ "test" product NOT found in active products query');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAdminPagination();
