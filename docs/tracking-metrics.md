# ShepGate Tracking & Metrics

## Free Tracking Tools

### NPM Downloads
Track package downloads automatically via:

1. **npm-stat.com**
   - URL: https://npm-stat.com/charts.html?package=@goldensheepai/shepgate
   - Features: Daily/weekly/monthly charts, free, no setup

2. **npmtrends.com**
   - URL: https://npmtrends.com/@goldensheepai/shepgate
   - Features: Compare with competitors, trend analysis

3. **NPM API (Automated)**
   ```bash
   curl https://api.npmjs.org/downloads/point/last-week/@goldensheepai/shepgate
   ```

### GitHub Metrics (Built-in)

1. **Repository Insights**
   - URL: https://github.com/Radix-Obsidian/ShepGate/pulse
   - Metrics: Stars, forks, watchers, clones, traffic

2. **GitHub Traffic Tab**
   - Views (unique visitors)
   - Clones (git clone count)
   - Referrers (where traffic comes from)

3. **Release Downloads**
   - Each release shows download count per asset

### Badges for README

Add these to your README for real-time stats:

```markdown
<!-- NPM Downloads -->
![npm](https://img.shields.io/npm/dt/@goldensheepai/shepgate)
![npm](https://img.shields.io/npm/dw/@goldensheepai/shepgate)

<!-- NPM Version -->
![npm](https://img.shields.io/npm/v/@goldensheepai/shepgate)

<!-- GitHub Stats -->
![GitHub stars](https://img.shields.io/github/stars/Radix-Obsidian/ShepGate?style=social)
![GitHub forks](https://img.shields.io/github/forks/Radix-Obsidian/ShepGate?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Radix-Obsidian/ShepGate?style=social)

<!-- Activity -->
![GitHub last commit](https://img.shields.io/github/last-commit/Radix-Obsidian/ShepGate)
![GitHub issues](https://img.shields.io/github/issues/Radix-Obsidian/ShepGate)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Radix-Obsidian/ShepGate)
```

---

## Advanced Tracking (Optional)

### Google Analytics 4 (Free)
- Add to landing page
- Track: Page views, conversions, user flow
- Setup: 5 minutes with gtag.js

### PostHog (Free tier: 1M events/mo)
- Privacy-friendly analytics
- Session replay
- Feature flags
- Self-hostable

### Plausible (Paid, but privacy-focused)
- $9/mo for 10k page views
- No cookies, GDPR compliant
- Clean dashboard

---

## Daily Metrics to Track

| Metric | Source | Goal (Week 1) |
|--------|--------|---------------|
| **GitHub Stars** | GitHub insights | 100+ |
| **NPM Downloads** | npm-stat.com | 500+ |
| **Unique Visitors** | GitHub traffic | 1,000+ |
| **Landing Page Visits** | Google Analytics | 2,000+ |
| **Waitlist Signups** | Email service | 200+ |
| **Discord Members** | Discord | 50+ |

---

## Automated Tracking Setup

### Option 1: GitHub Actions Badge
Create `.github/workflows/metrics.yml`:

```yaml
name: Update Metrics
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch NPM stats
        run: |
          curl https://api.npmjs.org/downloads/point/last-week/@goldensheepai/shepgate \
            > metrics/npm-downloads.json
      
      - name: Commit metrics
        run: |
          git config user.name "github-actions[bot]"
          git add metrics/
          git commit -m "chore: update metrics [skip ci]"
          git push
```

### Option 2: Dashboard Script
Create `scripts/metrics-dashboard.ts`:

```typescript
import fetch from 'node-fetch';

async function getMetrics() {
  // NPM downloads
  const npm = await fetch(
    'https://api.npmjs.org/downloads/point/last-week/@goldensheepai/shepgate'
  ).then(r => r.json());

  // GitHub stars
  const github = await fetch(
    'https://api.github.com/repos/Radix-Obsidian/ShepGate'
  ).then(r => r.json());

  console.log('📊 ShepGate Metrics');
  console.log('━'.repeat(40));
  console.log(`NPM Downloads (7d): ${npm.downloads}`);
  console.log(`GitHub Stars: ${github.stargazers_count}`);
  console.log(`GitHub Forks: ${github.forks_count}`);
  console.log(`Open Issues: ${github.open_issues_count}`);
}

getMetrics();
```

Run with: `npx tsx scripts/metrics-dashboard.ts`

---

## Conversion Funnel Tracking

```
Landing Page Visit
    ↓ (Track with GA4)
Waitlist Signup
    ↓ (Track with email service)
GitHub Star
    ↓ (Track with GitHub API)
NPM Install
    ↓ (Track with npm-stat)
Active User (7-day return)
    ↓ (Track with PostHog)
```

---

## Export Data

All these tools support CSV export for deeper analysis in Google Sheets or Excel.
