# 🚀 Deployment Guide — Nexmarket

## Stack Deployment

| Service | Platform | Biaya |
|---------|----------|-------|
| Frontend | Vercel | Gratis |
| Backend API | Render | Gratis |
| Database | Neon (PostgreSQL) | Gratis |
| Redis | Render | Gratis |
| File Storage | Cloudinary | Gratis |

---

## Langkah 1 — Push ke GitHub

```bash
git remote add origin https://github.com/USERNAME/nexmarket.git
git branch -M main
git push -u origin main
```

---

## Langkah 2 — Setup Database (Neon — Gratis)

1. Daftar di **https://neon.tech**
2. Klik **New Project** → beri nama `nexmarket`
3. Copy **Connection String** (format: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Simpan — akan dipakai di Render nanti

---

## Langkah 3 — Deploy Backend ke Render

1. Daftar/login di **https://render.com**
2. Klik **New → Web Service**
3. Connect GitHub repo kamu
4. Isi settings:

| Field | Value |
|-------|-------|
| Name | `nexmarket-backend` |
| Root Directory | `backend` |
| Runtime | **Docker** |
| Branch | `main` |
| Plan | Free |

5. Tambah **Environment Variables**:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=<paste dari Neon>
JWT_ACCESS_SECRET=<random string panjang>
JWT_REFRESH_SECRET=<random string panjang lain>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://nexmarket.vercel.app
CLOUDINARY_CLOUD_NAME=<dari cloudinary.com>
CLOUDINARY_API_KEY=<dari cloudinary.com>
CLOUDINARY_API_SECRET=<dari cloudinary.com>
MIDTRANS_SERVER_KEY=<dari midtrans sandbox>
MIDTRANS_CLIENT_KEY=<dari midtrans sandbox>
MIDTRANS_IS_PRODUCTION=false
STRIPE_SECRET_KEY=<dari stripe dashboard>
STRIPE_WEBHOOK_SECRET=<dari stripe webhook>
ADMIN_EMAIL=admin@nexmarket.com
ADMIN_PASSWORD=<password kuat>
```

6. Klik **Create Web Service** → tunggu ~5 menit
7. Catat URL backend: `https://nexmarket-backend.onrender.com`

### Jalankan Seed Data (sekali saja)
Setelah deploy berhasil, buka **Shell** di Render dashboard:
```bash
npx prisma db seed
```

---

## Langkah 4 — Deploy Frontend ke Vercel

### Via Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel --prod
```

### Via Vercel Dashboard

1. Buka **https://vercel.com/new**
2. Import GitHub repo
3. Set **Root Directory** ke `frontend`
4. Tambah **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://nexmarket-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=Nexmarket
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

5. Klik **Deploy**
6. URL frontend: `https://nexmarket.vercel.app`

---

## Langkah 5 — Update CORS Backend

Setelah dapat URL Vercel, update env di Render:
```
FRONTEND_URL=https://nexmarket.vercel.app
```

---

## Langkah 6 — Setup Cloudinary

1. Daftar di **https://cloudinary.com** (gratis 25GB)
2. Dashboard → Copy: Cloud Name, API Key, API Secret
3. Update env di Render

---

## Langkah 7 — Setup Payment Gateway

### Midtrans (Indonesia)
1. Daftar di **https://midtrans.com** → Sandbox
2. Settings → Access Keys → Copy Server Key & Client Key

### Stripe (International)
1. Daftar di **https://stripe.com**
2. Developers → Webhooks → Add endpoint:
   - URL: `https://nexmarket-backend.onrender.com/api/v1/payments/webhook/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Verifikasi

```bash
curl https://nexmarket-backend.onrender.com/api/v1/health
# {"status":"ok","database":"connected",...}
```

- 🌐 Frontend: `https://nexmarket.vercel.app`
- 📚 API Docs: `https://nexmarket-backend.onrender.com/api/docs`

---

## Akun Demo (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexmarket.com | Admin@123456 |
| Seller | seller@nexmarket.com | Seller@123456 |
| Buyer | buyer@nexmarket.com | Buyer@123456 |
