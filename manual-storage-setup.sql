-- Manual Storage Policies Setup
-- Copy and paste this entire content to Supabase SQL Editor
-- Or run: psql -h your-host -U postgres -d postgres -f manual-storage-setup.sql

-- Method 1: Make bucket public (Simplest)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- Method 2: Create comprehensive RLS policies
CREATE POLICY IF NOT EXISTS "product_images_select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

-- Verify policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND qual LIKE '%product-images%'
ORDER BY policyname;

-- Test query (should return bucket info)
SELECT * FROM storage.buckets WHERE id = 'product-images';
