# 🎓 CampusIQ — College Discovery Platform

> India's smartest AI-powered college discovery platform. Compare colleges, predict admissions, explore placements, and read real student reviews — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?logo=postgresql)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🔍 **Smart College Search** — Live autocomplete with search suggestions by name, city, type
- 📊 **NIRF Rankings** — Browse & filter colleges ranked by NIRF India 2025
- ⚖️ **Side-by-Side Comparison** — Compare up to 3 colleges across academics, placements, fees, and more
- 🎯 **Rank Predictor** — Input your JEE/NEET rank and get predicted college admissions
- 🤖 **AI Shortlisting** — Groq-powered AI that personalizes college recommendations
- 💬 **Student Reviews** — Authenticated review system with ratings across 5 dimensions
- 🔥 **Trending Colleges** — See what colleges students are searching most this week
- 📈 **Analytics** — Track search trends and popular colleges
- 💾 **Saved Colleges** — Bookmark colleges to revisit later (requires login)
- 📄 **Swagger API Docs** — Full interactive API documentation at `/api-docs`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Groq SDK (LLaMA-based models) |
| Validation | Zod 4 |
| API Docs | Swagger UI + swagger-jsdoc |
| Styling | Vanilla CSS (inline styles) |

---

## 📁 Project Structure

```
campusiq/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css
│   ├── api-docs/                   # Swagger UI page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # POST /api/auth/login
│       │   └── register/route.ts   # POST /api/auth/register
│       ├── colleges/
│       │   ├── route.ts            # GET /api/colleges (list + filter)
│       │   ├── trending/route.ts   # GET /api/colleges/trending
│       │   ├── search-suggestions/ # GET /api/colleges/search-suggestions
│       │   ├── compare/route.ts    # GET /api/colleges/compare
│       │   └── [id]/
│       │       ├── route.ts        # GET /api/colleges/:id
│       │       └── reviews/route.ts # GET/POST /api/colleges/:id/reviews
│       ├── predict/route.ts        # GET /api/predict
│       ├── saved/route.ts          # GET/POST/DELETE /api/saved
│       ├── ai/shortlist/route.ts   # POST /api/ai/shortlist
│       ├── analytics/route.ts      # GET /api/analytics
│       └── docs/route.ts           # GET /api/docs (OpenAPI spec)
├── components/
│   ├── Navbar.tsx
│   └── CollegeCard.tsx
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # JWT verify helper
│   └── validate.ts                 # Zod helpers + response utils
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Groq API key (for AI features)

### 1. Clone the repo

```bash
git clone https://github.com/AnshulSinglaa/College-Discovery-Platform.git
cd College-Discovery-Platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-super-secret-jwt-key"
GROQ_API_KEY="your-groq-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev

# Seed with sample college data
npx prisma db seed
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

Interactive API docs available at: **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Login and receive JWT token |

### Colleges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/colleges` | List colleges with filters & pagination |
| GET | `/api/colleges/:id` | Get college details |
| GET | `/api/colleges/trending` | Get trending colleges |
| GET | `/api/colleges/search-suggestions` | Autocomplete search |
| GET | `/api/colleges/compare` | Compare multiple colleges |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/colleges/:id/reviews` | Get reviews for a college |
| POST | `/api/colleges/:id/reviews` | Submit a review (auth required) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predict` | Predict colleges by rank |
| POST | `/api/ai/shortlist` | AI-powered college shortlisting |
| GET | `/api/saved` | Get saved colleges (auth required) |
| POST | `/api/saved` | Save a college (auth required) |
| DELETE | `/api/saved` | Remove a saved college (auth required) |
| GET | `/api/analytics` | Platform analytics data |

---

## 🔐 Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from `POST /api/auth/login`.

---

## 🗄️ Database Schema

Key models in `prisma/schema.prisma`:

- **User** — accounts with hashed passwords
- **College** — full college data (NIRF rank, fees, seats, placement stats)
- **Review** — student reviews with 5-dimension ratings
- **SavedCollege** — user bookmarks
- **SearchLog** — powers trending analytics

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:3000/api/colleges?limit=3

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# AI Shortlist
curl -X POST http://localhost:3000/api/ai/shortlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"rank":5000,"category":"General","preferred_branch":"CSE"}'
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT © 2026 [Anshul Singla](https://github.com/AnshulSinglaa)
