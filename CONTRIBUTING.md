# Contributing to ShepGate

Thank you for your interest in contributing to ShepGate! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building tools to make AI safer for everyone.

## Getting Started

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shepgate.git
   cd shepgate
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Set up your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```
5. Run migrations:
   ```bash
   pnpm db:migrate
   ```
6. Start development:
   ```bash
   pnpm dev
   ```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add approval notification emails
fix: correct policy evaluation for blocked tools
docs: update Claude Desktop setup guide
refactor: extract policy logic into separate module
```

## Pull Request Process

1. **Create a branch** from `main`
2. **Make your changes** with clear, focused commits
3. **Test thoroughly** - ensure existing tests pass and add new tests if needed
4. **Update documentation** if your changes affect user-facing features
5. **Submit a PR** with a clear description of what and why

### PR Checklist

- [ ] Code follows existing style patterns
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Changes are tested manually
- [ ] Documentation is updated if needed
- [ ] CHANGELOG.md is updated for user-facing changes

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Prefer explicit types over inference for public APIs
- Use meaningful variable names
- Keep functions small and focused

### File Structure

```
src/
  app/           # Next.js pages and API routes
  components/    # React components
  lib/           # Shared utilities and business logic
scripts/         # CLI tools and utilities
prisma/          # Database schema and migrations
```

### Testing

```bash
# Run all tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Relevant logs or screenshots

### Feature Requests

Include:
- Problem you're trying to solve
- Proposed solution
- Alternatives considered
- Any relevant context

## Questions?

- Open a [GitHub Discussion](https://github.com/golden-sheep-ai/shepgate/discussions)
- Email: hello@goldensheep.ai

---

Thank you for contributing to making AI agents safer! 🐑
