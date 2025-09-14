# Product CRUD Modal Redesign (v2.3.1)

Tanggal: 2025-09-14

## Ringkasan
Redesign UI/UX form Product CRUD agar konsisten dengan design system (glass / blur + soft neon borders) dan meniru struktur referensi: grid tiga kolom atas (Name, Game Title, Tier), deskripsi penuh, lalu baris pricing. Image uploader (15 slot) dan rental options dipisah menjadi komponen modular.

## Perubahan Utama
- `ProductDetailsForm.tsx` direfaktor total: layout bersih, hilangkan duplikasi lama, textarea untuk deskripsi, konsistensi kelas Tailwind.
- `ProductImagesUpload.tsx` border & overlay tone diperhalus (border-white/15, hover pink/40, overlay lebih gelap).
- Komponen baru: `ProductRentalOptions.tsx` (opsi rental baru) + perbaikan `RentalOptionsForm.tsx` lama agar sesuai tipe data (`duration`, `price`).
- Aksesibilitas: tombol toggle rental diberi `aria-label` & `role="switch"`.
- Validasi: batas maksimal images (15) & rental options (5).

## Tipe Data Rental
Menyesuaikan tipe `RentalOption` (id, duration, price, description?). Field lama `qty` & `type` disederhanakan menjadi string `duration` (contoh: "6 Hours", "2 Days").

## Langkah Integrasi
1. Pastikan state parent menyimpan `rentalOptions: RentalOption[]` dan `hasRental` / `rentalEnabled` bila diperlukan.
2. Render `ProductRentalOptions` setelah image uploader di modal.
3. Pastikan backend menerima field `rentalOptions` dengan struktur baru.

## Next Steps (Opsional)
- Tambahkan drag & drop reordering untuk rental options (paritas dengan image drag).
- Extract shared input styling ke util / component design system.
- Tambahkan inline error feedback (misal price kosong) alih-alih `alert`.
- Integrasi upload nyata (Supabase storage / S3) menggantikan `URL.createObjectURL`.

## QA Checklist
- Build sukses (CRA build OK).
- Tidak ada error TypeScript pada file yang diubah.
- Maksimum 15 gambar mencegah overflow.
- Harga otomatis memformat saat input (rental + price utama).

--
Generated automatically by Copilot redesign task.
