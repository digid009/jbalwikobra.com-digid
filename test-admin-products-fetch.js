// Test Admin Products Fetch
const { createClient } = require('@supabase/supabase-js');

// Use the same working configuration as the test-mobile-legends.js
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzU5NDAsImV4cCI6MjA0MzcxMTk0MH0.FO6wpjHN8TN4H4WMFBIZJhrcWKV1GvS0JgpBvMgBCvg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminProductsFetch() {
  try {
    console.log('🔧 Testing Admin Products Fetch...\n');

    // Test current admin service query (without LEFT JOIN)
    console.log('1️⃣ Testing current admin service query (simple select)...');
    const { data: adminProducts, error: adminError, count: adminCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 99); // Get first 100

    if (adminError) {
      console.error('❌ Admin query error:', adminError);
      return;
    }

    console.log(`✅ Admin query SUCCESS! Found ${adminCount} total products`);
    console.log(`📦 Retrieved ${adminProducts.length} products for admin\n`);

    // Test with LEFT JOIN like OptimizedProductService
    console.log('2️⃣ Testing with LEFT JOIN (like OptimizedProductService)...');
    const { data: leftJoinProducts, error: leftJoinError, count: leftJoinCount } = await supabase
      .from('products')
      .select(`
        *,
        tiers (
          id,
          name,
          slug,
          description
        ),
        game_titles (
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 99);

    if (leftJoinError) {
      console.error('❌ LEFT JOIN query error:', leftJoinError);
      return;
    }

    console.log(`✅ LEFT JOIN query SUCCESS! Found ${leftJoinCount} total active products`);
    console.log(`📦 Retrieved ${leftJoinProducts.length} active products with relations\n`);

    // Compare the results
    console.log('📊 COMPARISON:');
    console.log(`- Admin Service (simple): ${adminCount} total, ${adminProducts.length} retrieved`);
    console.log(`- LEFT JOIN (active): ${leftJoinCount} total, ${leftJoinProducts.length} retrieved`);

    if (adminCount !== leftJoinCount) {
      console.log('⚠️  Different counts detected - admin may be missing some products!');
    }

    // Show first few admin products
    console.log('\n📋 First 10 Admin Products:');
    adminProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Active: ${product.is_active}`);
      console.log(`   - Tier ID: ${product.tier_id || 'null'}`);
      console.log(`   - Game Title ID: ${product.game_title_id || 'null'}`);
      console.log('');
    });

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testAdminProductsFetch();
