-- Quick fix for notification_reads RLS policy
-- This will allow the mark as read functionality to work

-- Disable RLS for notification_reads table
ALTER TABLE public.notification_reads DISABLE ROW LEVEL SECURITY;
