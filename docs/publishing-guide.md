# ShepGate Publishing Guide

## Prerequisites

1. **NPM Account**
   - Sign up at https://www.npmjs.com/signup
   - Verify your email

2. **NPM Authentication**
   ```bash
   npm login
   # Or create access token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   ```

3. **GitHub Secrets**
   - Go to repo Settings → Secrets and variables → Actions
   - Add `NPM_TOKEN` with your npm token

---

## Publishing to NPM (Official Steps)

### First Time Setup

1. **Verify package name is available**
   ```bash
   npm view @goldensheepai/shepgate
   # Should return 404 if available
   ```

2. **Test package locally**
   ```bash
   pnpm lint
   pnpm type-check
   ```

3. **Dry run publish**
   ```bash
   npm publish --dry-run --access public
   ```

4. **Publish to NPM**
   ```bash
   npm publish --access public
   ```

### Subsequent Releases

1. **Update version**
   ```bash
   npm version patch  # 0.1.0 → 0.1.1
   npm version minor  # 0.1.1 → 0.2.0
   npm version major  # 0.2.0 → 1.0.0
   ```

2. **Update CHANGELOG.md** with new version notes

3. **Commit and tag**
   ```bash
   git add .
   git commit -m "chore: release v0.1.1"
   git tag -a v0.1.1 -m "Release v0.1.1"
   git push origin main --tags
   ```

4. **Create GitHub Release**
   - Go to Releases → Draft new release
   - Select the tag
   - Copy CHANGELOG entry
   - Publish release

5. **Automatic NPM publish**
   - GitHub Action triggers on release
   - Auto-publishes to NPM with provenance

---

## Manual NPM Publish (If needed)

```bash
# Login to npm
npm login

# Verify you're logged in
npm whoami

# Publish with provenance (recommended)
npm publish --access public --provenance

# Or without provenance
npm publish --access public
```

---

## GitHub Packages (Alternative Registry)

### Setup

1. Create `.npmrc` in project root:
   ```
   @goldensheepai:registry=https://npm.pkg.github.com
   ```

2. Authenticate:
   ```bash
   npm login --registry=https://npm.pkg.github.com
   # Username: YOUR_GITHUB_USERNAME
   # Password: YOUR_GITHUB_PAT
   ```

3. Publish:
   ```bash
   npm publish --registry=https://npm.pkg.github.com
   ```

### Update package.json for GitHub Packages

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@goldensheepai"
  }
}
```

---

## Verification Checklist

After publishing, verify:

- [ ] Package appears on https://www.npmjs.com/package/@goldensheepai/shepgate
- [ ] README renders correctly
- [ ] Version number is correct
- [ ] Badge in README shows latest version
- [ ] Installation works: `npm install @goldensheepai/shepgate`
- [ ] GitHub release is created
- [ ] CHANGELOG is updated

---

## Tracking Downloads

### Real-time Monitoring

```bash
# Weekly downloads
curl https://api.npmjs.org/downloads/point/last-week/@goldensheepai/shepgate

# Monthly downloads
curl https://api.npmjs.org/downloads/point/last-month/@goldensheepai/shepgate

# Range
curl https://api.npmjs.org/downloads/range/2024-01-01:2024-12-31/@goldensheepai/shepgate
```

### Visual Dashboards (Free)

1. **npm-stat.com**
   - URL: https://npm-stat.com/charts.html?package=@goldensheepai/shepgate
   - Automatic charts, no setup needed

2. **npmtrends.com**
   - URL: https://npmtrends.com/@goldensheepai/shepgate
   - Compare with competitors

3. **npm-downlytics**
   - URL: https://npm-downlytics.mazyar.dev/
   - Enter package name, view trends

---

## Troubleshooting

### "You cannot publish over the previously published versions"
- Bump version: `npm version patch`

### "Package name too similar to existing package"
- Use scoped name: `@goldensheepai/shepgate`

### "403 Forbidden"
- Check npm authentication: `npm whoami`
- Verify package name is available
- Ensure `publishConfig.access` is "public"

### "ENEEDAUTH"
- Login again: `npm login`
- Check token hasn't expired

---

## Best Practices

1. **Use Semantic Versioning**
   - MAJOR.MINOR.PATCH (e.g., 1.2.3)
   - Breaking changes = major
   - New features = minor
   - Bug fixes = patch

2. **Always Update CHANGELOG**
   - Document what changed
   - Link to issues/PRs

3. **Tag Releases**
   - Use `git tag -a v0.1.0`
   - Push tags: `git push --tags`

4. **Test Before Publishing**
   - Run `npm publish --dry-run`
   - Check `files` array includes what you need

5. **Enable 2FA on NPM**
   - Security → Two-factor authentication
   - Protect your package from hijacking

---

## Automation

The GitHub Action at `.github/workflows/npm-publish.yml` automatically:

1. Runs on release creation
2. Installs dependencies
3. Runs type check and lint
4. Publishes to npm with provenance
5. Adds supply chain transparency

You can also trigger manually:
- Actions tab → NPM Publish → Run workflow → Enter tag
