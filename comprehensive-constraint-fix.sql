-- Comprehensive fix for notification_reads constraints
-- This will remove ALL foreign key constraints on the table

-- First, check what constraints actually exist
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  kcu.referenced_table_name,
  kcu.referenced_column_name
FROM 
  information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE 
  tc.table_name = 'notification_reads' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Drop all possible foreign key constraint names that might exist
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey1;
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS fk_notification_reads_user_id;
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_fkey;

-- Also drop the notification_id foreign key constraint temporarily for testing
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_notification_id_fkey;
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS fk_notification_reads_notification_id;

-- Disable RLS as well
ALTER TABLE public.notification_reads DISABLE ROW LEVEL SECURITY;

-- Verify all constraints are gone
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  kcu.referenced_table_name,
  kcu.referenced_column_name
FROM 
  information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE 
  tc.table_name = 'notification_reads' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY';
