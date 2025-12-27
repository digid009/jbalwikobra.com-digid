-- ===========================================================================
-- RLS POLICY VERIFICATION SCRIPT
-- ===========================================================================
-- 
-- Run this script to verify that all RLS policies are correctly configured
-- after applying the fix.
--
-- EXPECTED RESULTS:
-- - All public tables should have a policy allowing SELECT to 'anon' role
-- - Admin tables should only allow access to authenticated admins
-- - User-specific tables should only allow access to the owning user
--
-- RUN THIS IN: Supabase SQL Editor
-- ===========================================================================

-- Check website_settings policies
SELECT 
  'website_settings' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'website_settings'
ORDER BY policyname;

-- Check products policies
SELECT 
  'products' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'products'
ORDER BY policyname;

-- Check banners policies
SELECT 
  'banners' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'banners'
ORDER BY policyname;

-- Check flash_sales policies
SELECT 
  'flash_sales' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'flash_sales'
ORDER BY policyname;

-- Check categories policies
SELECT 
  'categories' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'categories'
ORDER BY policyname;

-- Check game_titles policies
SELECT 
  'game_titles' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'game_titles'
ORDER BY policyname;

-- Check storage.objects policies
SELECT 
  'storage.objects' as table_name,
  policyname,
  roles,
  cmd,
  CASE 
    WHEN policyname LIKE '%public%' AND 'anon' = ANY(roles) THEN '[OK] CORRECT'
    WHEN policyname LIKE '%admin%' THEN '[OK] CORRECT'
    WHEN policyname LIKE '%auth%' THEN '[OK] CORRECT'
    ELSE '[!!] CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Summary: Check if anon role has SELECT grants
SELECT 
  'GRANT CHECK: anon role SELECT permissions' as check_type,
  string_agg(table_name, ', ') as tables_with_select
FROM information_schema.role_table_grants
WHERE grantee = 'anon' 
  AND privilege_type = 'SELECT'
  AND table_schema = 'public'
  AND table_name IN (
    'website_settings',
    'products',
    'banners',
    'flash_sales',
    'categories',
    'game_titles',
    'rental_options',
    'reviews',
    'product_likes',
    'feed_posts',
    'feed_comments',
    'feed_post_likes'
  );

-- ===========================================================================
-- EXPECTED OUTPUT SUMMARY
-- ===========================================================================
--
-- Each table should have:
-- 1. A *_public_select policy with 'anon' in roles array → [OK] CORRECT
-- 2. A *_admin_all policy for admin operations → [OK] CORRECT
--
-- If you see [!!] CHECK, review the policy definition
--
-- ANON ROLE GRANT CHECK should list all public tables
-- ===========================================================================

-- Test website_settings access without authentication
-- This should return data if the fix is applied correctly
SELECT 
  'TEST: website_settings SELECT' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '[OK] ACCESSIBLE'
    ELSE '[!!] NOT ACCESSIBLE'
  END as status
FROM website_settings;

-- Count policies per table (should be 2 or more for public tables)
SELECT 
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'website_settings',
    'products',
    'banners',
    'flash_sales',
    'categories',
    'game_titles'
  )
GROUP BY tablename
ORDER BY tablename;

-- ===========================================================================
-- TROUBLESHOOTING
-- ===========================================================================
-- 
-- If policies show [!!] CHECK or NOT ACCESSIBLE:
-- 1. Re-run the COMPLETE_RLS_FIX.sql script
-- 2. Check for syntax errors in the SQL output
-- 3. Verify you're connected to the correct database
-- 4. Clear any cached connections
--
-- ===========================================================================
