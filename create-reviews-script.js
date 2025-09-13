const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic Indonesian review comments
const reviewComments = [
    'Akun sangat bagus dan sesuai deskripsi! Pelayanan cepat dan terpercaya. Recommended!',
    'Top banget! Akun langsung bisa digunakan dan semuanya sesuai. Penjual amanah 👍',
    'Kualitas akun excellent, respon penjual sangat cepat. Pasti beli lagi kalau ada yang cocok',
    'Mantap jiwa! Akun oke banget, semua item lengkap sesuai yang dijanjikan',
    'Pelayanan memuaskan, akun ori dan berkualitas. Transaksi lancar tanpa masalah',
    'Sangat puas dengan pembelian ini! Akun premium dengan harga yang reasonable',
    'Fast response, akun langsung ready dan work 100%. Highly recommended seller!',
    'Akun berkualitas tinggi, seller jujur dan terpercaya. Worth it banget!',
    'Pembelian yang tidak mengecewakan! Akun sesuai ekspektasi dan pelayanan ramah',
    'Quality akun sangat bagus, proses cepat dan aman. Terima kasih!',
    'Akun ori dan mantap! Penjual responsif dan amanah. Sukses terus!',
    'Sangat memuaskan! Akun lengkap dan berkualitas premium. Recommended seller',
    'Pelayanan excellent, akun sesuai deskripsi 100%. Transaksi yang menyenangkan',
    'Top quality account! Proses mudah dan cepat, seller sangat profesional',
    'Akun bagus banget dan harga bersahabat. Pasti jadi langganan nih',
    'Kualitas premium dengan service yang memuaskan. Highly recommended!',
    'Akun mantap dan seller terpercaya! Proses smooth dari awal sampai selesai',
    'Sangat puas dengan kualitas akun dan pelayanannya. 5 stars deserved!',
    'Fast delivery dan akun berkualitas tinggi. Terima kasih atas pelayanannya',
    'Akun sesuai ekspektasi, seller ramah dan profesional. Perfect!'
];

async function createReviewsForPaidOrders() {
    try {
        console.log('🚀 Starting review creation process...\n');
        
        // 1. First, create the product_reviews table if it doesn't exist
        console.log('📋 Step 1: Creating product_reviews table...');
        
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS product_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
        
        ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Reviews are viewable by everyone" 
        ON product_reviews FOR SELECT 
        USING (true);
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (createError && !createError.message.includes('already exists')) {
            console.log('ℹ️  Table creation result:', createError.message);
        }
        
        // 2. Get all paid orders
        console.log('📋 Step 2: Fetching paid orders...');
        const { data: paidOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, product_id, user_id, customer_email, created_at, status')
            .in('status', ['paid', 'completed'])
            .not('product_id', 'is', null)
            .order('created_at', { ascending: true });
            
        if (ordersError) {
            throw ordersError;
        }
        
        console.log(`✅ Found ${paidOrders.length} paid orders with products`);
        
        // 3. For each order, find user and create review
        console.log('📋 Step 3: Creating reviews...');
        let successCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < paidOrders.length; i++) {
            const order = paidOrders[i];
            
            // Find user ID (either from order or by email lookup)
            let userId = order.user_id;
            if (!userId) {
                const { data: userByEmail } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', order.customer_email)
                    .single();
                userId = userByEmail?.id;
            }
            
            if (!userId) {
                console.log(`⚠️  Skipping order ${order.id} - no user found`);
                skippedCount++;
                continue;
            }
            
            // Create review date (1 day after order)
            const reviewDate = new Date(order.created_at);
            reviewDate.setDate(reviewDate.getDate() + 1);
            
            // Select comment (cycle through comments)
            const comment = reviewComments[i % reviewComments.length];
            
            // Insert review
            const { error: insertError } = await supabase
                .from('product_reviews')
                .insert({
                    user_id: userId,
                    product_id: order.product_id,
                    order_id: order.id,
                    rating: 5, // All 5-star reviews
                    comment: comment,
                    created_at: reviewDate.toISOString(),
                    updated_at: reviewDate.toISOString()
                });
                
            if (insertError) {
                if (insertError.message.includes('duplicate key')) {
                    console.log(`⚠️  Review already exists for order ${order.id}`);
                    skippedCount++;
                } else {
                    console.log(`❌ Error creating review for order ${order.id}:`, insertError.message);
                    skippedCount++;
                }
            } else {
                successCount++;
                if (successCount % 5 === 0) {
                    console.log(`   ✅ Created ${successCount} reviews so far...`);
                }
            }
        }
        
        console.log('\n🎉 Review creation completed!');
        console.log(`✅ Successfully created: ${successCount} reviews`);
        console.log(`⚠️  Skipped: ${skippedCount} reviews`);
        
        // 4. Show summary
        console.log('\n📊 Verification - Recent reviews:');
        const { data: recentReviews, error: reviewsError } = await supabase
            .from('product_reviews')
            .select(`
                id,
                rating,
                comment,
                created_at,
                users!user_id(name, email),
                products!product_id(name),
                orders!order_id(id)
            `)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (reviewsError) {
            console.log('❌ Error fetching reviews:', reviewsError.message);
        } else {
            recentReviews?.forEach((review, index) => {
                console.log(`${index + 1}. ${review.users?.name || 'Unknown'} (${review.users?.email})`);
                console.log(`   Product: ${review.products?.name || 'Unknown'}`);
                console.log(`   Rating: ${'⭐'.repeat(review.rating)}`);
                console.log(`   Comment: ${review.comment?.substring(0, 60)}...`);
                console.log(`   Date: ${new Date(review.created_at).toLocaleString('id-ID')}`);
                console.log();
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
createReviewsForPaidOrders();
