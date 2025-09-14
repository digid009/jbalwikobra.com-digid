# Migration: Drop Legacy `category` Column From `products`

This migration finalizes the transition from the old free-text `category` field to the relational `category_id` foreign key.

## Files
- `migrations/2025-09-14_drop_legacy_category.sql` – Safe, idempotent (defensively checked) script.

## What the SQL Does
1. Verifies `category_id` column exists.
2. Logs how many rows (if any) still have `NULL category_id`.
3. (If legacy `category` column still exists) attempts a best-effort backfill by matching `LOWER(products.category)` to `LOWER(categories.name)` where `category_id` is NULL.
4. Adds the foreign key constraint `products_category_id_fkey` if missing.
5. Sets `category_id` to NOT NULL only if there are no NULL values.
6. Ensures an index `idx_products_category_id` exists for filtering.
7. Drops the legacy `category` text column if present.
8. Provides rollback guidance.

## Pre-Run Checklist
- [ ] Confirm application code no longer references `products.category` (already refactored).
- [ ] Ensure all newly created products are writing valid `category_id` values.
- [ ] (Optional) Run a dry-run query to see NULL distribution:
  ```sql
  SELECT count(*) AS null_category_id FROM public.products WHERE category_id IS NULL;
  SELECT category, count(*) FROM public.products WHERE category_id IS NULL GROUP BY 1;
  ```

## Running the Migration (Supabase SQL editor or psql)
Copy-paste the contents of the SQL file and execute. The script is wrapped in a transaction and will abort on critical precondition failure.

## Post-Run Verification
```sql
-- Should be zero
SELECT count(*) FROM public.products WHERE category_id IS NULL;

-- Confirm FK works (should return 0 rows)
SELECT p.* FROM public.products p LEFT JOIN public.categories c ON p.category_id = c.id WHERE c.id IS NULL;

-- Confirm column is gone
SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='category';

-- Check index usage
EXPLAIN ANALYZE SELECT id FROM public.products WHERE category_id = 'REPLACE-WITH-AN-EXISTING-CATEGORY-UUID';
```

## Rollback (If Absolutely Needed Before Traffic)
```sql
ALTER TABLE public.products ADD COLUMN category text;
UPDATE public.products p SET category = c.name FROM public.categories c WHERE p.category_id = c.id;
```
Note: Since the codebase no longer reads `category`, rollback is rarely necessary.

## Operational Notes
- If NULL `category_id` rows remain, fix them manually (assign a valid category or delete orphan rows) then re-run only the NOT NULL enforcement block:
  ```sql
  ALTER TABLE public.products ALTER COLUMN category_id SET NOT NULL;
  ```
- If the backfill didn’t map some legacy values, check for spelling or casing inconsistencies.

## Next Steps (Optional Enhancements)
- Add a uniqueness constraint on `categories.name` if business logic requires it.
- Add RLS policies ensuring users can only see products within allowed categories (see `RLS_POLICY_FIX_GUIDE.md`).

---
Migration complete: the schema is now fully normalized regarding categories.
