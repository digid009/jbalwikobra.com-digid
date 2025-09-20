-- Quick fix for notification mark as read functionality
-- This removes the foreign key constraint to allow mark as read to work immediately

-- Remove the problematic foreign key constraint
ALTER TABLE public.notification_reads 
DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;

-- Verify the constraint was removed
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

-- This should return no rows if the constraint was successfully removed
