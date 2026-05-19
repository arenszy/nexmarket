# Setup Database PostgreSQL — Nexmarket

## ✅ Status Saat Ini
- **Frontend**: http://localhost:3000 — RUNNING ✅
- **Backend API**: http://localhost:3001/api/v1 — RUNNING ✅
- **Swagger Docs**: http://localhost:3001/api/docs — RUNNING ✅
- **Database**: ❌ Perlu setup PostgreSQL

---

## Opsi 1: Docker Desktop (Recommended)

1. Buka **Docker Desktop** (pastikan sudah running)
2. Jalankan di terminal:

```bash
docker run --name nexmarket_db \
  -e POSTGRES_USER=nexmarket \
  -e POSTGRES_PASSWORD=nexmarket_pass \
  -e POSTGRES_DB=nexmarket \
  -p 5432:5432 -d postgres:15-alpine

docker run --name nexmarket_redis \
  -p 6379:6379 -d redis:7-alpine
```

3. Lalu jalankan migrasi:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Opsi 2: Neon (Cloud PostgreSQL Gratis)

1. Daftar di https://neon.tech
2. Buat project baru
3. Copy connection string ke `backend/.env`:
```
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/nexmarket?sslmode=require"
```
4. Jalankan: `npx prisma migrate dev --name init && npx prisma db seed`

---

## Setelah Database Ready

Akun demo:
- **Admin**: admin@nexmarket.com / Admin@123456
- **Seller**: seller@nexmarket.com / Seller@123456
- **Buyer**: buyer@nexmarket.com / Buyer@123456
