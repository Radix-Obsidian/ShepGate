# ShepGate MVP Gap Analysis

**Date:** 2024-12-04
**Purpose:** Identify gaps between current implementation and spec requirements
**Reference:** `spec.md` (MVP Scope Section 4)

---

## Spec Requirements vs. Current State

### Requirement 1: Single AI host integration ✅
**Status:** COMPLETE

**Spec says:**
> ShepGate presents itself as an MCP server to Claude (Claude Code / Claude Desktop).
> Claude can list and call tools proxied through ShepGate.

**Current state:**
- `scripts/mcp-host.ts` - Real MCP server using official SDK
- Uses `Server` from `@modelcontextprotocol/sdk/server`
- Implements `ListToolsRequestSchema` and `CallToolRequestSchema`
- Integrates with PolicyEngine for approval workflow

**Evidence:** Built from official MCP docs: https://modelcontextprotocol.io/docs/develop/build-server

---

### Requirement 2: Tool catalog & per-agent permissions ✅
**Status:** COMPLETE

**Spec says:**
> Register MCP servers... ShepGate ingests and displays available tools per server.
> Define Agent Profiles: Choose which tools each agent can see/use.

**Current state:**
- Server CRUD: `src/app/api/servers/`
- Tool sync: `src/app/api/servers/[id]/sync/route.ts`
- Agent CRUD: `src/app/api/agents/`
- Permissions: `src/app/api/agents/[id]/permissions/`
- UI pages: `/servers`, `/agents`, `/agents/[id]`

---

### Requirement 3: Risk tags and approvals ✅
**Status:** COMPLETE

**Spec says:**
> Each tool can be tagged `safe` or `needs_approval`.
> When an AI attempts a `needs_approval` tool, ShepGate queues the action.
> A human can approve/deny through the web dashboard.

**Current state:**
- Risk levels: `safe`, `needs_approval`, `blocked`
- Policy engine: `src/lib/policy.ts`
- Approval API: `src/app/api/approvals/`
- Approval UI: `/approvals`
- PendingAction model in schema

---

### Requirement 4: Secrets vault (MVP) ❌
**Status:** NOT IMPLEMENTED

**Spec says:**
> Store API keys and DB credentials securely.
> Tools reference secrets by name.
> LLMs/agents never see raw secrets in prompts.

**Current state:**
- Schema EXISTS: `Secret` model in `prisma/schema.prisma` (lines 82-89)
- API routes: MISSING
- UI: MISSING
- Encryption at rest: MISSING
- Secret injection to MCP servers: MISSING

**Gap:**
| Component | Exists | Needs |
|-----------|--------|-------|
| Database model | ✅ | - |
| CRUD API | ❌ | POST/GET/DELETE routes |
| UI for management | ❌ | Secrets page |
| Encryption | ❌ | AES-256-GCM at rest |
| Injection | ❌ | Pass to Server.command env |

**Official pattern for encryption:**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Encrypt using AES-256-GCM (Node.js built-in)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const iv = randomBytes(16);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const authTag = cipher.getAuthTag();
```

---

### Requirement 5: Audit log ✅
**Status:** COMPLETE

**Spec says:**
> Every tool call is recorded: timestamp, agent profile, tool name, arguments, status.

**Current state:**
- ActionLog model in schema
- Logged by PolicyEngine on every execution
- Displayed in `/activity` page
- Includes: agent, tool, args, status, timestamp

---

### Requirement 6: Basic web dashboard ✅
**Status:** COMPLETE

**Spec says:**
> Screens: Servers & tools, Agent profiles & permissions, Pending approvals, Activity log

**Current state:**
- `/servers` - Server & tool management
- `/agents` - Agent profiles with permissions
- `/approvals` - Pending action queue
- `/activity` - Audit log view

---

## Critical Gap: Mock Execution ❌

**Spec says (Success Criteria):**
> Connect at least 2 real tools (e.g., GitHub and a DB)
> Claude reads GitHub issues through ShepGate

**Current state:**
`src/lib/execution.ts` uses MOCK responses:
```typescript
// Line 48:
const result = await this.mockExecution(tool.name, tool.server.name, args);
```

This violates:
- Zero-Placeholder Policy (ZPP)
- Full-Stack Reality Testing (FSRT)
- Spec requirement for "real tools"

**Official MCP Client pattern (from SDK):**
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Spawn real MCP server as subprocess
const transport = new StdioClientTransport({
  command: "npx",
  args: ["@modelcontextprotocol/server-github"],
  env: { ...process.env, GITHUB_TOKEN: decryptedSecret }
});

const client = new Client({ name: "shepgate", version: "0.1.0" });
await client.connect(transport);

// Call real tools
const result = await client.callTool({ name: toolName, arguments: args });
```

**What needs to change:**
1. Replace `mockExecution()` with real `Client.callTool()`
2. Manage server connections (spawn, pool, cleanup)
3. Inject decrypted secrets as environment variables
4. Handle errors from real servers

---

## Forward Implementation Plan

### Phase A: Secrets Vault (~2 hours)

**A1. API Routes**
- `POST /api/secrets` - Create encrypted secret
- `GET /api/secrets` - List secret names (never values)
- `DELETE /api/secrets/:id` - Delete secret

**A2. Encryption Library**
- `src/lib/secrets.ts` - encrypt/decrypt using AES-256-GCM
- Key stored in `ENCRYPTION_KEY` env var

**A3. UI**
- `/secrets` page with add/delete functionality
- Show names only, never decrypted values

**A4. Integration**
- `getSecretsForServer(serverId)` helper
- Inject into MCP server env vars

### Phase B: Real MCP Execution (~3 hours)

**B1. MCP Client Manager**
- `src/lib/mcp-client.ts` - Connection pool
- Spawn servers using `StdioClientTransport`
- Cache connections for performance

**B2. Replace Mock Executor**
- Update `src/lib/execution.ts`
- Use real `Client.callTool()`
- Inject secrets from vault

**B3. Error Handling**
- Server crash recovery
- Timeout handling
- Connection cleanup

---

## Methodology Alignment Check

| Principle | Current | After Fix |
|-----------|---------|-----------|
| VSD (Vertical Slice) | ⚠️ Incomplete | ✅ Full slice |
| ZPP (No Placeholders) | ❌ Mocks exist | ✅ Real execution |
| FSRT (Reality Testing) | ❌ Can't test real | ✅ Real servers |
| EDD (Evidence-Driven) | ✅ Using official docs | ✅ Maintained |

---

## References

- Spec file: `.specify/specs/001-shepgate-mvp/spec.md`
- Official MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP Client tutorial: https://modelcontextprotocol.io/tutorials/building-a-client-node
- Node.js crypto: https://nodejs.org/api/crypto.html

---

## Next Action

Implement Phase A (Secrets) then Phase B (Real Execution) to achieve:
- ✅ 5/5 Zero-Placeholder Policy
- ✅ 5/5 Product Spec Alignment
- ✅ 5/5 Customer Value
