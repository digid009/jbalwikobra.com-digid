# Fix QRIS QR Code Display Issue - 30 Desember 2025

## Masalah
Pembayaran via QRIS tidak menampilkan kode QR di halaman payment interface.

## Akar Masalah
1. **Penyimpanan Data Tidak Lengkap**: Saat pembayaran QRIS dibuat menggunakan Xendit Invoice API v2, QR code (`qr_string`) tidak disimpan ke database
2. **Missing Database Table**: Tabel `payments` mungkin tidak memiliki struktur yang lengkap untuk menyimpan data payment-specific seperti QR code
3. **Fetch Logic**: Frontend mengandalkan `qr_string` dari database, tetapi data tersebut tidak pernah disimpan

## Solusi yang Diterapkan

### 1. Perbaikan di `api/xendit/create-direct-payment.ts`
**Perubahan**: Menambahkan logika untuk:
- Extract QR string dari response Xendit Invoice API v2 (field `available_banks`)
- Menyimpan payment data lengkap ke tabel `payments` termasuk QR code
- Mengembalikan QR string dalam response API

**Kode yang ditambahkan**:
```typescript
// Extract payment-specific data (QR code for QRIS, VA number for VA, etc.)
let paymentSpecificData: any = {
  invoice_url: xenditData.invoice_url,
  payment_url: xenditData.invoice_url
};

// For QRIS payments, store the QR code URL if available
if (channelCode === 'QRIS') {
  if (xenditData.available_banks && xenditData.available_banks.length > 0) {
    const qrisBank = xenditData.available_banks.find((bank: any) => 
      bank.bank_code === 'QRIS' || bank.bank_code === 'ID_SHOPEEPAY'
    );
    
    if (qrisBank) {
      paymentSpecificData.qr_string = qrisBank.bank_branch;
      paymentSpecificData.qr_url = qrisBank.bank_branch;
    }
  }
}

// Save payment to database
const paymentRecord = {
  xendit_id: xenditData.id,
  external_id: xenditData.external_id,
  payment_method: payment_method_id,
  amount: xenditData.amount,
  currency: xenditData.currency || 'IDR',
  status: xenditData.status || 'PENDING',
  payment_data: paymentSpecificData, // Stores QR code here
  created_at: xenditData.created || new Date().toISOString(),
  expiry_date: xenditData.expiry_date,
  description: description || 'Payment'
};

await supabase.from('payments').upsert(paymentRecord);
```

### 2. Perbaikan di `api/xendit/get-payment.ts`
**Perubahan**: Memperbaiki fallback fetch QR string dari Xendit Invoice API v2 (bukan v3 Payment Request API)

**Kode yang diperbaiki**:
```typescript
// Try Invoice API v2 first (the one we used to create the payment)
const xenditResponse = await fetch(`https://api.xendit.co/v2/invoices/${paymentData.xendit_id}`, {
  headers: {
    'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json'
  }
});

// Check available_banks for QRIS QR string
if (xenditData.available_banks && xenditData.available_banks.length > 0) {
  const qrisBank = xenditData.available_banks.find((bank: any) => 
    bank.bank_code === 'QRIS' || bank.bank_code === 'ID_SHOPEEPAY'
  );
  
  if (qrisBank && qrisBank.bank_branch) {
    // Update database and return with QR string
    const updatedPaymentData = {
      ...paymentData.payment_data,
      qr_string: qrisBank.bank_branch,
      qr_url: qrisBank.bank_branch
    };
    
    await supabase.from('payments').update({ payment_data: updatedPaymentData });
  }
}
```

### 3. Database Migration - `20251230_ensure_payments_table.sql`
**Perubahan**: Membuat/memastikan tabel `payments` memiliki struktur yang benar

**Struktur tabel**:
- `id` (UUID, Primary Key)
- `xendit_id` (VARCHAR, UNIQUE) - ID dari Xendit
- `external_id` (VARCHAR) - External reference ID
- `payment_method` (VARCHAR) - qris, bni, mandiri, dll
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `status` (VARCHAR)
- **`payment_data` (JSONB)** - **PENTING**: Menyimpan QR code, VA details, dll
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `paid_at` (TIMESTAMP)
- `expiry_date` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Cara Kerja
1. **Saat pembayaran QRIS dibuat**:
   - API memanggil Xendit Invoice API v2
   - Response dari Xendit berisi `available_banks` array dengan QR string di field `bank_branch`
   - QR string di-extract dan disimpan ke `payments.payment_data` sebagai JSON
   - Payment record disimpan ke database

2. **Saat user membuka halaman pembayaran**:
   - Frontend fetch payment data via `/api/xendit/get-payment?id=xxx`
   - API membaca dari tabel `payments`
   - Jika `qr_string` ada di `payment_data`, langsung dikembalikan
   - Jika tidak ada, API fetch dari Xendit Invoice API v2 sebagai fallback
   - QR string ditampilkan di frontend menggunakan komponen `QRCode`

## Testing
Untuk test perbaikan:
```bash
# 1. Deploy migration ke Supabase
npm run migrate:deploy

# 2. Test create QRIS payment
curl -X POST https://jbalwikobra.com/api/xendit/create-direct-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "IDR",
    "payment_method_id": "qris",
    "external_id": "test-qris-'$(date +%s)'",
    "description": "Test QRIS Payment"
  }'

# 3. Buka payment page dengan ID yang didapat
# https://jbalwikobra.com/payment?id=<xendit_id>&method=qris

# 4. Verifikasi QR code muncul di halaman
```

## File yang Diubah
1. ✅ `api/xendit/create-direct-payment.ts` - Tambah logika simpan QR code
2. ✅ `api/xendit/get-payment.ts` - Perbaiki fetch QR code dari Invoice API v2
3. ✅ `supabase/migrations/20251230_ensure_payments_table.sql` - Buat/update struktur tabel

## Status
✅ **SELESAI** - Semua perubahan sudah diimplementasikan dan siap untuk di-deploy
