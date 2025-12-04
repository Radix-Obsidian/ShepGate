# ShepGate MVP – Technical Plan (001-shepgate-mvp)

## 1. Architecture Overview

### High-Level

ShepGate MVP is a **single Next.js 15 app** with:

- **Web UI + API** (Next.js App Router, TypeScript)
- **PostgreSQL** (via Docker) as the only database
- **Prisma** as ORM
- A separate **Node script** in the same repo that runs the MCP host, using the official TypeScript MCP SDK.

ShepGate plays two roles:

1. **MCP server to AI hosts** (e.g., Claude)
2. **MCP client / HTTP client to downstream tools**

All calls flow:

`AI Host → ShepGate MCP Host → Policy + Secrets → Downstream MCP/HTTP tool → back` 

## 2. Concrete Technology Choices

- **Runtime:** Node.js 22 LTS
- **Language:** TypeScript
- **Web Framework:** Next.js 15 (App Router)
- **DB:** PostgreSQL (Docker container for dev, env-configurable for prod)
- **ORM:** Prisma
- **MCP SDK:** `@modelcontextprotocol/sdk` for MCP host and potentially for talking to MCP servers.
- **HTTP Client:** `node-fetch` or `axios` (pick `axios` for familiarity).
- **Auth (MVP):**
  - Single "owner" account: email + password stored in DB.
  - Simple session cookie via Next.js middleware (no OAuth for now).

## 3. Data Model (Initial)

Prisma models:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model AgentProfile {
  id          String   @id @default(cuid())
  name        String
  description String?
  // e.g., "claude-desktop", "windsurf-cascade"
  hostType    String
  apiKey      String?  // Optional key used by host, if needed in the future
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  toolPermissions ToolPermission[]
}

model Server {
  id          String   @id @default(cuid())
  name        String
  type        String   // "mcp" or "http"
  command     String?  // how to start MCP server (for local dev)
  baseUrl     String?  // for HTTP APIs
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tools Tool[]
}

model Tool {
  id          String   @id @default(cuid())
  serverId    String
  server      Server   @relation(fields: [serverId], references: [id])
  name        String   // tool identifier
  description String?
  riskLevel   String   // "safe" | "needs_approval" | "blocked"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  toolPermissions ToolPermission[]
}

model ToolPermission {
  id             String        @id @default(cuid())
  agentProfileId String
  toolId         String
  allowed        Boolean
  agentProfile   AgentProfile  @relation(fields: [agentProfileId], references: [id])
  tool           Tool          @relation(fields: [toolId], references: [id])
}

model Secret {
  id          String   @id @default(cuid())
  name        String   @unique
  value       String   // encrypted at rest (app layer encryption)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PendingAction {
  id             String   @id @default(cuid())
  agentProfileId String
  toolId         String
  argumentsJson  String   // captured call arguments
  status         String   // "pending" | "approved" | "denied"
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ActionLog {
  id             String   @id @default(cuid())
  agentProfileId String?
  toolId         String?
  status         String   // "success" | "failed" | "blocked" | "pending" | "approved" | "denied"
  argumentsJson  String?  // redacted/sanitized version
  resultSummary  String?  // short text description
  createdAt      DateTime @default(now())
}
```

## 4. Key Components

### 4.1 MCP Host Service

File: `apps/shepgate-mcp/host.ts` or `scripts/mcp-host.ts`

Uses `@modelcontextprotocol/sdk` to:
- Start an MCP server that Claude can connect to via stdio or network.
- Expose a set of tools representing ShepGate-proxied tools.

Responsibilities:
- Map incoming MCP tool calls to:
  - Agent profile (via configuration/API key or a simple mapping).
  - Internal policy check (ToolPermission + Tool.riskLevel).
- Execution path:
  - If blocked → return error + log as blocked.
  - If needs_approval → create PendingAction, log as pending, return "pending approval".
  - If safe → call downstream tool, log result.

### 4.2 Policy Engine (simple)

Module: `lib/policy.ts`

Reads:
- AgentProfile, Tool, ToolPermission
- Tool.riskLevel

Exposes helpers:
- `canExecute(agentProfileId, toolName): { allowed: boolean; requiresApproval: boolean; reason?: string }`

### 4.3 Secrets & Execution

Module: `lib/secrets.ts`
- Wraps Prisma access to Secret with app-layer encryption (e.g., using a single ENCRYPTION_KEY env var).

Module: `lib/execution.ts`
- For MCP servers: uses MCP client or stdio connection.
- For HTTP APIs: uses axios with headers from Secret.

### 4.4 Web Dashboard (Next.js)

Pages (App Router):
- `/login`
- `/servers`
- `/servers/:id`
- `/agents`
- `/agents/:id`
- `/approvals`
- `/activity`

Each API route is implemented under `/api/...` using Next.js handlers.

### 4.5 Auth Flow (Owner Only)

- Simple email + password registration seed (for dev) or first-login setup.
- Session cookie stored via Next.js middleware and used to protect all dashboard routes and APIs.

## 5. External Integrations (MVP)

**GitHub MCP Server**
- Use official GitHub MCP server (installed as dependency or via CLI) for reading PRs/issues.
- Store its auth token as a Secret.

**Postgres MCP Server**
- For demo: connect to a separate "sample_app" DB.
- Restrict tools to read-only in MVP; mark any write tool as needs_approval or blocked.

**HTTP API Wrapper**
- Wrap a simple REST API (e.g., "Support tickets" or a fake helpdesk service).
- Implement as type = "http" Server + Tools with baseUrl + method + path.

## 6. Deployment

MVP target:
- Single Docker Compose file:
  - `shepgate-app` (Next.js + MCP host script)
  - `postgres` (DB)

Local development:
- `pnpm dev` for Next.js
- `pnpm mcp:host` for MCP host script.

Cloud deployment (later) is not part of MVP, but design should not block it.

## 7. Observability

- Logs via console in dev.
- Prisma log queries enabled in dev.
- All tool actions stored in ActionLog for querying via dashboard.
