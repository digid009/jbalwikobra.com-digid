-- Create product_likes table for handling product likes with IP-based limitation
-- This allows guests to like products but limits to one like per IP address

CREATE TABLE IF NOT EXISTS product_likes (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one like per IP per product (for guests)
  -- OR one like per user per product (for logged-in users)
  UNIQUE(product_id, ip_address),
  UNIQUE(product_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_ip_address ON product_likes(ip_address);
CREATE INDEX IF NOT EXISTS idx_product_likes_user_id ON product_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_created_at ON product_likes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;

-- Create policy for reading likes (everyone can read)
CREATE POLICY "Anyone can view product likes" ON product_likes
  FOR SELECT USING (true);

-- Create policy for inserting likes (anyone can insert)
CREATE POLICY "Anyone can add product likes" ON product_likes
  FOR INSERT WITH CHECK (true);

-- Create policy for deleting likes (users can delete their own likes based on IP or user_id)
CREATE POLICY "Users can delete their own likes" ON product_likes
  FOR DELETE USING (
    -- Allow deletion if the IP matches (for guests)
    ip_address = (
      SELECT COALESCE(
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'x-real-ip',
        'unknown'
      )
    )
    OR
    -- Allow deletion if the user_id matches (for logged-in users)
    (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- Add comment to table
COMMENT ON TABLE product_likes IS 'Stores product likes with IP-based limitation for guests and user-based for authenticated users';
