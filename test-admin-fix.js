// Test admin service with fixed LEFT JOIN query
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testAdminProductsFix() {
  console.log('🔧 Testing Admin Service with LEFT JOIN Fix...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Test old query (without LEFT JOIN) - should return fewer products
    console.log('1️⃣ Testing OLD admin query (simple select)...');
    const oldQuery = await supabase
      .from('products')
      .select('id, name, game_title, tier_id', { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null);

    if (oldQuery.error) {
      console.error('❌ Old query error:', oldQuery.error.message);
    } else {
      console.log(`✅ OLD query: Found ${oldQuery.count} products`);
    }

    // 2. Test new query (with LEFT JOIN) - should return all products
    console.log('\n2️⃣ Testing NEW admin query (with LEFT JOIN)...');
    const newQuery = await supabase
      .from('products')
      .select(`
        id, name, game_title, tier_id,
        tiers (
          id, name, slug
        ),
        game_titles (
          id, name, slug
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null);

    if (newQuery.error) {
      console.error('❌ New query error:', newQuery.error.message);
    } else {
      console.log(`✅ NEW query: Found ${newQuery.count} products`);
      
      // Show first few products
      console.log('\n📦 Sample products from new query:');
      newQuery.data?.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Game: ${product.game_titles?.name || 'No game'}`);
        console.log(`   - Tier: ${product.tiers?.name || 'No tier'}`);
      });
    }

    // 3. Test Mobile Legends specifically
    console.log('\n3️⃣ Testing Mobile Legends products specifically...');
    
    // First get Mobile Legends game_title_id
    const mlGame = await supabase
      .from('game_titles')
      .select('id, name')
      .ilike('name', '%mobile%legends%')
      .single();

    if (mlGame.error) {
      console.error('❌ Error finding Mobile Legends:', mlGame.error.message);
      return;
    }

    console.log(`🎮 Found game: ${mlGame.data.name} (ID: ${mlGame.data.id})`);

    // Query Mobile Legends products with new LEFT JOIN
    const mlProducts = await supabase
      .from('products')
      .select(`
        id, name, game_title,
        tiers (
          id, name, slug
        ),
        game_titles (
          id, name, slug
        )
      `, { count: 'exact' })
      .eq('game_title_id', mlGame.data.id)
      .eq('is_active', true)
      .is('archived_at', null);

    if (mlProducts.error) {
      console.error('❌ Mobile Legends query error:', mlProducts.error.message);
    } else {
      console.log(`✅ Found ${mlProducts.count} Mobile Legends products`);
      
      if (mlProducts.data && mlProducts.data.length > 0) {
        console.log('\n🎮 Mobile Legends products:');
        mlProducts.data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   - Tier: ${product.tiers?.name || 'No tier'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminProductsFix();
