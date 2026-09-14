# FLORANCE — Digital Store

> "Semua Kebutuhan Digital, Dalam Satu Tempat."

FLORANCE adalah marketplace digital store modern, premium, dan elegan untuk transaksi pulsa, paket data all-operator, sewa bot WhatsApp, source code bot WhatsApp siap pakai, token listrik PLN, voucher game, dan layanan cloud/VPS.

Dilengkapi dengan integrasi payment gateway **QRIS Dinamis (BuatQris)** dengan verifikasi tanda tangan kriptografi **HMAC-SHA256**, sistem **Idempotency** anti-transaksi ganda, perlindungan status pembayaran server-side, serta asisten cerdas **Florance AI ✦** dan layanan **Customer Service Verified**.

---

## 1. Installation

Pastikan Node.js v18+ atau v20+ telah terinstal di sistem Anda.

```bash
# Clone repository
git clone https://github.com/your-username/florance-digital-store.git
cd florance-digital-store

# Install dependencies
npm install
```

---

## 2. Development

Jalankan server pengembangan lokal (Express + Vite hot-mode):

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

Untuk menjalankan test suite pengujian keamanan dan validasi (16 skenario uji TDD):

```bash
npm test
```

---

## 3. Environment Variables

Buat file `.env` di root proyek (atau atur di panel Environment Variables Vercel). **JANGAN PERNAH** memasukkan credential rahasia ke kode klien atau commit ke Git:

```env
# URL Host Aplikasi
APP_URL=https://florance-store.vercel.app

# Google Gemini AI Assistant
GEMINI_API_KEY=your_gemini_api_key_here
AI_API_KEY=your_gemini_api_key_here

# BuatQris Payment Gateway
BUATQRIS_BASE_URL=https://api.buatqris.site
BUATQRIS_ACCOUNT_ID=your_buatqris_account_id
BUATQRIS_SECRET_TOKEN=your_buatqris_secret_token
```

> ⚠️ **PENTING**: `BUATQRIS_SECRET_TOKEN` hanya diproses di server-side (`server.ts`, Route Handlers). Klien browser tidak pernah menerima atau mengetahui token rahasia ini.

---

## 4. Database Setup

Sistem penyimpanan data pesanan (`orders`) dan tabel event webhook (`webhook_events`) berjalan secara presisten:
- **Lokal & Container**: Tersimpan di `data/florance-db.json` dengan penulisan atomik.
- **Serverless / Vercel**: Dapat langsung dihubungkan ke database serverless seperti Supabase, Neon PostgreSQL, atau Upstash Redis tanpa mengubah antarmuka `src/lib/db.ts`.

Skema Order:
- `id`, `invoice` (`FLR-YYYYMMDD-XXXXXX`), `userId`, `userName`, `userEmail`, `targetAccount`
- `productId`, `variantId`, `amount`, `adminFee`, `totalAmount`
- `paymentStatus` (`PENDING`, `PAID`, `FAILED`, `EXPIRED`)
- `gatewayTransactionId`, `qrUrl`, `createdAt`, `paidAt`, `expiredAt`
- `fulfillmentStatus`, `fulfillmentData` (Serial Number / Token 20 Digit / Lisensi Bot)

Tabel Idempotency `webhook_events`:
- `id`, `event_id` (UNIQUE), `transaction_id`, `processed_at`, `created_at`

---

## 5. BuatQris Setup

1. Daftar akun merchant di [BuatQris](https://buatqris.site).
2. Dapatkan `ACCOUNT_ID` dan `SECRET_TOKEN` dari dashboard merchant Anda.
3. Masukkan ke environment variable `BUATQRIS_ACCOUNT_ID` dan `BUATQRIS_SECRET_TOKEN`.
4. Metode QRIS yang digunakan: `qris_two`.
5. UMKM Name: `Florance`.

---

## 6. Webhook Setup

1. Pada dashboard BuatQris, arahkan Callback / Webhook URL ke:
   ```
   https://domain-anda.vercel.app/api/webhooks/buatqris
   ```
2. Webhook Florance secara ketat memvalidasi:
   - Header `X-BuatQris-Signature` menggunakan algoritma **HMAC-SHA256** dan `crypto.timingSafeEqual`
   - Header `X-BuatQris-Delivery` untuk memastikan **Idempotency** (menolak event ganda)
   - Pencocokan nominal (`order.totalAmount === webhook.amount`) untuk mencegah manipulasi
   - Perlindungan status pesanan yang sudah `PAID` agar tidak dapat di-downgrade.

---

## 7. Vercel Deployment

Proyek ini telah dikonfigurasi dengan standar Next.js App Router dan Express / Vite fullstack:

1. Push kode ke repository GitHub/GitLab Anda.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New Project**.
3. Import repository Florance.
4. Masukkan Environment Variables:
   - `BUATQRIS_BASE_URL`: `https://api.buatqris.site`
   - `BUATQRIS_ACCOUNT_ID`: Akun BuatQris Anda
   - `BUATQRIS_SECRET_TOKEN`: Secret Token Anda
   - `GEMINI_API_KEY`: API Key Google Gemini Anda
   - `APP_URL`: URL domain production Anda di Vercel
5. Klik **Deploy**.

---

## 8. Production Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Runtime**: Node.js 18.x / 20.x
- **Kepatuhan Keamanan**:
  - Validasi nominal harga dihitung ulang oleh server dari katalog master
  - Anti-tampering rate limits & payload sanitization
  - Zero-credential exposure pada response JSON frontend
