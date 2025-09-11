-- Create admin_notifications table
-- This table stores notifications for admin users about system events

CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_order', 'paid_order', 'cancelled_order', 'new_user', 'new_review')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);

-- Enable Row Level Security
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users only
CREATE POLICY "Admin users can manage admin notifications" 
ON public.admin_notifications 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);

-- Insert some sample notifications
INSERT INTO public.admin_notifications (type, title, message, created_at, is_read) VALUES
('new_order', 'New Order Received', 'A new order has been placed by a customer', NOW() - INTERVAL '1 hour', false),
('paid_order', 'Payment Confirmed', 'Payment has been received for order', NOW() - INTERVAL '2 hours', false),
('new_user', 'New User Registration', 'A new user has registered on the platform', NOW() - INTERVAL '3 hours', true),
('new_review', 'New Product Review', 'A customer has left a review for a product', NOW() - INTERVAL '4 hours', true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_admin_notifications_updated_at
    BEFORE UPDATE ON public.admin_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
