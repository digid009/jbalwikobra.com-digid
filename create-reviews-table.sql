-- Create reviews table with proper relationships and indexing
-- Following best practices for performance and data integrity

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON reviews(product_id, rating);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample review data for testing
INSERT INTO reviews (user_id, product_id, rating, comment, is_verified) 
SELECT 
  u.id as user_id,
  p.id as product_id,
  (RANDOM() * 4 + 1)::INTEGER as rating,
  CASE 
    WHEN RANDOM() < 0.2 THEN 'Produk sangat bagus! Kualitas premium dan pelayanan memuaskan.'
    WHEN RANDOM() < 0.4 THEN 'Rekomendasi banget! Akun game nya legit dan proses cepat.'
    WHEN RANDOM() < 0.6 THEN 'Pelayanan ramah, akun sesuai deskripsi. Puas dengan pembelian ini.'
    WHEN RANDOM() < 0.8 THEN 'Good seller, trusted! Akun game berkualitas tinggi.'
    ELSE 'Terima kasih, produk sesuai ekspektasi. Akan beli lagi di sini.'
  END as comment,
  RANDOM() < 0.7 as is_verified  -- 70% chance of being verified
FROM (
  SELECT id FROM users ORDER BY RANDOM() LIMIT 5
) u
CROSS JOIN (
  SELECT id FROM products WHERE is_active = true ORDER BY RANDOM() LIMIT 3
) p
ON CONFLICT DO NOTHING;

-- Create a view for reviews with user and product info (for optimized queries)
CREATE OR REPLACE VIEW reviews_with_details AS
SELECT 
  r.*,
  u.name as user_name,
  u.avatar_url as user_avatar,
  p.name as product_name,
  p.image as product_image
FROM reviews r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN products p ON r.product_id = p.id
WHERE r.created_at IS NOT NULL
ORDER BY r.created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON reviews_with_details TO anon, authenticated;
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;

COMMENT ON TABLE reviews IS 'Product reviews with ratings and comments from users';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN reviews.is_verified IS 'Whether this review is from a verified purchase';
COMMENT ON COLUMN reviews.helpful_count IS 'Number of users who found this review helpful';
