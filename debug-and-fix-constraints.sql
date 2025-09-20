-- Debug and fix notification_reads constraints
-- Step 1: Check what constraints actually exist right now
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  att.attname AS column_name,
  fnsp.nspname AS foreign_schema,
  frel.relname AS foreign_table,
  fatt.attname AS foreign_column
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
LEFT JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
LEFT JOIN pg_class frel ON frel.oid = con.confrelid
LEFT JOIN pg_namespace fnsp ON fnsp.oid = frel.relnamespace
LEFT JOIN pg_attribute fatt ON fatt.attrelid = con.confrelid AND fatt.attnum = ANY(con.confkey)
WHERE rel.relname = 'notification_reads'
  AND nsp.nspname = 'public'
ORDER BY con.conname;

-- Step 2: Force drop all possible constraint variations
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Get all foreign key constraints on notification_reads
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'notification_reads' 
          AND nsp.nspname = 'public'
          AND con.contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- Step 3: Also try common constraint names
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;
ALTER TABLE public.notification_reads DROP CONSTRAINT IF EXISTS notification_reads_notification_id_fkey;

-- Step 4: Disable RLS completely
ALTER TABLE public.notification_reads DISABLE ROW LEVEL SECURITY;

-- Step 5: Drop all policies
DROP POLICY IF EXISTS "Users can read their own notification reads" ON public.notification_reads;
DROP POLICY IF EXISTS "Users can insert their own notification reads" ON public.notification_reads;
DROP POLICY IF EXISTS "Users can update their own notification reads" ON public.notification_reads;

-- Step 6: Verify everything is gone
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'notification_reads'
  AND nsp.nspname = 'public'
  AND con.contype = 'f';
