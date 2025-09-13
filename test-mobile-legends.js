// Test Mobile Legends products specifically
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMobileLegendsProducts() {
  console.log('🎮 Testing Mobile Legends products specifically...\n');

  try {
    // First, get the Mobile Legends game_title_id
    console.log('1️⃣ Finding Mobile Legends game title ID...');
    const { data: gameTitle, error: gameError } = await supabase
      .from('game_titles')
      .select('id, name, slug')
      .ilike('name', '%mobile%legends%')
      .single();

    if (gameError) {
      console.error('❌ Error finding Mobile Legends:', gameError);
      return;
    }

    if (!gameTitle) {
      console.log('❌ Mobile Legends game title not found');
      return;
    }

    console.log(`✅ Found Mobile Legends: ${gameTitle.name} (ID: ${gameTitle.id})\n`);

    // Now test the products query with Mobile Legends filter (same as OptimizedProductService)
    console.log('2️⃣ Testing Mobile Legends products with new LEFT JOIN query...');
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        id, name, description, price, original_price, account_level,
        account_details, images, is_active, archived_at, created_at,
        game_title_id, tier_id, has_rental,
        tiers (
          id, name, slug, color, background_gradient, icon
        ),
        game_titles (
          id, name, slug, icon, logo_url
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null)
      .eq('game_title_id', gameTitle.id)  // Filter by Mobile Legends
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching Mobile Legends products:', error);
      return;
    }

    console.log(`✅ SUCCESS! Found ${count} Mobile Legends products`);
    console.log(`📦 Retrieved ${data?.length || 0} Mobile Legends products\n`);

    if (data && data.length > 0) {
      console.log('📋 Mobile Legends Products:');
      data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - ID: ${product.id}`);
        console.log(`   - Game: ${product.game_titles?.name || 'N/A'}`);
        console.log(`   - Tier: ${product.tiers?.name || 'N/A'}`);
        console.log(`   - Price: Rp ${product.price?.toLocaleString() || 0}`);
        console.log(`   - Description: ${product.description?.substring(0, 50)}...`);
        console.log('');
      });
    } else {
      console.log('❌ No Mobile Legends products found or they might be inactive/archived');
    }

    // Also test without game filter to see all games
    console.log('3️⃣ Testing all game titles to see what games are available...');
    const { data: allGames, error: allGamesError } = await supabase
      .from('game_titles')
      .select('id, name, slug, is_active')
      .eq('is_active', true)
      .order('name');

    if (!allGamesError && allGames) {
      console.log('\n🎯 Available Games:');
      allGames.forEach(game => {
        console.log(`- ${game.name} (${game.slug})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMobileLegendsProducts();
