require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

// Array of informal Indonesian review comments
const reviewComments = [
  'Mantap nih bang! Prosesnya cepet banget, akunnya sesuai deskripsi. Makasih ya!',
  'Wah keren banget! Adminnya responsif, akunnya ori. Recommended pokoknya! 👍',
  'Bagus banget nih! Sesuai ekspektasi, pelayanan ramah. Bakal repeat order deh',
  'Top markotop! Akunnya oke, proses lancar jaya. Makasih bang!',
  'Mantul banget! Akunnya sesuai gambar, fast respon. Puas banget dah',
  'Keren abis! Akunnya ori, harga bersahabat. Seller amanah nih',
  'Oke banget! Prosesnya gampang, akunnya cepet nyampe. Recommended!',
  'Bagus pol! Adminnya baik, akunnya berkualitas. Makasih ya kak',
  'Mantap jiwa! Semuanya oke, ga nyesel beli disini. Top dah!',
  'Kece badai! Akunnya sesuai harapan, pelayanan juara. Sukses terus!',
  'Bagus banget bang! Cepet prosesnya, akunnya original. Makasih!',
  'Top banget! Seller jujur, akunnya berkualitas. Pasti beli lagi',
  'Mantap betul! Semuanya oke, ga ada yang kurang. Recommended!',
  'Keren nih! Akunnya sesuai deskripsi, adminnya ramah banget',
  'Oke punya! Prosesnya mudah, akunnya cepet ready. Makasih ya',
  'Bagus banget! Seller terpercaya, akunnya ori. Puas deh',
  'Top dah! Akunnya sesuai ekspektasi, pelayanan memuaskan',
  'Mantap bro! Cepet banget prosesnya, akunnya oke. Recommended!',
  'Keren abis! Adminnya responsif, akunnya berkualitas. Makasih!',
  'Oke banget! Semuanya lancar, akunnya sesuai gambar. Top!'
];

async function createReviewsForPaidOrders() {
  try {
    console.log('🔍 Fetching paid orders with amount >= 50,000...\n');
    
    // Get paid orders with amount >= 50K
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, product_id, customer_name, customer_email, amount, created_at, paid_at, status')
      .eq('status', 'completed')
      .not('paid_at', 'is', null)
      .gte('amount', 50000)
      .not('product_id', 'is', null)
      .order('created_at', { ascending: true });
      
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No paid orders found with amount >= 50,000');
      return;
    }
    
    console.log(`✅ Found ${orders.length} qualifying paid orders\n`);
    
    // Prepare reviews data
    const reviewsToInsert = orders.map((order, index) => ({
      user_id: order.user_id,
      product_id: order.product_id,
      rating: 5,
      comment: reviewComments[index % reviewComments.length],
      is_verified: true,
      helpful_count: 0,
      created_at: order.created_at,
      updated_at: order.created_at
    }));
    
    // Show what will be created
    console.log('📝 Reviews that will be created:');
    reviewsToInsert.forEach((review, index) => {
      const order = orders[index];
      console.log(`${index + 1}. Customer: ${order.customer_name}`);
      console.log(`   Product: ${review.product_id}`);
      console.log(`   User: ${review.user_id || 'NULL'}`);
      console.log(`   Amount: Rp ${order.amount.toLocaleString('id-ID')}`);
      console.log(`   Rating: ${review.rating} ⭐`);
      console.log(`   Comment: "${review.comment}"`);
      console.log(`   Date: ${review.created_at}`);
      console.log('   ---');
    });
    
    // Insert reviews
    console.log('\n🚀 Creating reviews...');
    const { data: insertedReviews, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewsToInsert)
      .select();
      
    if (insertError) {
      console.error('❌ Error inserting reviews:', insertError);
      return;
    }
    
    console.log(`✅ Successfully created ${insertedReviews.length} reviews!\n`);
    
    // Verify results
    console.log('🔍 Verification - Recent 5-star reviews:');
    const { data: recentReviews, error: verifyError } = await supabase
      .from('reviews')
      .select('id, user_id, product_id, rating, comment, created_at, is_verified')
      .eq('rating', 5)
      .gte('created_at', '2025-09-01')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (verifyError) {
      console.error('❌ Error verifying reviews:', verifyError);
      return;
    }
    
    recentReviews.forEach((review, index) => {
      console.log(`${index + 1}. ID: ${review.id}`);
      console.log(`   Product: ${review.product_id}`);
      console.log(`   Rating: ${review.rating} ⭐`);
      console.log(`   Verified: ${review.is_verified ? '✅' : '❌'}`);
      console.log(`   Comment: "${review.comment.substring(0, 50)}..."`);
      console.log(`   Date: ${review.created_at}`);
      console.log('   ---');
    });
    
    console.log('\n🎉 Review creation process completed successfully!');
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

// Run the script
createReviewsForPaidOrders();
