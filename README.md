<div align="center">

# 🐑 ShepGate

**The safe front door for AI tools.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

[Demo](#demo) • [Quick Start](#quick-start) • [Features](#features) • [Documentation](#documentation) • [Roadmap](#roadmap)

</div>

---

## What is ShepGate?

ShepGate is an **AI governance gateway** that sits between AI agents (Claude Desktop, Windsurf, etc.) and external tools (GitHub, databases, APIs). It gives you:

- **🔐 Policy Control** — Define what AI can do: allow, require approval, or block
- **✅ Approval Workflows** — Review risky actions before they execute
- **📊 Activity Logging** — Complete audit trail of every AI action
- **🔑 Secrets Management** — Encrypted credential storage (AES-256-GCM)
- **🔌 MCP Integration** — Works with any Model Context Protocol host

### The Problem

AI agents are powerful, but giving them unrestricted access to your tools is risky:
- What if Claude accidentally deletes a production database?
- How do you know what actions your AI assistant took?
- How do you share API keys without exposing them?

### The Solution

ShepGate acts as a **policy layer** between AI and your systems:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Claude    │────▶│  ShepGate   │────▶│   GitHub    │
│   Desktop   │     │  (Gateway)  │     │   Slack     │
│             │◀────│             │◀────│   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Dashboard  │
                    │  - Policies │
                    │  - Approvals│
                    │  - Logs     │
                    └─────────────┘
```

---

## Demo

https://github.com/user-attachments/assets/placeholder-demo-video

> **Coming Soon:** Live demo video showing Claude Desktop → ShepGate → GitHub flow

---

## Features

### ✅ Working in MVP

| Feature | Description |
|---------|-------------|
| **Policy Engine** | Three-tier risk levels: `safe` (auto-execute), `needs_approval` (human review), `blocked` (always deny) |
| **Approval Workflow** | Pending actions queue with approve/deny from web dashboard |
| **Activity Logging** | Every tool call logged with agent, arguments, result, timestamp |
| **Secrets Vault** | AES-256-GCM encrypted storage for API keys and tokens |
| **MCP Host** | Stdio-based MCP server for Claude Desktop integration |
| **Web Dashboard** | Manage servers, tools, agents, and approvals |

### 🚧 Roadmap

| Feature | Status | Target |
|---------|--------|--------|
| Multi-user auth | Planned | v0.2 |
| Team workspaces | Planned | v0.2 |
| VS Code extension | Planned | v0.3 |
| Hosted cloud version | Planned | v0.4 |
| Billing & usage limits | Planned | v0.4 |

---

## Quick Start

### Prerequisites

- **Node.js 22+** ([Download](https://nodejs.org/))
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** (local, Docker, or cloud like [Neon](https://neon.tech))

### 1. Clone and Install

```bash
git clone https://github.com/golden-sheep-ai/shepgate.git
cd shepgate
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL and credentials:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/shepgate"
OWNER_EMAIL="you@example.com"
OWNER_PASSWORD="your-secure-password"
ENCRYPTION_KEY="your-32-byte-hex-key"
```

### 3. Setup Database

```bash
# Run migrations
pnpm db:migrate

# (Optional) Seed with test data
pnpm db:seed
```

### 4. Start the Dashboard

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your owner credentials.

### 5. Connect Claude Desktop

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "shepgate": {
      "command": "cmd",
      "args": ["/c", "path\\to\\shepgate\\scripts\\claude-launcher.bat"]
    }
  }
}
```

Restart Claude Desktop. You should see ShepGate's tools available!

---

## Architecture

```
shepgate/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # REST API routes
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── login/           # Auth pages
│   ├── components/          # React components
│   └── lib/                 # Core logic
│       ├── policy.ts        # Policy engine
│       ├── execution.ts     # Tool execution
│       ├── secrets.ts       # Encryption
│       └── mcp-client.ts    # MCP SDK wrapper
├── scripts/
│   └── mcp-host.ts          # MCP host for Claude
├── prisma/
│   └── schema.prisma        # Database schema
└── .specify/                # Spec-driven docs
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 22 LTS |
| **Language** | TypeScript 5 |
| **Framework** | Next.js 16 (App Router) |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **MCP SDK** | @modelcontextprotocol/sdk |
| **Auth** | Simple owner auth (multi-user planned) |
| **Encryption** | AES-256-GCM via Node.js crypto |

---

## Documentation

- **[Getting Started Guide](./docs/getting-started.md)** — Full setup walkthrough
- **[Claude Desktop Integration](./docs/claude-desktop.md)** — Detailed Claude setup
- **[API Reference](./docs/api.md)** — REST API documentation
- **[Policy Configuration](./docs/policies.md)** — How to configure risk levels

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## About

Built by [Golden Sheep AI](https://goldensheep.ai) — Making AI agents safer for everyone.

**ShepGate** is part of the Golden Sheep AI ecosystem:
- **ShepGate** — AI governance gateway (this project)
- **ShepLang** — Natural language spec compiler
- **ShepLight** — Lightweight AI observability

---

<div align="center">

**[⭐ Star us on GitHub](https://github.com/golden-sheep-ai/shepgate)** if you find this useful!

</div>
