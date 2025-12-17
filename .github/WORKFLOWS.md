# GitHub Workflows Documentation

## 📋 Overview

Project ini memiliki 5 GitHub Actions workflows untuk automation CI/CD, testing, security, dan dependency management.

---

## 🔄 Workflows

### 1. **CI - Build and Test** (`ci.yml`)

**Trigger:**
- Push ke `main` atau `develop`
- Pull Request ke `main` atau `develop`

**Fungsi:**
- ✅ Lint code (ESLint)
- ✅ Type checking
- ✅ Build frontend
- ✅ Build Docker images
- ✅ Security scanning dengan Trivy
- ✅ Upload security reports ke GitHub Security tab

**Kenapa Penting:**
- Deteksi error sebelum merge
- Pastikan code quality konsisten
- Catch security vulnerabilities early
- Automasi yang biasanya dilakukan manual

**Hasil:**
- ❌ Workflow gagal = code ada masalah, tidak bisa merge
- ✅ Workflow berhasil = code siap untuk review/merge

---

### 2. **CD - Deploy to Production** (`deploy.yml`)

**Trigger:**
- Push ke `main` branch
- Push tag `v*.*.*` (contoh: v1.0.0)
- Manual trigger via GitHub UI

**Fungsi:**
- 🐳 Build Docker image
- 📦 Push ke GitHub Container Registry (ghcr.io)
- 🚀 Deploy ke production server via SSH
- 🏥 Health check setelah deployment
- 📢 Notifikasi hasil deployment

**Kenapa Penting:**
- **Zero-downtime deployment**: Otomatis deploy tanpa manual SSH
- **Versioning**: Setiap deploy punya tag/version yang jelas
- **Rollback mudah**: Bisa rollback ke version sebelumnya
- **Consistency**: Deploy process selalu sama, tidak ada human error

**Setup Required:**

GitHub Secrets yang perlu ditambahkan:
```
DEPLOY_HOST          # IP/hostname server production
DEPLOY_USER          # SSH username
DEPLOY_SSH_KEY       # Private SSH key
DEPLOY_URL           # URL production untuk health check
API_BASE_URL         # Base URL API untuk build
```

**Cara Set Secrets:**
1. GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Tambahkan secrets di atas

---

### 3. **Docker Compose Test** (`docker-test.yml`)

**Trigger:**
- Pull Request yang mengubah:
  - `docker-compose.yml`
  - `Dockerfile`
  - `nginx.conf`

**Fungsi:**
- 🧪 Test full stack dengan Docker Compose
- ✅ Verify semua services (MongoDB, Backend, Frontend) berjalan
- 🏥 Health check semua endpoints
- 📊 Show logs jika ada yang gagal

**Kenapa Penting:**
- **Catch Docker config errors**: Sebelum deploy, tau kalau config broken
- **Integration testing**: Test semua services jalan together
- **Confidence**: Yakin bahwa Docker setup works di environment bersih

**Setup:**
Perlu setup backend repository checkout. Jika backend private, tambahkan:
```
Secrets:
  BACKEND_TOKEN  # Personal Access Token untuk checkout backend repo
```

---

### 4. **Dependency Update Check** (`dependency-check.yml`)

**Trigger:**
- Schedule: Setiap Minggu (Sunday 00:00 UTC)
- Manual trigger via GitHub UI

**Fungsi:**
- 🔍 Check outdated npm packages
- 🔒 Run security audit
- 🐛 Auto-create GitHub issue jika ada vulnerabilities

**Kenapa Penting:**
- **Security**: Deteksi vulnerabilities dari dependencies
- **Maintenance**: Tau package mana yang outdated
- **Automation**: Tidak perlu manual check `npm audit`
- **Proactive**: Fix security issues sebelum jadi masalah

**Output:**
- Create issue otomatis dengan label `security` dan `dependencies`
- Issue berisi list vulnerabilities yang perlu di-fix

---

### 5. **Release** (`release.yml`)

**Trigger:**
- Push tag dengan format `v*.*.*` (contoh: `v1.2.3`)

**Fungsi:**
- 📝 Generate changelog otomatis dari git commits
- 🎉 Create GitHub Release
- 🐳 Build dan push Docker images dengan version tags
- 🏷️ Tag image sebagai `latest` dan version spesifik

**Kenapa Penting:**
- **Versioning**: Structured versioning untuk production releases
- **Changelog**: Auto-generated release notes
- **Docker tags**: Image tagged dengan version untuk easy rollback
- **Documentation**: Release notes untuk tracking changes

**Cara Pakai:**
```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# Workflow otomatis:
# 1. Create GitHub Release
# 2. Build image: ghcr.io/repo:1.0.0
# 3. Tag latest: ghcr.io/repo:latest
```

---

## 🎯 Manfaat Keseluruhan

### 1. **Quality Assurance**
- ✅ Automated testing setiap push
- ✅ Code review process lebih smooth
- ✅ Catch bugs sebelum production

### 2. **Security**
- 🔒 Security scanning otomatis
- 🔒 Dependency vulnerability alerts
- 🔒 Container image scanning

### 3. **Deployment Automation**
- 🚀 One-click deploy ke production
- 🚀 Consistent deployment process
- 🚀 Easy rollback dengan tagged versions

### 4. **Developer Experience**
- 💻 Fast feedback loop
- 💻 Tidak perlu manual setup CI/CD
- 💻 Focus on coding, automation handles the rest

### 5. **Maintenance**
- 🔧 Weekly dependency checks
- 🔧 Automated security patches alerts
- 🔧 Clear versioning and changelog

---

## 🚨 Important Notes

### Required GitHub Secrets

**For Deployment (`deploy.yml`):**
```
DEPLOY_HOST          # Server IP/hostname
DEPLOY_USER          # SSH username
DEPLOY_SSH_KEY       # SSH private key
DEPLOY_URL           # Production URL
API_BASE_URL         # API endpoint URL
```

**For Backend Checkout (if private):**
```
BACKEND_TOKEN        # GitHub PAT with repo access
```

### Setup Steps

1. **Enable GitHub Actions:**
   - Repo → Settings → Actions → General
   - Allow all actions and reusable workflows

2. **Add Secrets:**
   - Repo → Settings → Secrets and variables → Actions
   - Add all required secrets

3. **Enable Container Registry:**
   - Packages akan otomatis publish ke ghcr.io
   - Make sure repo visibility settings allow it

4. **Branch Protection (Recommended):**
   - Repo → Settings → Branches
   - Add rule for `main`:
     - Require status checks to pass (CI workflow)
     - Require pull request reviews

---

## 📊 Workflow Status Badges

Tambahkan ke README.md:

```markdown
![CI](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/CI%20-%20Build%20and%20Test/badge.svg)
![Docker](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/Docker%20Compose%20Test/badge.svg)
```

---

## 🔧 Troubleshooting

### Workflow gagal di step "Build Docker"
- Check Dockerfile syntax
- Check build context path
- Review logs di GitHub Actions tab

### Deployment gagal
- Verify SSH key di secrets
- Check server accessibility
- Review deploy script di `deploy.yml`

### Security scan menemukan vulnerabilities
- Check Trivy results di Security tab
- Update dependencies: `npm update`
- Review and fix high/critical issues

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy-action)

---

## ✅ Checklist Sebelum Push ke Main

- [ ] Local testing passed
- [ ] Docker compose works locally
- [ ] Environment variables documented
- [ ] Secrets configured di GitHub
- [ ] Branch protection enabled
- [ ] README updated jika ada perubahan major
