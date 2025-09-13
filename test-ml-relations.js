// Test Mobile Legends products specifically to see their relations
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testMobileLegendsRelations() {
  console.log('🎮 Testing Mobile Legends Relations Specifically...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // First get Mobile Legends game_title_id
    console.log('1️⃣ Getting Mobile Legends game_title_id...');
    const { data: mlGame } = await supabase
      .from('game_titles')
      .select('id, name, slug')
      .ilike('name', '%mobile%legends%')
      .single();

    console.log(`🎯 Mobile Legends: ${mlGame.name} (ID: ${mlGame.id})`);

    // Query Mobile Legends products with LEFT JOIN
    console.log('\n2️⃣ Querying Mobile Legends products with LEFT JOIN...');
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, game_title, game_title_id, tier_id,
        tiers (
          id, name, slug
        ),
        game_titles (
          id, name, slug
        )
      `)
      .eq('game_title_id', mlGame.id)
      .eq('is_active', true)
      .is('archived_at', null)
      .limit(10);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${data?.length || 0} Mobile Legends products:`);
    data?.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   - game_title_id: ${product.game_title_id}`);
      console.log(`   - game_title: "${product.game_title}"`);
      console.log(`   - game_titles relation: ${product.game_titles ? `"${product.game_titles.name}" (slug: "${product.game_titles.slug}")` : 'NULL'}`);
      console.log(`   - tier_id: ${product.tier_id}`);
      console.log(`   - tiers relation: ${product.tiers ? `"${product.tiers.name}" (slug: "${product.tiers.slug}")` : 'NULL'}`);
    });

    // Test if filtering by slug works
    console.log('\n3️⃣ Testing admin filtering logic...');
    const gameTitleFilter = 'mobile-legends'; // This is what admin dropdown uses
    const filteredProducts = data?.filter(product => {
      const gameTitleSlug = product.game_titles?.slug;
      const gameTitleName = product.game_titles?.name || product.game_title;
      
      const slugMatch = gameTitleSlug?.toLowerCase() === gameTitleFilter.toLowerCase();
      const nameMatch = gameTitleName?.toLowerCase() === 'mobile legends';
      
      console.log(`   - ${product.name}: slug="${gameTitleSlug}" name="${gameTitleName}" slugMatch=${slugMatch} nameMatch=${nameMatch}`);
      
      return slugMatch || nameMatch;
    });

    console.log(`\n🎯 After admin filtering: ${filteredProducts?.length || 0} products would show`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testMobileLegendsRelations();
