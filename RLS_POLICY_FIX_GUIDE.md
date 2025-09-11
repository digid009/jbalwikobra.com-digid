# RLS Policy Fix for Banners and Feed Posts

## Problem Identified ✅
The issue is **Row Level Security (RLS) policies** blocking frontend access to the `banners` table. The data exists but policies prevent the anon key from reading it.

## Current Status:
- ✅ **Feed posts are working** (3 posts accessible)
- ❌ **Banners are blocked** (0 accessible despite data existing)

## Solution: Run these SQL commands in Supabase SQL Editor

### 1. Fix Banners Table Policies

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;

-- Create permissive policy for public access
CREATE POLICY "banners_public_read" ON public.banners
  FOR SELECT
  TO anon, authenticated
  USING (true);  -- Allow all banners to be read

-- Ensure RLS is enabled but not blocking
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Grant explicit permissions
GRANT SELECT ON public.banners TO anon;
GRANT SELECT ON public.banners TO authenticated;
```

### 2. Verify Feed Posts Policies (working, but ensure consistency)

```sql
-- Ensure feed_posts policy is correct
DROP POLICY IF EXISTS "feed_posts_public_read" ON public.feed_posts;

CREATE POLICY "feed_posts_public_read" ON public.feed_posts
  FOR SELECT
  TO anon, authenticated
  USING (is_deleted = false);

-- Ensure permissions
GRANT SELECT ON public.feed_posts TO anon;
GRANT SELECT ON public.feed_posts TO authenticated;
```

### 3. Alternative: Disable RLS for Public Tables (Quick Fix)

If the above doesn't work, you can temporarily disable RLS:

```sql
-- Disable RLS for banners (makes it fully public)
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for feed_posts since it's working
-- ALTER TABLE public.feed_posts DISABLE ROW LEVEL SECURITY;
```

## Steps to Fix:

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and paste** the SQL commands above
3. **Run the banners policy fix** first
4. **Test the frontend** to see if banners appear
5. If still not working, try the **RLS disable** approach

## Expected Results After Fix:

- ✅ Banners should show: "TOPUP MURAH", "Saluran Whatsapp"
- ✅ Feed posts should continue working
- ✅ Frontend banner carousel should display data
- ✅ Feed page should show 3 posts

## Technical Explanation:

The frontend uses the **anon key** which requires RLS policies to explicitly allow access. Without proper policies, even public data is blocked. The feed_posts table already has working policies, but banners table needs the same treatment.
