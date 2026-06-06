# Inventra — Inventory Management System

> Inventra is a modern, real-time inventory management dashboard built with Next.js 15, Tailwind CSS v4, Prisma, and Neon PostgreSQL. It allows businesses to track products, manage categories, monitor real-time stock levels, and log atomic stock adjustments.

---

## Features

### Core
- **JWT Auth** — Register & login with HTTP-only cookie tokens, bcrypt password hashing
- **Dashboard** — Summary cards (products, stock value, low stock, categories) + Recharts bar & pie charts
- **Products CRUD** — Add, edit, delete products with Name, SKU, Category, Price, Quantity, and Low Stock Threshold
- **Stock Adjustments** — Stock In / Stock Out with reason notes, atomic DB transactions
- **Low Stock Alerts** — Pulsing red/yellow badges on product list and dashboard
- **Categories** — Create, rename, and delete categories (protected if products assigned)
- **Search & Filter** — Search by name/SKU, filter by category and stock status

### Bonus
- **Stock Movement History** — Paginated log of every stock adjustment with timestamp, user, and reason
- **Charts** — Bar chart (stock by category) + Pie chart (category distribution) via Recharts
- **CSV Export** — Download full product list as a properly formatted CSV file
- **Responsive UI** — Works on mobile with a collapsible sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Custom CSS Variables |
| ORM | Prisma 7 |
| Database | Neon PostgreSQL (serverless) |
| Auth | JWT + HTTP-only cookies + bcryptjs |
| Charts | Recharts |
| Validation | Zod (client + server) |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/Aarsh-37/beram.git
cd beram
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

### 3. Push database schema

```bash
pnpm db:push
```

### 4. Seed demo data (optional)

```bash
pnpm db:seed
```

This creates a demo account and sample products:
- **Email:** `demo@inventra.dev`
- **Password:** `Demo1234!`

### 5. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
4. Deploy — Vercel auto-runs `prisma generate` via `postinstall`

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT stored in `httpOnly; SameSite=Strict` cookies (no XSS access)
- All inputs validated with Zod on the server
- Middleware protects all non-public routes at the edge
- Negative stock prevented at the API level
- `.env` never committed — see `.env.example`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/products` | List (search/filter) |
| POST | `/api/products` | Create product |
| GET/PUT/DELETE | `/api/products/:id` | Get, update, delete |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT/DELETE | `/api/categories/:id` | Update, delete |
| POST | `/api/stock/:productId` | Adjust stock |
| GET | `/api/movements` | Movement history |
| GET | `/api/export` | Download CSV |
| GET | `/api/dashboard` | Dashboard stats |