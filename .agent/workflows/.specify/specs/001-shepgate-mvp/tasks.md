# ShepGate MVP – Task Breakdown (001-shepgate-mvp)

## Strategy

Build in **vertical slices**. Each slice should:

1. Add or refine schema.
2. Wire minimal API + UI.
3. Prove end-to-end behavior (manual test).
4. Add basic tests where it makes sense (unit + integration).

Use Windsurf to implement each phase step-by-step.

---

## Phase 1 – Project & Environment Setup

1. **Task 1.1 – Repo + Tooling**
   - Create `shepgate` repo.
   - Initialize Next.js 15 App Router with TypeScript.
   - Add dependencies:
     - `prisma @prisma/client` 
     - `axios` 
     - `@modelcontextprotocol/sdk` 
     - `bcrypt` or `argon2` for password hashing
   - Add basic `.editorconfig`, `.gitignore`, and `README`.

2. **Task 1.2 – PostgreSQL + Prisma**
   - Add Docker Compose with Postgres.
   - Configure Prisma schema with models: `User`, `AgentProfile`, `Server`, `Tool`, `ToolPermission`, `Secret`, `PendingAction`, `ActionLog`.
   - Run `prisma migrate dev` and verify DB connectivity.

3. **Task 1.3 – Auth Skeleton**
   - Implement `/login` page + `/api/auth/login` and `/api/auth/logout`.
   - Use a single seeded owner user (email + password).
   - Set up session cookie middleware to protect dashboard routes.

4. **Task 1.4 – Basic Layout**
   - Create a simple app shell:
     - Top nav: "Servers", "Agents", "Approvals", "Activity".
     - Ensure login is required for all except `/login`.

---

## Phase 2 – Servers & Tools Catalog

5. **Task 2.1 – Server CRUD**
   - Implement `/api/servers` (list/create) and `/api/servers/[id]` (read/update).
   - Fields: `name`, `type`, `command`, `baseUrl`, `description`.
   - Add `/servers` and `/servers/[id]` UI pages to:
     - Create/edit servers.
     - View basic info.

6. **Task 2.2 – Tool Model & Discovery**
   - Implement a backend function to **sync tools** for a given server:
     - For MCP server:
       - Use MCP SDK or an adapter to query available tools and store them in `Tool`.
     - For HTTP server:
       - For MVP, manually create `Tool` entries via UI (no auto-discovery).
   - Add UI button "Sync tools" on server detail page.
   - Display tools in a table with columns:
     - Name, risk level, description.

7. **Task 2.3 – Risk Level Editing**
   - On the tools list, allow editing `riskLevel` as:
     - `safe`, `needs_approval`, `blocked`.
   - Validate that new tools default to `blocked`.

---

## Phase 3 – Agent Profiles & Permissions

8. **Task 3.1 – Agent Profiles CRUD**
   - Implement `/api/agents` and `/api/agents/[id]`.
   - Fields: `name`, `description`, `hostType`.
   - UI pages:
     - `/agents` – list
     - `/agents/[id]` – detail and edit.

9. **Task 3.2 – Tool Permissions**
   - On agent detail page, show all tools with checkboxes:
     - Allowed / not allowed.
   - Implement `/api/agents/[id]/permissions` for batch updates of `ToolPermission`.
   - In DB, ensure `(agentProfileId, toolId)` is unique.

---

## Phase 4 – MCP Host Skeleton

10. **Task 4.1 – MCP Host Script**
    - Create `scripts/mcp-host.ts`.
    - Use `@modelcontextprotocol/sdk` to:
      - Initialize MCP server.
      - Register one internal tool (e.g., `shepgate.ping`) for smoke testing.

11. **Task 4.2 – Agent Identification**
    - Decide how to map incoming calls to an `AgentProfile`:
      - For MVP: read an `AGENT_PROFILE_ID` env var when starting the host.
    - In `mcp-host.ts`, load that profile from DB at startup.

