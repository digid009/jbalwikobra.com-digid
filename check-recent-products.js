// Check recent products in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentProducts() {
  try {
    console.log('🔍 Checking Recent Products...\n');

    // Get products from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentProducts, error } = await supabase
      .from('products')
      .select(`
        id, name, price, is_active, created_at,
        game_titles (name),
        tiers (name)
      `)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Found ${recentProducts.length} products created in last 24 hours:`);
    console.log('='.repeat(60));
    
    if (recentProducts.length === 0) {
      console.log('No products created in the last 24 hours.');
      
      // Show last 5 products instead
      console.log('\n📋 Last 5 products created:');
      console.log('='.repeat(60));
      
      const { data: lastProducts, error: lastError } = await supabase
        .from('products')
        .select(`
          id, name, price, is_active, created_at,
          game_titles (name),
          tiers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (lastError) {
        console.error('❌ Error getting last products:', lastError);
        return;
      }
      
      lastProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Game: ${product.game_titles?.name || 'N/A'}`);
        console.log(`   Tier: ${product.tiers?.name || 'N/A'}`);
        console.log(`   Price: Rp ${product.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Active: ${product.is_active}`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
        console.log('   ---');
      });
      
    } else {
      recentProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Game: ${product.game_titles?.name || 'N/A'}`);
        console.log(`   Tier: ${product.tiers?.name || 'N/A'}`);
        console.log(`   Price: Rp ${product.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Active: ${product.is_active}`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
        console.log('   ---');
      });
    }
    
    // Test admin query similar to what's used in AdminProducts.tsx
    console.log('\n🔧 Testing Admin Query (like AdminProducts.tsx):');
    console.log('='.repeat(60));
    
    const { data: adminProducts, error: adminError, count } = await supabase
      .from('products')
      .select(`
        id, name, description, price, original_price,
        is_active, archived_at, created_at, images, game_title_id, tier_id,
        tiers (id, name, slug, color, background_gradient),
        game_titles (id, name, slug, icon)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 19); // First 20 products
    
    if (adminError) {
      console.error('❌ Admin query error:', adminError);
      return;
    }
    
    console.log(`📊 Admin query found ${count} total products`);
    console.log(`📦 Retrieved first ${adminProducts.length} products for admin view`);
    
    if (adminProducts.length > 0) {
      console.log('\n📋 First 5 products from admin query:');
      adminProducts.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.is_active ? 'Active' : 'Inactive'})`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkRecentProducts();
