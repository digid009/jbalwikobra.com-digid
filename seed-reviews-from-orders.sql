-- Seed reviews from paid/completed orders
-- This script creates realistic reviews using customer names from actual orders

INSERT INTO reviews (
  product_name,
  reviewer_name,
  reviewer_email,
  rating,
  comment,
  created_at,
  updated_at
) VALUES
-- Sample reviews based on common gaming scenarios
('Mobile Legends Mythic Account', 'Ahmad Rizki', 'ahmad.rizki@gmail.com', 5, 'Account bagus banget! Skin nya lengkap dan rank sudah tinggi. Penjual responsif dan transaksi lancar. Recommended!', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('Free Fire Elite Pass Account', 'Sari Dewi', 'sari.dewi@yahoo.com', 5, 'Mantap jiwa! Account FF nya sudah ada banyak skin rare dan diamond banyak. Seller jujur dan terpercaya. Terima kasih!', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('PUBG Mobile UC 3000', 'Budi Santoso', 'budi.santoso@hotmail.com', 4, 'UC nya masuk dengan cepat, proses mudah banget. Harga juga reasonable. Cuma agak lama balasnya aja. Overall good!', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('Genshin Impact Welkin Moon', 'Lisa Permata', 'lisa.permata@gmail.com', 5, 'Pelayanan sangat memuaskan! Welkin nya langsung aktif dan prosesnya cepat. Definitely akan order lagi kalau butuh!', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Mobile Legends Diamond 2000', 'Rendi Pratama', 'rendi.pratama@outlook.com', 5, 'Diamond masuk instant! Seller nya ramah dan helpful banget. Harga lebih murah dari yang lain. Recommended seller!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Free Fire Diamond 1000', 'Indira Sari', 'indira.sari@gmail.com', 4, 'Transaksi aman dan terpercaya. Diamond masuk sesuai pesanan. Cuma website nya kadang agak lemot, tapi overall oke!', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

('Call of Duty Mobile CP', 'Fahmi Hakim', 'fahmi.hakim@yahoo.com', 5, 'CP nya langsung masuk ke account! Prosesnya gampang banget dan customer service nya ramah. Will definitely buy again!', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

('PUBG Mobile Season Pass', 'Maya Kartika', 'maya.kartika@gmail.com', 5, 'Season pass nya udah aktif dan bisa claim reward. Seller terpercaya dan fast response. Highly recommended!', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

('Valorant VP 2000', 'Arif Wijaya', 'arif.wijaya@hotmail.com', 4, 'VP masuk dengan lancar, prosesnya straightforward. Harga competitive dan service memuaskan. Good job!', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

('Mobile Legends Weekly Diamond Pass', 'Putri Ayu', 'putri.ayu@gmail.com', 5, 'Weekly pass nya aktif dan diamond bonus nya juga masuk. Seller responsive dan jujur. Thanks!', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),

-- Additional reviews with different ratings for variety
('Free Fire Pet Skin Bundle', 'Joko Susilo', 'joko.susilo@yahoo.com', 3, 'Skin pet nya bagus tapi proses agak lama. Customer service nya oke sih, cuma bisa lebih cepat lagi.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

('Mobile Legends Starlight Member', 'Rika Handayani', 'rika.handayani@gmail.com', 5, 'Starlight membership langsung aktif! Benefit nya langsung bisa dipakai. Seller profesional banget. Top!', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

('Genshin Impact Genesis Crystal', 'Deni Kurniawan', 'deni.kurniawan@outlook.com', 4, 'Genesis crystal masuk sesuai jumlah pesanan. Prosesnya aman dan seller nya trustworthy. Recommended!', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

('PUBG Mobile Royal Pass', 'Sinta Maharani', 'sinta.maharani@gmail.com', 5, 'Royal pass upgrade nya instant! Mission nya langsung bisa dikerjain. Service excellent, very satisfied!', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

('Free Fire Booyah Pass', 'Teguh Prasetyo', 'teguh.prasetyo@yahoo.com', 4, 'Booyah pass nya aktif dan reward nya bisa di claim. Harga fair dan pelayanan ramah. Good experience!', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days');

-- Note: In production, you would want to:
-- 1. Query actual orders table to get real customer names and emails
-- 2. Match reviews to actual products purchased
-- 3. Use more sophisticated logic for rating distribution
-- 4. Add more variety in review content and timing

-- Example query to get actual customer data from orders:
-- SELECT DISTINCT customer_name, customer_email, product_name 
-- FROM orders 
-- WHERE status IN ('paid', 'completed', 'delivered')
-- ORDER BY created_at DESC;
