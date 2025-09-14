# 🔧 STORAGE POLICY SETUP GUIDE

## ❌ MASALAH YANG DITEMUKAN:
**Row Level Security (RLS) Policy memblokir upload ke bucket `product-images`**

Error: `new row violates row-level security policy`

## ✅ SOLUSI: Tambahkan Storage Policies

### 1. Akses Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Pilih project: **Database-JBAlwikobra**
3. Go to **Storage** → **Policies**

### 2. Buat Policy untuk Upload (INSERT)

**Policy Name**: `Allow public uploads to product-images`

**Policy Type**: `INSERT`

**Target Roles**: `public, authenticated`

**Using Expression**:
```sql
true
```

**Check Expression**:
```sql
bucket_id = 'product-images'
```

### 3. Buat Policy untuk Read (SELECT)

**Policy Name**: `Allow public read from product-images`

**Policy Type**: `SELECT`

**Target Roles**: `public, authenticated`

**Using Expression**:
```sql
bucket_id = 'product-images'
```

### 4. Buat Policy untuk Update/Delete (Optional untuk Admin)

**Policy Name**: `Allow authenticated updates to product-images`

**Policy Type**: `UPDATE, DELETE`

**Target Roles**: `authenticated`

**Using Expression**:
```sql
bucket_id = 'product-images'
```

## 📋 SQL Commands (Alternative)

Jika Anda prefer menggunakan SQL Editor di Supabase:

```sql
-- Policy untuk READ (public access)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy untuk INSERT (upload)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Policy untuk UPDATE (optional)
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy untuk DELETE (optional)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## 🧪 Test Setelah Setup

Jalankan command ini untuk verify fix:
```bash
node test-upload-flow.js
```

Expected result:
```
✅ Upload to bucket: SUCCESS
✅ Public URL generation: SUCCESS  
✅ File verification: SUCCESS
✅ Cleanup: SUCCESS
```

## 🔐 Security Considerations

### Production Recommendations:
1. **Ganti public dengan authenticated**: Hanya user login yang bisa upload
2. **Tambahkan file size limits**: Batasi ukuran file
3. **Tambahkan file type validation**: Hanya izinkan image types
4. **Rate limiting**: Batasi jumlah upload per user/waktu

### Policy Production yang Lebih Secure:
```sql
-- Hanya authenticated users yang bisa upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
  AND lower(storage.extension(name)) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);
```

## 📝 Next Steps

1. ✅ Setup storage policies di Supabase Dashboard
2. ✅ Test upload functionality: `node test-upload-flow.js`
3. ✅ Test admin panel di browser: http://localhost:3000
4. ✅ Verify product creation with images works
5. ✅ Test product detail pages work properly

---

**Setelah setup policies, kedua masalah akan teratasi:**
- ✅ Detail Product Page: FIXED
- ✅ Upload Gambar: WILL BE FIXED after policy setup
