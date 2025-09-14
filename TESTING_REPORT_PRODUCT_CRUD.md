# 🧪 TESTING GUIDE: Product CRUD dengan Gambar

## ✅ Status Testing
- **Database CRUD Operations**: ✅ BERHASIL (Direct Supabase)
- **Create Product**: ✅ BERHASIL dengan 3 gambar
- **Update Product**: ✅ BERHASIL dengan 4 gambar  
- **Delete Product**: ✅ BERHASIL
- **Server Status**: ✅ BERJALAN di http://localhost:3000

## 📋 Test Results Summary

### 1. Database Connection Test
```
✅ Found 2 categories
   - 2542be0b-ad29-460d-9c83-0c90fae0601a: Akun
   - 840e1abe-ef35-4e8d-b6a5-6ea7d35a2db6: Lain-Lain

✅ Found 4 game titles
   - b1d4e6e2-774a-4f00-9a66-e019d8566841: Free Fire
   - 6df60d8d-65ec-482f-ba35-afc290b1ecec: Mobile Legends
   - 78a5a712-f1ad-4ce3-856e-75a518c90da0: Roblox
   - 718f3ff5-585f-4a10-83b1-f38de84dcf15: Japost Akun

✅ Found 3 tiers
   - ffd8c073-ec77-4ce8-8aee-a70ddaa8ab2f: Reguler
   - 21cc6bca-5732-4da0-bef7-1597187c287c: Pelajar
   - f6c13c11-c982-45df-924b-c1b5a57cc7e3: Premium
```

### 2. Create Product Test
```
✅ Product created successfully!
📋 Created product details:
   - ID: fbc52828-a640-4f30-9f2c-25f026de1302
   - Name: Test Game Account - ML Legend
   - Price: Rp 150.000
   - Images: 3 photos
   - Active: true
```

### 3. Update Product Test
```
✅ Product updated successfully!
📋 Updated product details:
   - ID: fbc52828-a640-4f30-9f2c-25f026de1302
   - Name: Test Game Account - ML Mythic (UPDATED)
   - Price: Rp 250.000
   - Images: 4 photos (updated from 3 to 4)
   - Active: true
```

## 🎯 Manual Testing via Browser

Karena ini adalah aplikasi React dengan UI, testing terbaik dilakukan melalui browser:

### Akses Admin Panel
1. Buka browser ke: **http://localhost:3000**
2. Login sebagai admin (jika diperlukan)
3. Navigasi ke halaman **Products** atau **Admin Dashboard**

### Test Create Product dengan Gambar
1. Klik tombol **"Add Product"** atau **"Create New Product"**
2. Isi form dengan data:
   ```
   Name: Test Game Account - Free Fire Elite
   Description: Akun Free Fire rank Elite dengan skin rare
   Price: 350000
   Original Price: 450000
   Category: Akun
   Game Title: Free Fire
   Tier: Pelajar
   ```
3. **Upload Gambar**:
   - Upload 1 gambar untuk cover/thumbnail
   - Upload 3-4 gambar untuk gallery
   - Test dengan format JPG, PNG, WebP
4. Klik **Save** atau **Create**
5. Verifikasi produk berhasil dibuat dengan gambar

### Test Update Product dengan Gambar
1. Buka produk yang sudah dibuat
2. Klik **Edit** atau **Update**
3. Update data:
   ```
   Name: Test Game Account - Free Fire Heroic (UPDATED)
   Price: 500000
   Description: Update description
   ```
4. **Test Update Gambar**:
   - Ganti gambar cover
   - Tambah gambar baru ke gallery
   - Hapus beberapa gambar lama
   - Upload gambar dengan ukuran berbeda
5. Klik **Save Changes**
6. Verifikasi update berhasil dengan gambar ter-update

### Test Delete Product
1. Pilih produk test
2. Klik **Delete** atau **Remove**
3. Konfirmasi penghapusan
4. Verifikasi produk dan gambar terhapus

## 🔧 Technical Details

### Database Schema (products table)
```
Available columns:
- id (UUID, Primary Key)
- name (String, Required)
- description (Text, Required)  
- price (Number, Required)
- original_price (Number, Optional)
- image (String, Cover image URL)
- images (Array, Gallery image URLs)
- category_id (UUID, Foreign Key)
- game_title_id (UUID, Foreign Key)
- tier_id (UUID, Foreign Key)
- is_flash_sale (Boolean)
- has_rental (Boolean)
- stock (Number)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- archived_at (Timestamp, Nullable)
```

### Image Handling
- ✅ Support multiple images (array)
- ✅ Cover image + gallery images
- ✅ URL validation (no blob: URLs)
- ✅ External image URLs supported
- 📝 File upload should go through proper storage service

### Available Test Scripts
```bash
# Test database CRUD operations directly
node test-product-crud.js

# Test products fetch
node test-products-fetch.js

# Check database schema
node check-schema.js

# Test API endpoints (limited)
node test-endpoints.js
```

## 🎉 Conclusion

**✅ SEMUA FUNGSI CRUD BERJALAN DENGAN BAIK!**

- **Create**: ✅ Berhasil membuat produk dengan multiple images
- **Read**: ✅ Berhasil fetch produk dengan relasi (categories, game_titles, tiers)
- **Update**: ✅ Berhasil update produk dan images
- **Delete**: ✅ Berhasil hapus produk

**🌟 Server development sudah siap untuk testing manual via browser!**

Silakan lakukan testing tambahan melalui UI di http://localhost:3000 untuk memastikan semua fungsi admin panel berjalan dengan baik.
