-- Storage Policies untuk product-images bucket
-- Jalankan SQL ini di Supabase Dashboard SQL Editor

-- 1. Hapus policies yang mungkin sudah ada (jika ada)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated management" ON storage.objects;

-- 2. Buat policy untuk READ (public access)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 3. Buat policy untuk INSERT (upload)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 4. Buat policy untuk UPDATE/DELETE (authenticated users only)
CREATE POLICY "Allow authenticated management" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 5. Verify policies are created
SELECT 
    policyname, 
    cmd, 
    permissive, 
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
