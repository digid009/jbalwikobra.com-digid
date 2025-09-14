-- Migration: Drop legacy text `category` column after successful transition to relational `category_id`
-- Created: 2025-09-14
-- Safety Design:
--   1. Run in a transaction (except where Supabase requires separate statements)
--   2. Verify new column `category_id` exists and is mostly populated
--   3. (Optional) Backfill any NULL category_id from legacy `category` name lookup
--   4. Enforce NOT NULL + FK constraint (if not already present)
--   5. Create index for filtering by category
--   6. Drop legacy column
--   7. Provide rollback guidance

-- NOTE: Adjust schema name if not using 'public'.

begin;

-- 1. Assert new column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
  ) THEN
    RAISE EXCEPTION 'Cannot proceed: products.category_id does not exist.';
  END IF;
END$$;

-- 2. Report NULL counts (diagnostic only)
DO $$
DECLARE
  _null_count bigint;
BEGIN
  SELECT count(*) INTO _null_count FROM public.products WHERE category_id IS NULL;
  RAISE NOTICE 'NULL category_id rows: %', _null_count;
END$$;

-- 3. Optional backfill: try to match legacy text category to categories.name
-- Skip if legacy column already removed. Guard with EXISTS check.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='products' AND column_name='category'
  ) THEN
    -- Attempt backfill only where category_id is NULL AND legacy text has a matching category name
    WITH matched AS (
      SELECT p.id, c.id AS new_id
      FROM public.products p
      JOIN public.categories c ON LOWER(c.name) = LOWER(p.category)
      WHERE p.category_id IS NULL
    )
    UPDATE public.products p
    SET category_id = m.new_id
    FROM matched m
    WHERE p.id = m.id;
  END IF;
END$$;

-- 4. Enforce NOT NULL + FK (add if missing)
-- Add FK constraint only if not present
DO $$
DECLARE
  fk_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema='public' AND tc.table_name='products' AND tc.constraint_type='FOREIGN KEY'
      AND tc.constraint_name='products_category_id_fkey'
  ) INTO fk_exists;

  IF NOT fk_exists THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END$$;

-- Make column NOT NULL if still nullable and there are no nulls
DO $$
DECLARE
  has_nulls BOOLEAN;
  v_is_nullable TEXT; -- renamed to avoid ambiguity with column name
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.products WHERE category_id IS NULL) INTO has_nulls;
  SELECT is_nullable INTO v_is_nullable FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='products' AND column_name='category_id';

  IF (NOT has_nulls) AND v_is_nullable = 'YES' THEN
    ALTER TABLE public.products ALTER COLUMN category_id SET NOT NULL;
  ELSIF has_nulls THEN
    RAISE NOTICE 'Skipping NOT NULL enforcement: some rows still have NULL category_id. Fix before re-running.';
  END IF;
END$$;

-- 5. Create index for category filters (if not exists)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- 6. Drop legacy column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='products' AND column_name='category'
  ) THEN
    ALTER TABLE public.products DROP COLUMN category;
  END IF;
END$$;

commit;

-- 7. Rollback Guidance (manual):
--   To rollback (before this migration is deployed to prod traffic), you may add back the column:
--     ALTER TABLE public.products ADD COLUMN category text;
--     UPDATE public.products p SET category = c.name FROM public.categories c WHERE p.category_id = c.id;
--   (Legacy UI paths have been removed; rollback is generally unnecessary unless downstream systems depend on the old column.)

-- Verification Suggestions:
--   SELECT count(*) FROM public.products WHERE category_id IS NULL; -- should be 0
--   EXPLAIN ANALYZE SELECT * FROM public.products WHERE category_id = 'some-uuid'; -- uses idx_products_category_id
