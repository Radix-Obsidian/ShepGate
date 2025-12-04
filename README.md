# ShepGate

**The safe front door for AI tools.**

ShepGate sits between AI agents (Claude, Windsurf Cascade, etc.) and real-world systems (GitHub, databases, CRMs) providing:

- Safe key + secret handling
- Simple, human-readable permissions
- Approvals for risky actions
- A clear audit trail of everything the AI did

## Tech Stack

- **Runtime:** Node.js 22 LTS + TypeScript
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **MCP SDK:** `@modelcontextprotocol/sdk`

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Running the MCP Host

```bash
pnpm mcp:host
```

## Project Structure

```
.specify/           # Spec-driven development docs
  memory/           # Constitution and shared context
  specs/            # Feature specs (PRD, SDD, TTD)
src/
  app/              # Next.js App Router pages
  lib/              # Shared utilities (policy, secrets, execution)
scripts/
  mcp-host.ts       # MCP host service
prisma/
  schema.prisma     # Database schema
```

## Documentation

See `.specify/` for full project specs:

- `memory/constitution.md` - Project principles
- `specs/001-shepgate-mvp/spec.md` - Product requirements
- `specs/001-shepgate-mvp/plan.md` - Technical design
- `specs/001-shepgate-mvp/tasks.md` - Task breakdown
