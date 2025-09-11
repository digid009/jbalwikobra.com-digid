-- Advanced Review Seeding Script - Based on Actual Order Data
-- This script demonstrates how to create reviews using real customer data from orders

-- Step 1: Create a temporary table with realistic review templates
WITH review_templates AS (
  SELECT * FROM (VALUES
    (5, 'Account bagus banget! Skin nya lengkap dan rank sudah tinggi. Penjual responsif dan transaksi lancar. Recommended!'),
    (5, 'Mantap jiwa! Sudah ada banyak skin rare dan diamond banyak. Seller jujur dan terpercaya. Terima kasih!'),
    (4, 'Proses mudah banget dan harga reasonable. Cuma agak lama balasnya aja. Overall good!'),
    (5, 'Pelayanan sangat memuaskan! Langsung aktif dan prosesnya cepat. Definitely akan order lagi kalau butuh!'),
    (5, 'Masuk instant! Seller nya ramah dan helpful banget. Harga lebih murah dari yang lain. Recommended seller!'),
    (4, 'Transaksi aman dan terpercaya. Sesuai pesanan. Cuma website nya kadang agak lemot, tapi overall oke!'),
    (5, 'Langsung masuk ke account! Prosesnya gampang banget dan customer service nya ramah. Will definitely buy again!'),
    (5, 'Udah aktif dan bisa claim reward. Seller terpercaya dan fast response. Highly recommended!'),
    (4, 'Masuk dengan lancar, prosesnya straightforward. Harga competitive dan service memuaskan. Good job!'),
    (5, 'Aktif dan bonus nya juga masuk. Seller responsive dan jujur. Thanks!'),
    (3, 'Bagus tapi proses agak lama. Customer service nya oke sih, cuma bisa lebih cepat lagi.'),
    (5, 'Langsung aktif! Benefit nya langsung bisa dipakai. Seller profesional banget. Top!'),
    (4, 'Masuk sesuai jumlah pesanan. Prosesnya aman dan seller nya trustworthy. Recommended!'),
    (5, 'Upgrade nya instant! Mission nya langsung bisa dikerjain. Service excellent, very satisfied!'),
    (4, 'Aktif dan reward nya bisa di claim. Harga fair dan pelayanan ramah. Good experience!')
  ) AS t(rating, comment_template)
),

-- Step 2: Get actual customer data from paid orders
customer_orders AS (
  SELECT DISTINCT
    customer_name,
    customer_email,
    product_name,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM orders 
  WHERE status IN ('paid', 'completed', 'delivered')
    AND customer_name IS NOT NULL 
    AND customer_email IS NOT NULL
    AND product_name IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 20
),

-- Step 3: Combine customer data with review templates
review_data AS (
  SELECT 
    co.product_name,
    co.customer_name as reviewer_name,
    co.customer_email as reviewer_email,
    rt.rating,
    rt.comment_template as comment,
    co.created_at + INTERVAL floor(random() * 7 + 1) * '1 day' as review_date
  FROM customer_orders co
  CROSS JOIN review_templates rt
  WHERE co.row_num <= 15  -- Limit to 15 customers
    AND rt.rating >= 4    -- Only good reviews for seeding
  ORDER BY random()
  LIMIT 15  -- 15 reviews total
)

-- Step 4: Insert the generated reviews
INSERT INTO reviews (
  product_name,
  reviewer_name,
  reviewer_email,
  rating,
  comment,
  created_at,
  updated_at
)
SELECT 
  product_name,
  reviewer_name,
  reviewer_email,
  rating,
  comment,
  review_date,
  review_date
FROM review_data;

-- Alternative simpler approach if the above doesn't work with your database:
-- You can run this query first to see what data is available:

-- SELECT 
--   customer_name,
--   customer_email, 
--   product_name,
--   status,
--   created_at
-- FROM orders 
-- WHERE status IN ('paid', 'completed', 'delivered')
--   AND customer_name IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Then manually create INSERT statements based on the results.
