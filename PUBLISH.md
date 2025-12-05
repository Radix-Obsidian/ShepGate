# 🚀 Quick Publish Guide

## One-Time Setup

### 1. Login to NPM
```bash
npm login
# Enter your npm credentials
```

### 2. Add NPM Token to GitHub
1. Create token at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Go to: https://github.com/Radix-Obsidian/ShepGate/settings/secrets/actions
3. Add secret: `NPM_TOKEN` = your token

---

## Publishing a Release

### Quick Commands
```bash
# 1. Bump version
npm version patch  # or minor, or major

# 2. Update CHANGELOG.md with new version

# 3. Commit, tag, and push
git add .
git commit -m "chore: release v0.1.1"
git push origin main
git push origin v0.1.1

# 4. Create GitHub Release
# Go to: https://github.com/Radix-Obsidian/ShepGate/releases/new
# Select tag v0.1.1, copy CHANGELOG, publish

# 5. GitHub Action will auto-publish to npm!
```

### Manual Publish (if needed)
```bash
npm publish --access public
```

---

## Track Your Success

### NPM Downloads
- **Charts**: https://npm-stat.com/charts.html?package=@goldensheepai/shepgate
- **Trends**: https://npmtrends.com/@goldensheepai/shepgate
- **API**: `curl https://api.npmjs.org/downloads/point/last-week/@goldensheepai/shepgate`

### GitHub Metrics
- **Traffic**: https://github.com/Radix-Obsidian/ShepGate/graphs/traffic
- **Insights**: https://github.com/Radix-Obsidian/ShepGate/pulse

### Badges (Already in README)
- npm downloads
- npm version
- GitHub stars
- Node.js version

---

## Full Details
See [docs/publishing-guide.md](./docs/publishing-guide.md) for complete documentation.
