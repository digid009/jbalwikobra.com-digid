-- ================================================
-- SQL SCRIPT: CREATE REVIEWS FOR PAID ORDERS >= 50K
-- ================================================
-- This script will:
-- 1. Insert 5-star reviews for paid orders with amount >= 50,000
-- 2. Use the order's created_at as the review creation date
-- 3. Use informal Indonesian language like daily conversation

-- ================================================
-- 1. CHECK CURRENT PAID ORDERS >= 50K
-- ================================================
SELECT 
  id as order_id,
  user_id,
  product_id,
  customer_name,
  customer_email,
  amount,
  created_at,
  paid_at,
  status
FROM orders 
WHERE status = 'completed' 
  AND paid_at IS NOT NULL
  AND amount >= 50000
ORDER BY created_at;

-- ================================================
-- 2. INSERT 5-STAR REVIEWS FOR PAID ORDERS >= 50K
-- ================================================

-- Array of informal Indonesian review comments (daily conversation style)
WITH review_comments AS (
    SELECT UNNEST(ARRAY[
        'Mantap nih bang! Prosesnya cepet banget, akunnya sesuai deskripsi. Makasih ya!',
        'Wah keren banget! Adminnya responsif, akunnya ori. Recommended pokoknya! 👍',
        'Bagus banget nih! Sesuai ekspektasi, pelayanan ramah. Bakal repeat order deh',
        'Top markotop! akunnya oke, proses lancar jaya. Makasih bang!',
        'Mantul banget! akunnya sesuai gambar, fast respon. Puas banget dah',
        'Keren abis! akunnya ori, harga bersahabat. Seller amanah nih',
        'Oke banget! Prosesnya gampang, akunnya cepet nyampe. Recommended!',
        'Bagus pol! Adminnya baik, akunnya berkualitas. Makasih ya kak',
        'Mantap jiwa! Semuanya oke, ga nyesel beli disini. Top dah!',
        'Kece badai! akunnya sesuai harapan, pelayanan juara. Sukses terus!',
        'Bagus banget bang! Cepet prosesnya, akunnya original. Makasih!',
        'Top banget! Seller jujur, akunnya berkualitas. Pasti beli lagi',
        'Mantap betul! Semuanya oke, ga ada yang kurang. Recommended!',
        'Keren nih! akunnya sesuai deskripsi, adminnya ramah banget',
        'Oke punya! Prosesnya mudah, akunnya cepet ready. Makasih ya',
        'Bagus banget! Seller terpercaya, akunnya ori. Puas deh',
        'Top dah! akunnya sesuai ekspektasi, pelayanan memuaskan',
        'Mantap bro! Cepet banget prosesnya, akunnya oke. Recommended!',
        'Keren abis! Adminnya responsif, akunnya berkualitas. Makasih!',
        'Oke banget! Semuanya lancar, akunnya sesuai gambar. Top!'
    ]) AS comment
),

-- Get paid orders >= 50K with cycling comments
paid_orders_with_comments AS (
    SELECT 
        o.id as order_id,
        o.product_id,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.amount,
        o.created_at,
        o.status,
        -- Select comment based on row number (cycling through our 20 comments)
        (
            SELECT comment 
            FROM review_comments 
            OFFSET (ROW_NUMBER() OVER (ORDER BY o.created_at) - 1) % 20 
            LIMIT 1
        ) as review_comment
    FROM orders o
    WHERE o.status = 'completed'
    AND o.paid_at IS NOT NULL
    AND o.amount >= 50000  -- Only orders >= 50K
    AND o.product_id IS NOT NULL -- Only orders with valid product
)

-- Insert reviews for qualified paid orders
INSERT INTO reviews (
    id,
    user_id,
    product_id,
    rating,
    comment,
    is_verified,
    helpful_count,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    user_id,
    product_id,
    5 as rating, -- All 5-star reviews
    review_comment as comment,
    true as is_verified, -- Mark as verified since these are from real paid orders
    0 as helpful_count,
    created_at as created_at, -- Use order's created_at as review date
    created_at as updated_at
FROM paid_orders_with_comments;

-- ================================================
-- 3. VERIFICATION QUERY
-- ================================================

-- Show results
SELECT 
    'Reviews created successfully for orders >= 50K!' as status,
    COUNT(*) as total_reviews_created
FROM reviews
WHERE created_at >= '2025-09-01' -- Reviews from September onwards
AND rating = 5;

-- Detailed view of created reviews
SELECT 
    r.id,
    r.user_id,
    r.product_id,
    r.rating,
    LEFT(r.comment, 60) || '...' as comment_preview,
    r.created_at as review_date,
    r.is_verified,
    o.customer_name,
    o.amount
FROM reviews r
LEFT JOIN orders o ON (
    o.product_id = r.product_id 
    AND o.created_at = r.created_at
    AND o.status = 'completed'
    AND o.amount >= 50000
)
WHERE r.rating = 5
AND r.created_at >= '2025-09-01'
ORDER BY r.created_at DESC;

-- Show summary by product
SELECT 
    r.product_id,
    COUNT(*) as review_count,
    AVG(r.rating) as avg_rating,
    MIN(r.created_at) as first_review,
    MAX(r.created_at) as last_review
FROM reviews r
WHERE r.rating = 5
AND r.created_at >= '2025-09-01'
GROUP BY r.product_id
ORDER BY review_count DESC;
        (
            SELECT comment 
            FROM review_comments 
            OFFSET (ROW_NUMBER() OVER (ORDER BY o.created_at) - 1) % 20 
            LIMIT 1
        ) as review_comment
    FROM orders o
    WHERE o.status IN ('paid', 'completed')
    AND o.product_id IS NOT NULL -- Only orders with valid product
)

-- Insert reviews for paid orders
INSERT INTO product_reviews (
    user_id,
    product_id, 
    order_id,
    rating,
    comment,
    created_at,
    updated_at
)
SELECT 
    review_user_id,
    product_id,
    order_id,
    5 as rating, -- All 5-star reviews
    review_comment,
    created_at + INTERVAL '1 day' as created_at, -- Review created 1 day after order
    created_at + INTERVAL '1 day' as updated_at
FROM paid_orders_with_comments
WHERE review_user_id IS NOT NULL -- Only if we have a user ID
ON CONFLICT (user_id, product_id) DO NOTHING; -- Skip if review already exists

-- ================================================
-- 3. VERIFICATION QUERY
-- ================================================

-- Show results
SELECT 
    'Reviews created successfully!' as status,
    COUNT(*) as total_reviews_created
FROM product_reviews
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Detailed view of created reviews
SELECT 
    pr.id,
    u.name as user_name,
    u.email as user_email,
    p.name as product_name,
    pr.rating,
    LEFT(pr.comment, 50) || '...' as comment_preview,
    pr.created_at as review_date,
    o.created_at as order_date
FROM product_reviews pr
JOIN users u ON pr.user_id = u.id
LEFT JOIN products p ON pr.product_id = p.id
LEFT JOIN orders o ON pr.order_id = o.id
ORDER BY pr.created_at DESC
LIMIT 10;
