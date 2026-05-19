# 🚀 Deployment Guide — ShopeeClone

## Stack Deployment

| Service | Platform | Biaya |
|---------|----------|-------|
| Frontend | Vercel | Gratis |
| Backend API | Render | Gratis |
| Database | Neon (PostgreSQL) | Gratis |
| Redis | Render | Gratis |
| File Storage | Cloudinary | Gratis |

---

## Langkah 1 — Siapkan Repository GitHub

```bash
# Di root project
git init
git add .
git commit -m "feat: initial shopee clone marketplace"

# Buat repo di github.com lalu:
git remote add origin https://github.com/USERNAME/shopeeclone.git
git push -u origin main
```

---

## Langkah 2 — Setup Database (Neon — Gratis)

1. Daftar di **https://neon.tech**
2. Klik **New Project** → beri nama `shopeeclone`
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
| Name | `shopeeclone-backend` |
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
FRONTEND_URL=https://shopeeclone.vercel.app
CLOUDINARY_CLOUD_NAME=<dari cloudinary.com>
CLOUDINARY_API_KEY=<dari cloudinary.com>
CLOUDINARY_API_SECRET=<dari cloudinary.com>
MIDTRANS_SERVER_KEY=<dari midtrans sandbox>
MIDTRANS_CLIENT_KEY=<dari midtrans sandbox>
MIDTRANS_IS_PRODUCTION=false
STRIPE_SECRET_KEY=<dari stripe dashboard>
STRIPE_WEBHOOK_SECRET=<dari stripe webhook>
ADMIN_EMAIL=admin@shopeeclone.com
ADMIN_PASSWORD=<password kuat>
```

6. Klik **Create Web Service**
7. Tunggu deploy selesai (~5 menit)
8. Catat URL backend: `https://shopeeclone-backend.onrender.com`

### Jalankan Seed Data (sekali saja)
Setelah deploy berhasil, buka **Shell** di Render dashboard:
```bash
npx prisma db seed
```

---

## Langkah 4 — Deploy Frontend ke Vercel

### Cara A — Via Vercel CLI (Recommended)

```bash
npm i -g vercel
cd frontend
vercel

# Ikuti prompt:
# - Link to existing project? No
# - Project name: shopeeclone
# - Directory: ./
# - Override settings? No
```

### Cara B — Via Vercel Dashboard

1. Buka **https://vercel.com/new**
2. Import GitHub repo
3. Set **Root Directory** ke `frontend`
4. Tambah **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://shopeeclone-backend.onrender.com/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

5. Klik **Deploy**
6. URL frontend: `https://shopeeclone.vercel.app`

---

## Langkah 5 — Update CORS Backend

Setelah dapat URL Vercel, update env di Render:
```
FRONTEND_URL=https://shopeeclone.vercel.app
```

---

## Langkah 6 — Setup Cloudinary (File Upload)

1. Daftar di **https://cloudinary.com** (gratis 25GB)
2. Dashboard → Copy: Cloud Name, API Key, API Secret
3. Update env di Render dengan nilai tersebut

---

## Langkah 7 — Setup Payment Gateway

### Midtrans (Indonesia)
1. Daftar di **https://midtrans.com** → Sandbox
2. Settings → Access Keys → Copy Server Key & Client Key
3. Update env Render + Vercel

### Stripe (International)
1. Daftar di **https://stripe.com**
2. Developers → API Keys → Copy keys
3. Developers → Webhooks → Add endpoint:
   - URL: `https://shopeeclone-backend.onrender.com/api/v1/payments/webhook/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy Webhook Secret → update env Render

---

## Verifikasi Deployment

```bash
# Test backend health
curl https://shopeeclone-backend.onrender.com/api/v1/health

# Expected response:
# {"status":"ok","database":"connected","uptime":...}
```

Buka:
- 🌐 Frontend: `https://shopeeclone.vercel.app`
- 📚 API Docs: `https://shopeeclone-backend.onrender.com/api/docs`

---

## Troubleshooting

### Backend crash di Render
- Cek logs di Render dashboard
- Pastikan `DATABASE_URL` benar (dari Neon)
- Pastikan semua env vars terisi

### Frontend tidak bisa hit API
- Pastikan `NEXT_PUBLIC_API_URL` sudah benar
- Cek CORS: `FRONTEND_URL` di backend harus sama dengan URL Vercel

### Database error
- Buka Neon dashboard → pastikan database aktif
- Free tier Neon bisa sleep — akses pertama mungkin lambat

### Render free tier sleep
- Free tier Render sleep setelah 15 menit idle
- Request pertama butuh ~30 detik untuk wake up
- Upgrade ke Starter ($7/bulan) untuk always-on

---

## Custom Domain (Opsional)

### Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain → ikuti instruksi DNS

### Render
1. Render Dashboard → Service → Settings → Custom Domains
2. Add domain → ikuti instruksi DNS
