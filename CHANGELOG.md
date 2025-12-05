# Changelog

All notable changes to ShepGate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-user authentication
- Team workspaces
- VS Code extension
- Hosted cloud version

---

## [0.1.0] - 2024-12-04

### Added
- **Policy Engine** with three-tier risk levels:
  - `safe` - Auto-execute without approval
  - `needs_approval` - Queue for human review
  - `blocked` - Always deny execution
- **Approval Workflow** - Pending actions queue with approve/deny
- **Activity Logging** - Complete audit trail of all AI actions
- **Secrets Vault** - AES-256-GCM encrypted credential storage
- **MCP Host** - Stdio-based server for Claude Desktop integration
- **Web Dashboard** - Full CRUD for servers, tools, agents, permissions
- **Claude Desktop Integration** - Working MCP server connection

### Technical
- Next.js 16 with App Router
- Prisma ORM with PostgreSQL
- TypeScript 5 strict mode
- Model Context Protocol SDK integration

### Known Limitations
- Single-user authentication only (owner via .env)
- Mock execution fallback when real MCP fails
- No team or organization features yet

---

## [0.0.1] - 2024-11-XX

### Added
- Initial project scaffolding
- Basic database schema
- Spec-driven development structure

---

[Unreleased]: https://github.com/golden-sheep-ai/shepgate/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/golden-sheep-ai/shepgate/releases/tag/v0.1.0
[0.0.1]: https://github.com/golden-sheep-ai/shepgate/releases/tag/v0.0.1
