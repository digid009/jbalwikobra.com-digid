// Debug products fetch to verify the fix
const { createClient } = require('@supabase/supabase-js');

// Using environment variables from .env
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductsFetch() {
  console.log('🔍 Testing products fetch with LEFT JOIN...\n');

  try {
    // Test the new query (same as OptimizedProductService)
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
      .order('created_at', { ascending: false })
      .range(0, 15); // Get first 16 products

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ SUCCESS! Found ${count} total active products in database`);
    console.log(`📦 Retrieved ${data?.length || 0} products in first batch\n`);

    // Show product details
    console.log('📋 Product Details:');
    data?.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Game: ${product.game_titles?.name || 'N/A'}`);
      console.log(`   - Tier: ${product.tiers?.name || 'N/A'}`);
      console.log(`   - Active: ${product.is_active}`);
      console.log(`   - Price: Rp ${product.price?.toLocaleString() || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProductsFetch();
