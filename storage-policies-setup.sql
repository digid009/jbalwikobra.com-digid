-- 🔧 STORAGE POLICIES SQL SETUP
-- Copy-paste script ini ke Supabase Dashboard → SQL Editor

-- =====================================
-- 1. HAPUS POLICIES LAMA (jika ada)
-- =====================================

-- Hapus policies lama untuk bucket product-images (jika ada)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated management" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for product-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for product-images" ON storage.objects;

-- =====================================
-- 2. BUAT POLICIES BARU
-- =====================================

-- Policy untuk READ (public dapat melihat gambar)
CREATE POLICY "product_images_read_policy" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Policy untuk INSERT (public dapat upload gambar)
CREATE POLICY "product_images_insert_policy" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Policy untuk UPDATE (authenticated users dapat update)
CREATE POLICY "product_images_update_policy" ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy untuk DELETE (authenticated users dapat delete)
CREATE POLICY "product_images_delete_policy" ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- =====================================
-- 3. PASTIKAN BUCKET PUBLIC
-- =====================================

-- Update bucket product-images menjadi public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- =====================================
-- 4. VERIFICATION QUERIES
-- =====================================

-- Cek apakah policies sudah dibuat
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product_images%'
ORDER BY policyname;

-- Cek status bucket
SELECT id, name, public, created_at, updated_at
FROM storage.buckets 
WHERE id = 'product-images';

-- =====================================
-- 🎯 EXPECTED RESULTS
-- =====================================

-- Setelah menjalankan script ini:
-- ✅ 4 policies untuk product-images bucket
-- ✅ Bucket product-images menjadi public
-- ✅ Upload dari frontend akan berhasil
-- ✅ Images dapat diakses secara public

-- =====================================
-- 📋 CARA MENJALANKAN
-- =====================================

-- 1. Buka Supabase Dashboard
-- 2. Pilih project: Database-JBAlwikobra  
-- 3. Go to SQL Editor
-- 4. Copy-paste script ini
-- 5. Klik "Run"
-- 6. Cek hasil verification queries

-- =====================================
-- 🧪 TEST SETELAH SETUP
-- =====================================

-- Jalankan command ini di terminal:
-- node test-upload-flow.js

-- Expected result:
-- ✅ Upload to bucket: SUCCESS
-- ✅ Public URL generation: SUCCESS
-- ✅ File verification: SUCCESS
-- ✅ Cleanup: SUCCESS