12. **Task 4.3 – Proxy Tool Dispatch**
    - Define a generic MCP tool `shepgate.run_tool` with parameters:
      - `toolName` (string)
      - `arguments` (JSON object)
    - Implement logic:
      - Look up Tool by `toolName`.
      - Call policy engine to decide:
        - blocked
        - needs_approval
        - safe
      - For safe: execute downstream tool:
        - For MCP: call underlying server.
        - For HTTP: call `axios` request.
      - Log to `ActionLog`.

---

## Phase 5 – Policy & Approvals

13. **Task 5.1 – Policy Engine Module**
    - Implement `lib/policy.ts` with:
      - `canExecute(agentProfileId, toolId): { allowed, requiresApproval, reason }` 

14. **Task 5.2 – Pending Actions**
    - When `requiresApproval`:
      - Create `PendingAction` row.
      - Log `ActionLog` entry with status `pending`.
      - Return structured response to AI host indicating "pending approval".

15. **Task 5.3 – Approvals API + UI**
    - `/api/approvals`:
      - GET pending actions.
      - POST approval/denial.
    - `/approvals` page:
      - List pending actions: agent, tool, arguments snippet, createdAt.
      - Approve / Deny buttons.
    - On Approve:
      - Execute underlying tool call.
      - Update `PendingAction.status`.
      - Update `ActionLog` with `approved` and final `success`/`failed`.

---

## Phase 6 – Secrets Handling

16. **Task 6.1 – Secrets Storage**
    - Implement `lib/secrets.ts`:
      - `setSecret(name, value)` 
      - `getSecret(name)` 
      - Use `ENCRYPTION_KEY` environment var to encrypt values.
    - Prisma-backed `Secret` model used here.

17. **Task 6.2 – Secrets UI**
    - `/api/secrets` (owner-only).
    - `/settings/secrets` page:
      - Add/edit secrets by name.
      - Never display full secret value after creation (only "updated at").

18. **Task 6.3 – Tool Secret Mapping**
    - For now, define convention:
      - Server or Tool can reference secret names through configuration fields.
      - Execution layer reads secret names and injects the decryption into HTTP headers or connection strings.

---

## Phase 7 – Activity Log & Summary

19. **Task 7.1 – Activity API**
    - `/api/activity` returns paginated `ActionLog` entries with:
      - agent name
      - tool name
      - status
      - createdAt
      - resultSummary

20. **Task 7.2 – Activity UI**
    - `/activity` page with:
      - filter by agent, tool, status, date range.
      - table view.

21. **Task 7.3 – Weekly Summary Job (Optional)**
    - Implement a server-side function that can generate a summary:
      - number of actions
      - top tools
      - any denied/blocked actions
    - For MVP, just print to console or expose at `/api/activity/summary`.

---

## Phase 8 – Vertical Slice Validation

22. **Task 8.1 – GitHub Read-only Slice**
    - Configure GitHub MCP server and secret token.
    - Register server and sync tools.
    - Create an "OwnerAgent" profile with limited GitHub tools (e.g., read issues/PRs).
    - Manually test via Claude:
      - Ask: "List open PRs for repo X through ShepGate."

23. **Task 8.2 – Risky Action Slice**
    - Configure a fake HTTP "Support Tickets" API with a "close_ticket" tool set to `needs_approval`.
    - In Claude:
      - Ask it to close some tickets.
    - Verify:
      - Pending shows in `/approvals`.
      - Approve and see action execute.
      - Logs appear in `/activity`.

24. **Task 8.3 – Basic Tests**
    - Add unit tests for:
      - `policy.canExecute` 
      - `secrets` encryption/decryption
    - Add at least one integration test that:
      - Simulates MCP host calling a safe tool and verifies logs.

---

## Implementation Notes

- Keep tasks small; after each group, run `git commit`.
- Use Windsurf's AI to implement tasks but always:
  - Compare with this plan.
  - Update this file if you intentionally deviate.
