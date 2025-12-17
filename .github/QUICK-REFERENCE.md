# GitHub Actions - Quick Reference

## Status Badges

Add to README.md:
```markdown
![CI](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/CI%20-%20Build%20and%20Test/badge.svg)
![Deploy](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
```

## Required Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

### For Production Deployment:
```
DEPLOY_HOST          # Production server IP/hostname
DEPLOY_USER          # SSH username for deployment
DEPLOY_SSH_KEY       # SSH private key (entire key, including headers)
DEPLOY_URL           # Production URL (e.g., https://app.example.com)
API_BASE_URL         # Backend API URL for frontend build
```

### For Private Backend Repo (if needed):
```
BACKEND_TOKEN        # GitHub Personal Access Token with repo scope
```

## Quick Actions

### Trigger Manual Deployment:
1. Go to **Actions** tab
2. Select **CD - Deploy to Production**
3. Click **Run workflow**
4. Select branch → **Run workflow**

### Create Release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Force Re-run Failed Workflow:
1. **Actions** tab → Select failed run
2. **Re-run failed jobs** or **Re-run all jobs**

## SSH Key Setup

Generate SSH key for deployment:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f deploy_key
```

Add to GitHub Secrets:
- `DEPLOY_SSH_KEY`: Content of `deploy_key` (private key)

Add to server:
```bash
cat deploy_key.pub >> ~/.ssh/authorized_keys
```

## Troubleshooting

**Build fails?**
- Check `package.json` scripts
- Review Dockerfile syntax
- Check build logs in Actions tab

**Deployment fails?**
- Verify SSH connection: `ssh -i deploy_key user@host`
- Check server logs: `docker-compose logs`
- Ensure server has Docker installed

**Security scan fails?**
- Review findings in **Security** tab
- Update vulnerable dependencies: `npm update`
- Check Trivy output in workflow logs
