# ShopeeClone — Production-Ready Multi-Vendor Marketplace

A full-stack e-commerce marketplace inspired by Shopee, built with Next.js, NestJS, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | NestJS (modular architecture) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Payments | Midtrans + Stripe |
| File Storage | Cloudinary |
| Cache | Redis |
| Containerization | Docker + Docker Compose |

## Project Structure

```
shopeeclone/
├── backend/          # NestJS API server
├── frontend/         # Next.js web app
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` in both `backend/` and `frontend/` and fill in values.

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. Run Development

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + Render/AWS deployment guide.

## API Documentation

See [backend/API.md](./backend/API.md) or visit `http://localhost:3001/api/docs` (Swagger UI).
