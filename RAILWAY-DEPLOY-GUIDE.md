# Railway Auto-Deploy Guide

## Problem yang Dialami
Railway tidak auto-rebuild/redeploy saat git push, harus manual delete service dan redeploy.

## Solusi yang Sudah Diimplementasikan

### 1. Railway Configuration ([railway.json](file:///c:/Users/user/Prototype-to-MVP-frontend/railway.json))

File ini memberitahu Railway cara deploy aplikasi dengan benar:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "healthcheck": {
    "path": "/health",
    "timeout": 30,
    "interval": 10
  }
}
```

**Key benefits:**
- Explicit DOCKERFILE builder (Railway tahu harus rebuild Docker image)
- Auto-restart policy jika crash
- Healthcheck endpoint untuk monitoring

### 2. Optimized Dockerfile

**Changes:**
- Added `BUILD_DATE` argument untuk force rebuild
- Improved layer caching (package.json terpisah dari source code)
- Added healthcheck inside Docker
- Better cleanup di production stage

### 3. Docker Ignore ([.dockerignore](file:///c:/Users/user/Prototype-to-MVP-frontend/.dockerignore))

Exclude unnecessary files dari Docker build:
- `node_modules` (akan di-install fresh)
- Documentation files
- Git files
- Environment files

**Benefits:**
- Faster builds (smaller context)
- Lebih deterministic (no leftover cache)

---

## Cara Deploy ke Railway

### First Time Setup

1. **Connect Repository**
   ```bash
   # Di Railway dashboard:
   # New Project → Deploy from GitHub repo → Select repo
   ```

2. **Set Environment Variables**
   
   Railway dashboard → Variables → Add:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   PORT=80
   ```

3. **Deploy akan auto-trigger**

### Subsequent Deployments (Auto)

Setelah setup awal, setiap kali push ke GitHub:

```bash
git add .
git commit -m "Update: new features"
git push origin main
```

Railway akan otomatis:
1. ✅ Detect git push
2. ✅ Pull latest code
3. ✅ Rebuild Docker image (dengan BUILD_DATE baru)
4. ✅ Deploy container baru
5. ✅ Run healthcheck
6. ✅ Switch traffic ke deployment baru

**Timeline:** ~2-4 menit total

---

## Troubleshooting

### Jika Deploy Masih Tidak Auto-Trigger

**Check 1: Railway Service Settings**
- Dashboard → Service Settings → Source
- Pastikan "Watch Paths" kosong atau `**/*` (watch semua files)
- Branch harus sesuai (main/master)

**Check 2: Manual Trigger** (temporary workaround)
```bash
# Commit dengan BUILD_DATE
git commit --allow-empty -m "Force rebuild"
git push
```

**Check 3: Railway CLI** (alternative)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy manual
railway up
```

### Jika Build Berhasil tapi Changes Tidak Muncul

**Possible cause:** Browser cache

**Solution:**
```bash
# Hard refresh browser
# Chrome/Edge: Ctrl + Shift + R
# Firefox: Ctrl + F5
```

**Or check deployment URL langsung:**
```
https://your-app.railway.app/build-info.txt
```
File ini berisi build timestamp, harus update setiap deployment.

---

## Verification

Setelah deployment, verify:

1. **Healthcheck endpoint:**
   ```bash
   curl https://your-app.railway.app/health
   # Should return: healthy
   ```

2. **Build info:**
   ```bash
   curl https://your-app.railway.app/build-info.txt
   # Should show latest build timestamp
   ```

3. **Railway logs:**
   ```bash
   railway logs
   # Should show successful deployment
   ```

---

## Best Practices

1. **Always commit railway.json**
   ```bash
   git add railway.json
   ```

2. **Use descriptive commit messages**
   ```bash
   git commit -m "feat: add modern layout design"
   ```

3. **Monitor deployment di Railway dashboard**
   - Check build logs untuk errors
   - Verify deployment status

4. **Set up notifications**
   - Railway → Project Settings → Notifications
   - Connect Slack/Discord untuk deployment alerts

---

## Alternative: GitHub Actions (Optional)

Jika Railway webhook masih bermasalah, bisa setup GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      
      - name: Deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up
```

**Setup:**
1. Railway → Account Settings → Tokens → Create token
2. GitHub → Repo Settings → Secrets → Add `RAILWAY_TOKEN`
3. Push akan trigger GitHub Action → Railway deploy

---

## Summary

✅ **Files Added/Modified:**
- `railway.json` - Railway config
- `Dockerfile` - Optimized dengan build args
- `.dockerignore` - Exclude unnecessary files

✅ **Expected Behavior:**
- Git push → Auto rebuild & redeploy
- No manual intervention needed
- Healthcheck monitoring

✅ **Debug Tools:**
- `/health` endpoint
- `/build-info.txt` untuk verify deployment
- Railway logs
