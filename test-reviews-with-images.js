/**
 * Test script to verify reviews with product images
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testReviewsWithImages() {
  console.log('🔍 Testing reviews with product images...\n');
  
  try {
    // Test the reviews query with joins
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url
        ),
        products:product_id (
          name,
          image
        )
      `)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('❌ Error fetching reviews:', error);
      return;
    }
    
    console.log(`✅ Found ${reviews?.length || 0} verified reviews\n`);
    
    if (reviews && reviews.length > 0) {
      reviews.forEach((review, index) => {
        console.log(`📝 Review ${index + 1}:`);
        console.log(`   User: ${review.users?.name || 'Anonymous'}`);
        console.log(`   Rating: ${review.rating}⭐`);
        console.log(`   Product: ${review.products?.name || 'Unknown'}`);
        console.log(`   Comment: ${review.comment?.substring(0, 100)}...`);
        console.log(`   Product Image: ${review.products?.image || 'No image'}`);
        console.log(`   Created: ${new Date(review.created_at).toLocaleString()}`);
        console.log('---');
      });
    } else {
      console.log('ℹ️  No reviews found. Creating sample data...');
      
      // Check if we have products to create reviews for
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image')
        .limit(3);
        
      if (products && products.length > 0) {
        console.log(`\n📦 Found ${products.length} products for sample reviews`);
        products.forEach(product => {
          console.log(`   - ${product.name} (${product.image ? 'has image' : 'no image'})`);
        });
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testReviewsWithImages();
