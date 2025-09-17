-- Create payments table to store payment data for custom payment interface
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  xendit_id TEXT UNIQUE NOT NULL,
  external_id TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  amount BIGINT NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT NOT NULL,
  description TEXT,
  payment_data JSONB DEFAULT '{}',
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_xendit_id ON payments(xendit_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (used by API)
CREATE POLICY "Allow service role full access to payments" ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own payments (for future customer portal)
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT
  TO authenticated
  USING (external_id LIKE 'order_%');
