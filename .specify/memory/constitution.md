# ShepGate Project Constitution

## Mission

ShepGate is the **safe front door for AI tools**.

It sits between AI agents (Claude, Windsurf Cascade, etc.) and real-world systems (GitHub, databases, CRMs) and gives small teams:

- Safe key + secret handling
- Simple, human-readable permissions
- Approvals for risky actions
- A clear audit trail of everything the AI did

We always optimize for **trust and clarity**, not protocol cleverness.

## Principles

1. **Customer experience first**
   - Non-technical founders must be able to understand:
     - What their AI can access
     - What it did
     - How to turn things on/off
   - UX must avoid protocol jargon ("JSON-RPC", "transport", etc.) on primary screens.

2. **MCP-native, but protocol-agnostic mindset**
   - ShepGate speaks MCP using official TypeScript SDKs.
   - It should also be able to wrap plain HTTP APIs as tools, so teams don't need to write MCP servers for everything.

3. **Single, opinionated stack**
   - One path for v0.1:
     - Node.js 22 LTS + TypeScript
     - Next.js 15 (App Router) for frontend + API routes
     - Prisma + PostgreSQL for persistence
     - `@modelcontextprotocol/sdk` for MCP host and client logic
   - No multi-stack experiments in MVP.

4. **Security > convenience**
   - Secrets are **never** placed in LLM-visible prompts.
   - Dangerous actions are **opt-in** and guarded by approvals.
   - We bias toward blocking and logging rather than silently allowing.

5. **Small, auditable surface area**
   - Clear modules:
     - MCP host service
     - Policy + approvals engine
     - Secrets integration
     - Web dashboard
   - Each layer has minimal responsibilities and clear tests.

6. **Vertical slices over big-bang**
   - Always aim for **end-to-end scenarios**:
     - "Claude can read GitHub issues through ShepGate"
     - "Claude's attempt to close tickets requires human approval"
   - Partial backend work with no visible flow is considered incomplete.

7. **Spec-driven**
   - This constitution + `spec.md` + `plan.md` + `tasks.md` are the source of truth.
   - AI tools (Windsurf, Claude Code, etc.) must follow these docs and keep them updated when architecture or flows change.

## Non-Goals (for MVP)

- Enterprise SSO, SOC2 checklists, multi-region routing.
- Generic marketplace of thousands of tools.
- Complex policy language. For v0.1 we stick to:
  - allow / block / needs_approval at the tool level.
