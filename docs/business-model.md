# ShepGate Business Model

## Overview

ShepGate follows a **freemium model** designed for non-technical founders and small teams who need AI governance without enterprise complexity or pricing.

**Payment Provider:** LemonSqueezy (preferred) or PayPal Braintree
- No Stripe dependency
- Built-in tax handling
- Easy subscription management
- Better for indie/bootstrap products

---

## Pricing Tiers

### 🆓 Free (Shepherd)
**$0/month** — Perfect for solo founders and experimentation

| Feature | Limit |
|---------|-------|
| Agents | 1 |
| Servers (MCP connections) | 2 |
| Tools | 10 |
| Activity log retention | 7 days |
| Approvals | Unlimited |
| Secrets | 5 |
| Support | Community (Discord/GitHub) |

**Use case:** Solo founder testing Claude + GitHub integration

---

### 🐑 Pro (Flock)
**$19/month** — For serious builders

| Feature | Limit |
|---------|-------|
| Agents | 5 |
| Servers (MCP connections) | 10 |
| Tools | Unlimited |
| Activity log retention | 90 days |
| Approvals | Unlimited |
| Secrets | 25 |
| Support | Email (48hr response) |
| Export | CSV activity export |

**Use case:** Small team with multiple AI workflows

---

### 🏔️ Scale (Herd)
**$49/month** — For growing teams

| Feature | Limit |
|---------|-------|
| Agents | 20 |
| Servers (MCP connections) | Unlimited |
| Tools | Unlimited |
| Activity log retention | 1 year |
| Approvals | Unlimited |
| Secrets | 100 |
| Support | Priority email (24hr) |
| Export | CSV + API access |
| Webhooks | Coming soon |
| SSO | Coming soon |

**Use case:** Agency or startup with multiple AI-powered products

---

## Why This Pricing Works

### For Users (Non-Technical Founders)
1. **Start free** — No credit card, immediate value
2. **Clear upgrade path** — Know exactly when you need Pro
3. **Affordable** — Less than a single SaaS subscription
4. **No per-seat pricing** — Predictable costs

### For Golden Sheep AI
1. **Low friction** — Free tier drives adoption
2. **Natural expansion** — Users upgrade when they hit limits
3. **Sustainable unit economics:**
   - Free: $0 cost (limited DB rows)
   - Pro: ~$2-3 infra cost → $16+ margin
   - Scale: ~$5-8 infra cost → $41+ margin

---

## Implementation Plan (Post-MVP)

### Phase 1: Usage Tracking (v0.2)
- Count agents, servers, tools per account
- Add activity log retention cleanup job
- Display usage on dashboard

### Phase 2: Paywall (v0.2)
- Soft limits (warning when approaching)
- Hard limits (block creation, not execution)
- Upgrade prompts in UI

### Phase 3: LemonSqueezy Integration (v0.2)
```
User Dashboard → "Upgrade" → LemonSqueezy Checkout → Webhook → Unlock limits
```

- Use LemonSqueezy hosted checkout
- Webhook updates `subscription_tier` in DB
- Customer portal for billing management

---

## Competitor Comparison

| Tool | Pricing | Target |
|------|---------|--------|
| **ShepGate** | $0-49/mo | Solo founders, small teams |
| Anthropic Console | Per-token | Developers |
| LangSmith | $0-400+/mo | Enterprise ML teams |
| Portkey | $0-99+/mo | API gateway focus |

**Our differentiation:** Non-technical UX + approval workflows + affordable flat pricing

---

## Revenue Projections (Conservative)

| Month | Free Users | Pro ($19) | Scale ($49) | MRR |
|-------|------------|-----------|-------------|-----|
| 1 | 50 | 2 | 0 | $38 |
| 3 | 200 | 10 | 2 | $288 |
| 6 | 500 | 30 | 5 | $815 |
| 12 | 1,000 | 80 | 15 | $2,255 |

**Target:** $2K MRR by month 12 (validation milestone)

---

## What MVP Doesn't Need

Per the spec, these are **out of scope** for v0.1:
- ❌ Multi-tenant SaaS onboarding
- ❌ Team-level RBAC
- ❌ Billing integration
- ❌ Usage metering

**MVP focus:** Prove the core value (policy + approvals + logging)

---

## Next Steps

1. ✅ Launch MVP (v0.1) — Free, single-user
2. 🔜 Add usage tracking (v0.2)
3. 🔜 Integrate LemonSqueezy (v0.2)
4. 🔜 Multi-user auth (v0.2)
5. 🔜 Team workspaces (v0.3)
