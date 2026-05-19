# Setup Database PostgreSQL

## ✅ Status Saat Ini
- **Frontend**: http://localhost:3000 — RUNNING ✅
- **Backend API**: http://localhost:3001/api/v1 — RUNNING ✅  
- **Swagger Docs**: http://localhost:3001/api/docs — RUNNING ✅
- **Database**: ❌ Perlu setup PostgreSQL

---

## Opsi 1: Docker Desktop (Recommended)

1. Buka **Docker Desktop** (pastikan sudah running di system tray)
2. Jalankan di terminal:

```bash
docker run --name shopeeclone_db \
  -e POSTGRES_USER=shopeeclone \
  -e POSTGRES_PASSWORD=shopeeclone_pass \
  -e POSTGRES_DB=shopeeclone \
  -p 5432:5432 -d postgres:15-alpine

docker run --name shopeeclone_redis \
  -p 6379:6379 -d redis:7-alpine
```

3. Lalu jalankan migrasi:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Opsi 2: Install PostgreSQL Langsung

1. Download dari https://www.postgresql.org/download/windows/
2. Install dengan user: `shopeeclone`, password: `shopeeclone_pass`
3. Buat database: `shopeeclone`
4. Jalankan migrasi:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Opsi 3: Neon (Cloud PostgreSQL Gratis)

1. Daftar di https://neon.tech
2. Buat project baru
3. Copy connection string ke `backend/.env`:
```
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/shopeeclone?sslmode=require"
```
4. Jalankan: `npx prisma migrate dev --name init && npx prisma db seed`

---

## Setelah Database Ready

Backend akan otomatis reconnect. Akun demo:
- **Admin**: admin@shopeeclone.com / Admin@123456
- **Seller**: seller@shopeeclone.com / Seller@123456  
- **Buyer**: buyer@shopeeclone.com / Buyer@123456
