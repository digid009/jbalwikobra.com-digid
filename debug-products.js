// Debug script to check products data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
  try {
    console.log('🔍 Debugging Products Data...\n');

    // 1. Check total products count
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting total count:', countError);
      return;
    }
    
    console.log(`📊 Total products in database: ${totalCount}`);

    // 2. Check active products count
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('archived_at', null);
    
    if (activeError) {
      console.error('❌ Error getting active count:', activeError);
      return;
    }
    
    console.log(`✅ Active products: ${activeCount}`);
    console.log(`🗃️  Inactive/Archived products: ${totalCount - activeCount}\n`);

    // 3. Get first 20 products to see structure
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, name, price, description, is_active, archived_at,
        game_title_id, tier_id, created_at,
        tiers!inner (
          id, name, slug
        ),
        game_titles!inner (
          id, name, slug
        )
      `)
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    console.log('📦 First 20 Active Products:');
    console.log('================================');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Game: ${product.game_titles?.name || 'N/A'}`);
      console.log(`   Tier: ${product.tiers?.name || 'N/A'}`);
      console.log(`   Price: Rp ${product.price?.toLocaleString() || 'N/A'}`);
      console.log(`   Active: ${product.is_active}`);
      console.log(`   Created: ${product.created_at}`);
      console.log('   ---');
    });

    // 4. Check the exact query that OptimizedProductService uses
    console.log('\n🔧 Testing OptimizedProductService Query...');
    
    const { data: optimizedData, error: optimizedError, count: optimizedCount } = await supabase
      .from('products')
      .select(`
        id, name, price, description, original_price, account_level,
        account_details, images, is_active, archived_at, created_at,
        game_title_id, tier_id, has_rental,
        tiers!inner (
          id, name, slug, color, background_gradient, icon
        ),
        game_titles!inner (
          id, name, slug, icon, logo_url
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .range(0, 99); // First 100 items

    if (optimizedError) {
      console.error('❌ Error with optimized query:', optimizedError);
      return;
    }

    console.log(`📊 OptimizedProductService query returned: ${optimizedData?.length || 0} products`);
    console.log(`📊 Total count from optimized query: ${optimizedCount}`);

    if (optimizedData && optimizedData.length > 0) {
      console.log('\n🎯 Sample product from optimized query:');
      console.log(JSON.stringify(optimizedData[0], null, 2));
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugProducts();
