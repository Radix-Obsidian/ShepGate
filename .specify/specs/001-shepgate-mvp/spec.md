# ShepGate MVP – Product Specification (001-shepgate-mvp)

## 1. Problem

Small teams want to connect AI agents (Claude, Windsurf, etc.) to their real tools (GitHub, DBs, ticketing systems), but:

- API keys and secrets are scattered across `.env` files, configs, and AI prompts.
- It's hard to see or control what an AI is allowed to do.
- Risky actions (deleting data, refunding money, closing tickets) can be executed without a human sanity check.
- There is no simple "what did my AI do this week?" view.

MCP solves the **connection standard** but not the **governance and safety layer**.

## 2. Users

1. **Non-technical founders / PMs**
   - Want to safely use AI agents against production tools.
   - Need a non-intimidating UI to enable/disable tools and approve risky actions.

2. **Small dev teams (3–20 people)**
   - Set up the connections to GitHub/DB/other APIs.
   - Need a reliable way to control access and debug issues.

3. **Future: Security-minded dev lead**
   - Wants a single place to review and explain incidents:
     - "Which agent touched this repo?"
     - "Who approved this bulk operation?"

## 3. Core Jobs to Be Done

1. **Connect AI agents to tools safely**
   - As a founder, I want to connect Claude/Windsurf to GitHub and my DB through ShepGate so the AI can help, without giving it raw keys.

2. **Limit what each agent can do**
   - As a team, we want "read-only" agents and "ops" agents with different tool access.

3. **Approve risky actions**
   - As a founder, I want to approve or deny dangerous actions before they run:
     - closing many tickets
     - deleting users
     - running destructive DB commands

4. **Review what the AI did**
   - As a founder, I want a simple timeline:
     - which agents ran which tools
     - arguments used
     - results and whether they were approved or blocked.

## 4. MVP Scope (Must-Haves)

1. **Single AI host integration**
   - ShepGate presents itself as an MCP server to Claude (Claude Code / Claude Desktop).
   - Claude can list and call tools proxied through ShepGate.

2. **Tool catalog & per-agent permissions**
   - Register MCP servers:
     - at least: GitHub MCP server, Filesystem, a Postgres MCP server, and one HTTP API wrapper.
   - ShepGate ingests and displays available tools per server.
   - Define Agent Profiles:
     - Choose which tools each agent can see/use.

3. **Risk tags and approvals**
   - Each tool can be tagged `safe` or `needs_approval`.
   - When an AI attempts a `needs_approval` tool:
     - ShepGate queues the action.
     - A human can approve/deny through the web dashboard.
     - On approval, ShepGate executes the tool call and returns the result.

4. **Secrets vault (MVP)**
   - Store API keys and DB credentials securely.
   - Tools reference secrets by name.
   - LLMs/agents never see raw secrets in prompts.

5. **Audit log**
   - Every tool call is recorded:
     - timestamp
     - agent profile
     - tool name
     - arguments (with sensitive parts redacted)
     - status: success / failed / blocked / pending / approved / denied

6. **Basic web dashboard**
   - Login for a single "owner" user (email + password).
   - Screens:
     - Servers & tools
     - Agent profiles & permissions
     - Pending approvals
     - Activity log

## 5. Out of Scope (for MVP)

- Multi-tenant SaaS onboarding and billing.
- Team-level RBAC (just a single owner account in v0.1).
- Complex policy conditions (e.g., time-based rules, per-environment rules).
- Graph views, advanced analytics, or cost optimization.
- Integration with multiple AI hosts beyond Claude; others can come later.

## 6. Success Criteria (MVP)

Qualitative:

- Founder can:
  - connect at least 2 real tools (e.g., GitHub and a DB),
  - restrict tools to a single "SupportAgent" profile,
  - see approvals working end-to-end,
  - navigate the dashboard without reading a protocol spec.

Quantitative (internal):

- Complete at least one real **vertical slice**:
  - Claude reads GitHub issues through ShepGate.
  - Claude attempts a risky tool; ShepGate requires approval; founder approves; action executes; log shows end-to-end.

## 7. Experience Notes

- Language in the UI must be human:
  - Use "Agent profile", "Tool", "Safe", "Needs approval", "Blocked".
  - Avoid "MCP server", "JSON-RPC", etc. on top-level screens.
- Default configuration should be conservative:
  - All new tools default to `blocked` until explicitly enabled and tagged.
