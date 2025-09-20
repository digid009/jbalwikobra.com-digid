-- Fix for notification mark as read functionality
-- Issue: Foreign key constraint mismatch between notification_reads.user_id and auth vs custom users

-- Step 1: Remove the problematic foreign key constraint that references auth.users
ALTER TABLE public.notification_reads 
DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;

-- Step 2: Add a new foreign key constraint that references our custom users table
-- This ensures data integrity while allowing our custom auth system to work
ALTER TABLE public.notification_reads
ADD CONSTRAINT notification_reads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 3: Verify the constraint was updated correctly
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

-- This should now show that user_id references public.users(id) instead of auth.users(id)
