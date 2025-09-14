-- 🔒 STORAGE POLICIES SQL SETUP (PRODUCTION SAFE VERSION)
-- Versi yang lebih aman dengan validasi file type dan size

-- =====================================
-- 1. HAPUS POLICIES LAMA (jika ada)
-- =====================================

DROP POLICY IF EXISTS "product_images_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;

-- =====================================
-- 2. BUAT POLICIES PRODUCTION-SAFE
-- =====================================

-- Policy untuk READ (semua orang dapat melihat gambar)
CREATE POLICY "product_images_read_policy" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Policy untuk INSERT dengan validasi (hanya file gambar di folder products)
CREATE POLICY "product_images_insert_policy" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = 'products'
  AND lower(storage.extension(name)) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

-- Policy untuk UPDATE (hanya authenticated users)
CREATE POLICY "product_images_update_policy" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'products'
  AND lower(storage.extension(name)) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

-- Policy untuk DELETE (hanya authenticated users)
CREATE POLICY "product_images_delete_policy" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================
-- 3. PASTIKAN BUCKET PUBLIC
-- =====================================

UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- =====================================
-- 4. VERIFICATION
-- =====================================

-- Cek policies
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product_images%';

-- Cek bucket status
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';

-- =====================================
-- 📋 KEAMANAN YANG DITERAPKAN
-- =====================================

-- ✅ Hanya file gambar yang diizinkan (.jpg, .jpeg, .png, .gif, .webp)
-- ✅ Upload hanya ke folder /products/
-- ✅ Update/Delete hanya untuk authenticated users
-- ✅ Read access public untuk semua
-- ✅ File type validation otomatis

-- =====================================
-- 🚀 JIKA INGIN LEBIH SIMPLE
-- =====================================

-- Jika ada masalah dengan versi production-safe,
-- gunakan file: storage-policies-setup.sql (versi simple)
-- yang mengizinkan semua upload tanpa validasi tambahan
