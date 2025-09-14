// Test browser cache clearing for admin page
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrowserCacheIssue() {
  try {
    console.log('🧹 Investigating Potential Browser Cache Issues...\n');
    
    // Test if the latest product is consistently at top
    console.log('1️⃣ Multiple consecutive queries (simulate browser refresh)');
    console.log('='.repeat(60));
    
    for (let i = 1; i <= 3; i++) {
      console.log(`Query ${i}:`);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error(`❌ Query ${i} error:`, error);
        continue;
      }
      
      data.forEach((product, idx) => {
        console.log(`  ${idx + 1}. ${product.name} (${new Date(product.created_at).toLocaleString()})`);
      });
      console.log('');
      
      // Wait a bit between queries to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test a specific search for the new product
    console.log('2️⃣ Specific search for the new "test" product');
    console.log('='.repeat(60));
    
    const { data: searchResults, error: searchError } = await supabase
      .from('products')
      .select('id, name, created_at, is_active')
      .ilike('name', '%test%')
      .order('created_at', { ascending: false });
    
    if (searchError) {
      console.error('❌ Search error:', searchError);
      return;
    }
    
    console.log(`Found ${searchResults.length} products matching "test":`);
    searchResults.forEach((product, idx) => {
      console.log(`${idx + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
      console.log(`   Active: ${product.is_active}`);
      console.log('');
    });
    
    // Check if product appears in both filtered and unfiltered results
    console.log('3️⃣ Testing different filter combinations');
    console.log('='.repeat(60));
    
    // All products
    const { count: allCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    // Active products only
    const { count: activeCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('archived_at', null);
    
    // Get the "test" product specifically
    const { data: testProduct, error: testError } = await supabase
      .from('products')
      .select('id, name, is_active, archived_at, created_at')
      .eq('name', 'test')
      .single();
    
    if (testError) {
      console.log('❌ Could not find "test" product:', testError.message);
    } else {
      console.log('✅ "test" product details:');
      console.log(`   ID: ${testProduct.id}`);
      console.log(`   Name: ${testProduct.name}`);
      console.log(`   Active: ${testProduct.is_active}`);
      console.log(`   Archived: ${testProduct.archived_at ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(testProduct.created_at).toLocaleString()}`);
    }
    
    console.log(`\n📊 Total products: ${allCount}`);
    console.log(`📊 Active products: ${activeCount}`);
    
    // Generate cache-busting recommendation
    console.log('\n💡 Troubleshooting Recommendations:');
    console.log('='.repeat(60));
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Hard refresh admin page (Ctrl+F5)');
    console.log('3. Open admin page in incognito/private mode');
    console.log('4. Check if filters are applied (status, game, search)');
    console.log('5. Try changing items per page or go to page 2 then back to page 1');
    console.log('6. Check browser console for JavaScript errors');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testBrowserCacheIssue();
