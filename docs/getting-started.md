# Getting Started with ShepGate

This guide walks you through setting up ShepGate for the first time.

## Prerequisites

- Node.js 22 or later
- pnpm package manager
- PostgreSQL database (local, Docker, or cloud)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/golden-sheep-ai/shepgate.git
cd shepgate
pnpm install
```

### 2. Database Setup

**Option A: Cloud Database (Recommended for quick start)**

Sign up for [Neon](https://neon.tech) (free tier available) and get your connection string.

**Option B: Local Docker**

```bash
docker-compose up -d
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="your-database-url"
OWNER_EMAIL="your-email@example.com"
OWNER_PASSWORD="your-secure-password"
```

### 4. Initialize Database

```bash
pnpm db:migrate
```

### 5. Start ShepGate

```bash
pnpm dev
```

Open http://localhost:3000 and log in with your owner credentials.

## Next Steps

1. [Add your first MCP server](./adding-servers.md)
2. [Configure Claude Desktop](./claude-desktop.md)
3. [Set up policies](./policies.md)

## Troubleshooting

### Database Connection Error

Make sure your `DATABASE_URL` is correct and the database is running.

### Login Not Working

Check that `OWNER_EMAIL` and `OWNER_PASSWORD` in `.env` match what you're entering.

---

Need help? [Open an issue](https://github.com/golden-sheep-ai/shepgate/issues)
