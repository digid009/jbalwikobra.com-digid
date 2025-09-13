-- Create notification tables and RPC functions for proper notification management
-- This fixes the "mark as read" functionality

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,  -- null for global notifications
  type TEXT NOT NULL CHECK (type IN ('product', 'feed_post', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_reads table for tracking read status of global notifications
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID,
  customer_name TEXT,
  product_name TEXT,
  amount BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- RPC function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(n_id UUID, u_id UUID)
RETURNS VOID AS $$
BEGIN
  -- If this is a user-specific notification, update is_read directly
  UPDATE notifications 
  SET is_read = TRUE 
  WHERE id = n_id AND user_id = u_id;
  
  -- If this is a global notification (user_id is null), insert into notification_reads
  INSERT INTO notification_reads (notification_id, user_id)
  SELECT n_id, u_id
  WHERE EXISTS (
    SELECT 1 FROM notifications 
    WHERE id = n_id AND user_id IS NULL
  )
  ON CONFLICT (notification_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(u_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Mark all user-specific notifications as read
  UPDATE notifications 
  SET is_read = TRUE 
  WHERE user_id = u_id AND is_read = FALSE;
  
  -- For all global notifications that aren't already marked as read by this user
  INSERT INTO notification_reads (notification_id, user_id)
  SELECT n.id, u_id
  FROM notifications n
  WHERE n.user_id IS NULL 
    AND NOT EXISTS (
      SELECT 1 FROM notification_reads nr 
      WHERE nr.notification_id = n.id AND nr.user_id = u_id
    )
  ON CONFLICT (notification_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(u_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_specific_count INTEGER;
  global_unread_count INTEGER;
BEGIN
  -- Count unread user-specific notifications
  SELECT COUNT(*)::INTEGER INTO user_specific_count
  FROM notifications 
  WHERE user_id = u_id AND is_read = FALSE;
  
  -- Count global notifications that haven't been marked as read by this user
  SELECT COUNT(*)::INTEGER INTO global_unread_count
  FROM notifications n
  WHERE n.user_id IS NULL 
    AND NOT EXISTS (
      SELECT 1 FROM notification_reads nr 
      WHERE nr.notification_id = n.id AND nr.user_id = u_id
    );
  
  RETURN COALESCE(user_specific_count, 0) + COALESCE(global_unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "notifications_read_policy" ON notifications;
CREATE POLICY "notifications_read_policy" ON notifications FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  user_id IS NULL OR 
  auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Create RLS policies for notification_reads
DROP POLICY IF EXISTS "notification_reads_all_policy" ON notification_reads;
CREATE POLICY "notification_reads_all_policy" ON notification_reads FOR ALL
TO authenticated
USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Create RLS policies for admin_notifications
DROP POLICY IF EXISTS "admin_notifications_read_policy" ON admin_notifications;
CREATE POLICY "admin_notifications_read_policy" ON admin_notifications FOR SELECT
TO authenticated
USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "admin_notifications_all_policy" ON admin_notifications;
CREATE POLICY "admin_notifications_all_policy" ON admin_notifications FOR ALL
TO authenticated
USING (auth.role() = 'service_role');

-- Create some test notifications for development
INSERT INTO notifications (type, title, body, link_url, user_id) VALUES
('system', 'Selamat datang!', 'Terima kasih telah bergabung dengan JB Alwikobra', '/profile', NULL),
('product', 'Produk Baru Tersedia', 'Cek akun Mobile Legends terbaru kami!', '/products', NULL)
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Notification schema setup completed successfully' AS status;
