// Test game titles and slugs to understand filtering issue
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkGameTitleSlugs() {
  console.log('🎮 Checking game title slugs for admin filtering...\n');

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get all game titles with their slugs
    console.log('1️⃣ Getting all game titles and slugs...');
    const { data: gameTitles, error: gameError } = await supabase
      .from('game_titles')
      .select('id, name, slug')
      .order('name');

    if (gameError) {
      console.error('❌ Error fetching game titles:', gameError.message);
      return;
    }

    console.log('🎮 Available game titles:');
    gameTitles?.forEach((game, index) => {
      console.log(`${index + 1}. ${game.name}`);
      console.log(`   - ID: ${game.id}`);
      console.log(`   - Slug: "${game.slug}"`);
      console.log('');
    });

    // 2. Get Mobile Legends specifically
    const mlGame = gameTitles?.find(g => g.name.toLowerCase().includes('mobile') && g.name.toLowerCase().includes('legends'));
    if (mlGame) {
      console.log('🎯 Mobile Legends found:');
      console.log(`   - Name: "${mlGame.name}"`);
      console.log(`   - Slug: "${mlGame.slug}"`);
      console.log('');

      // 3. Test products with Mobile Legends
      console.log('2️⃣ Testing products with Mobile Legends game_title_id...');
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id, name, game_title,
          tiers (name, slug),
          game_titles (name, slug)
        `)
        .eq('game_title_id', mlGame.id)
        .eq('is_active', true)
        .is('archived_at', null)
        .limit(5);

      if (productsError) {
        console.error('❌ Error fetching products:', productsError.message);
      } else {
        console.log(`✅ Found ${products?.length || 0} Mobile Legends products (showing first 5):`);
        products?.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   - game_title field: "${product.game_title}"`);
          console.log(`   - game_titles.name: "${product.game_titles?.name}"`);
          console.log(`   - game_titles.slug: "${product.game_titles?.slug}"`);
          console.log('');
        });
      }

      // 4. Test admin filtering logic
      console.log('3️⃣ Testing admin filtering logic simulation...');
      console.log(`Filter value (gameTitle.slug): "${mlGame.slug}"`);
      console.log(`Admin filter check: gameTitleSlug?.toLowerCase() === "${mlGame.slug.toLowerCase()}"`);
      console.log(`Admin filter check: gameTitleName?.toLowerCase() === "${mlGame.name.toLowerCase()}"`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

checkGameTitleSlugs();
