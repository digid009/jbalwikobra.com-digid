// Test admin service with fixed mapper to include LEFT JOIN relations
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Simulate the fixed mapper
function dbRowToDomainProduct(row) {
  return {
    id: row.id,
    name: row.name || 'Unnamed Product',
    description: row.description || '',
    price: Number(row.price) || 0,
    original_price: row.original_price ?? null,
    category: (row.category || row.tier_id || row.game_title || 'general'),
    game_title: row.game_title || null,
    account_level: row.account_level || null,
    account_details: row.account_details || null,
    stock: Number(row.stock) || 0,
    is_active: row.is_active !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    image: row.image || null,
    images: row.images || [],
    tier: null,
    tier_id: row.tier_id || null,
    game_title_id: row.game_title_id || null,
    is_flash_sale: row.is_flash_sale || null,
    flash_sale_end_time: row.flash_sale_end_time || null,
    has_rental: row.has_rental || null,
    archived_at: row.archived_at || null,
    // Include LEFT JOIN relations for admin filtering
    tiers: row.tiers || null,
    game_titles: row.game_titles || null
  };
}

async function testAdminServiceWithFixedMapper() {
  console.log('🔧 Testing Admin Service with Fixed Mapper...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Simulate admin service query with LEFT JOIN (same as fixed adminService)
    console.log('1️⃣ Testing fixed admin service query...');
    const { data, error, count } = await supabase
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
      .limit(10);

    if (error) {
      console.error('❌ Query error:', error.message);
      return;
    }

    console.log(`✅ Query successful: Found ${count} total products`);
    console.log(`📦 Retrieved ${data?.length || 0} products (showing first 10)\n`);

    // Apply the fixed mapper
    const mappedProducts = (data || []).map(dbRowToDomainProduct);

    // Show first few products with their relations
    mappedProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - game_title: "${product.game_title}"`);
      console.log(`   - game_titles relation: ${product.game_titles ? `"${product.game_titles.name}" (slug: "${product.game_titles.slug}")` : 'null'}`);
      console.log(`   - tiers relation: ${product.tiers ? `"${product.tiers.name}" (slug: "${product.tiers.slug}")` : 'null'}`);
      console.log('');
    });

    // Test Mobile Legends filtering
    console.log('2️⃣ Testing Mobile Legends filtering with relations...');
    const mlProducts = mappedProducts.filter(product => {
      const gameTitleSlug = product.game_titles?.slug;
      const gameTitleName = product.game_titles?.name || product.game_title;
      return gameTitleSlug?.toLowerCase() === 'mobile-legends' ||
             gameTitleName?.toLowerCase() === 'mobile legends';
    });

    console.log(`🎮 Found ${mlProducts.length} Mobile Legends products after client-side filtering:`);
    mlProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Game: ${product.game_titles?.name || 'N/A'} (slug: ${product.game_titles?.slug || 'N/A'})`);
      console.log(`   - Tier: ${product.tiers?.name || 'N/A'} (slug: ${product.tiers?.slug || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminServiceWithFixedMapper();
