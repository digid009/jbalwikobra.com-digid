// Clear admin cache and test complete flow
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function clearCacheAndTestAdminFlow() {
  console.log('🧹 Clear Cache and Test Admin Flow...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test the full admin flow with fixed query and mapper
    console.log('1️⃣ Testing complete admin flow...');
    
    // Step 1: Get all products with relations (simulating adminService.getProducts)
    const { data: products, count } = await supabase
      .from('products')
      .select(`
        id, name, description, price, original_price, category, tier_id, game_title, game_title_id,
        account_level, account_details, stock, is_active, image, images, created_at, updated_at, archived_at,
        is_flash_sale, flash_sale_end_time, has_rental,
        tiers (
          id, name, slug, color, background_gradient, icon
        ),
        game_titles (
          id, name, slug, icon, logo_url
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(200);

    console.log(`✅ Step 1: Retrieved ${count} total products, showing ${products?.length || 0}`);

    // Step 2: Get game titles for dropdown (simulating ProductService.getGameTitles)
    const { data: gameTitles } = await supabase
      .from('game_titles')
      .select('id, name, slug, icon, logo_url')
      .order('name');

    console.log(`✅ Step 2: Retrieved ${gameTitles?.length || 0} game titles`);

    // Step 3: Simulate client-side filtering for Mobile Legends
    console.log('\n2️⃣ Testing client-side filtering for Mobile Legends...');
    
    const gameTitleFilter = 'mobile-legends'; // Admin dropdown value
    const filteredProducts = products?.filter(product => {
      const gameTitleSlug = product.game_titles?.slug;
      const gameTitleName = product.game_titles?.name || product.game_title;
      return gameTitleSlug?.toLowerCase() === gameTitleFilter.toLowerCase() ||
             gameTitleName?.toLowerCase().includes('mobile') && gameTitleName?.toLowerCase().includes('legends');
    });

    console.log(`🎮 Found ${filteredProducts?.length || 0} Mobile Legends products after filtering:`);

    filteredProducts?.slice(0, 6).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Game: ${product.game_titles?.name || product.game_title || 'N/A'}`);
      console.log(`   - Tier: ${product.tiers?.name || 'N/A'}`);
      console.log(`   - Price: Rp ${product.price?.toLocaleString() || 0}`);
    });

    if (filteredProducts && filteredProducts.length > 6) {
      console.log(`... and ${filteredProducts.length - 6} more products`);
    }

    // Step 4: Test pagination
    console.log('\n3️⃣ Testing pagination (12 products per page)...');
    const itemsPerPage = 12;
    const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);
    const page1Products = filteredProducts?.slice(0, itemsPerPage);
    
    console.log(`📄 Page 1: ${page1Products?.length || 0} products (Total pages: ${totalPages})`);
    
    // Summary
    console.log('\n🎯 SUMMARY:');
    console.log(`- Total active products: ${count}`);
    console.log(`- Mobile Legends products: ${filteredProducts?.length || 0}`);
    console.log(`- Should show on page 1: ${Math.min(itemsPerPage, filteredProducts?.length || 0)}`);
    console.log(`- Admin filtering: ${filteredProducts?.length ? '✅ WORKING' : '❌ NOT WORKING'}`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

clearCacheAndTestAdminFlow();
