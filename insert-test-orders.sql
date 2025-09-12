-- Insert test orders directly with SQL
-- This bypasses RLS policies

INSERT INTO orders (id, user_id, status, amount, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'pending',
  150000,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'completed',
  250000,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'cancelled',
  75000,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'processing',
  320000,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  'completed',
  180000,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Verify orders were created
SELECT 
  id,
  user_id,
  status,
  amount,
  created_at
FROM orders
ORDER BY created_at DESC;
