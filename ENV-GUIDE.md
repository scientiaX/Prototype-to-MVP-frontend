# Environment Variables - Separation of Concerns

## 📋 Prinsip Dasar

**Frontend `.env`** → Public configuration (boleh di-expose ke browser)  
**Backend `.env`** → Private secrets (TIDAK boleh di-expose)

---

## 🎨 Frontend Environment Variables

**File:** `Prototype-to-MVP-frontend/.env`

```env
# API Base URL - URL backend API
VITE_API_BASE_URL=http://localhost:3001/api
```

### Karakteristik Frontend `.env`:
- ✅ Public configuration
- ✅ Boleh di-bundle ke frontend build
- ✅ Bisa di-commit ke Git (tidak ada secrets)
- ✅ Hanya untuk konfigurasi yang tidak sensitif

### Contoh yang SALAH:
```env
# ❌ JANGAN taruh di frontend .env!
OPENAI_API_KEY=sk-xxx
JWT_SECRET=xxx
DATABASE_URL=xxx
```

---

## 🔒 Backend Environment Variables

**File:** `Prototype-to-MVP-backend/.env`

```env
NODE_ENV=production
PORT=3001

# Comet API Configuration
OPENAI_API_KEY=sk-your-comet-api-key-here
OPENAI_BASE_URL=https://api.cometapi.com/v1

# MongoDB Configuration
MONGODB_URI=mongodb://mongodb:27017/prototype-mvp

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-min-32-characters
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Karakteristik Backend `.env`:
- 🔒 Private secrets
- 🔒 TIDAK boleh di-expose ke browser
- 🔒 TIDAK boleh di-commit ke Git
- 🔒 Hanya accessible oleh backend server

---

## 🐳 Docker Compose Configuration

**File:** `docker-compose.yml`

```yaml
backend:
  env_file:
    - ../Prototype-to-MVP-backend/.env  # ← Backend reads from its own .env
  environment:
    OPENAI_API_KEY: ${OPENAI_API_KEY}   # ← Pass from backend .env
    JWT_SECRET: ${JWT_SECRET}
    MONGODB_URI: mongodb://mongodb:27017/prototype-mvp
```

**Frontend tidak perlu secrets:**
```yaml
frontend:
  # Frontend hanya perlu build-time config
  # Runtime config di-inject via nginx reverse proxy
```

---

## 📂 File Structure

```
C:\Users\user\
├── Prototype-to-MVP-frontend/
│   ├── .env                    # ← Frontend config (public)
│   ├── .env.example            # ← Template (commit ke Git)
│   └── docker-compose.yml      # ← References backend .env
│
└── Prototype-to-MVP-backend/
    ├── .env                    # ← Backend secrets (PRIVATE!)
    ├── .env.example            # ← Template (commit ke Git)
    └── src/
```

---

## 🚫 `.gitignore` Configuration

**Frontend `.gitignore`:**
```gitignore
.env
.env.local
.env.*.local
```

**Backend `.gitignore`:**
```gitignore
.env
.env.local
.env.production
.env.development
```

**Aman untuk commit:**
- ✅ `.env.example`
- ✅ `.env.docker` (template saja, no values)

**JANGAN commit:**
- ❌ `.env` (with actual values)
- ❌ Any file containing secrets

---

## ✅ Best Practices

### 1. Never Mix Frontend & Backend Secrets
```bash
# ❌ SALAH
Frontend/.env:
  OPENAI_API_KEY=sk-xxx

# ✅ BENAR
Backend/.env:
  OPENAI_API_KEY=sk-xxx

Frontend/.env:
  VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. Use Different Files for Different Environments
```bash
Backend/
  .env.development     # Local development
  .env.staging         # Staging environment
  .env.production      # Production (use secrets manager!)
  .env.example         # Template for documentation
```

### 3. Production: Use Secrets Manager
Untuk production, jangan simpan secrets di `.env` file:

**Docker Swarm:**
```yaml
secrets:
  openai_api_key:
    external: true
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
```

**Cloud Platforms:**
- AWS: Secrets Manager / Parameter Store
- GCP: Secret Manager
- Azure: Key Vault

---

## 🔍 Security Checklist

- [ ] Backend `.env` tidak di-commit ke Git
- [ ] Frontend `.env` tidak berisi secrets
- [ ] `.gitignore` sudah include `.env`
- [ ] Production menggunakan secrets manager
- [ ] Environment variables di-validate saat startup
- [ ] Secrets rotation strategy ada
- [ ] Access logs untuk secrets usage

---

## 📝 Template Files

### Frontend `.env.example`
```env
# Frontend Public Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

### Backend `.env.example`
```env
NODE_ENV=development
PORT=3001

OPENAI_API_KEY=your_comet_api_key_here
OPENAI_BASE_URL=https://api.cometapi.com/v1

MONGODB_URI=mongodb://localhost:27017/prototype-mvp

JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Setup Commands

### Development
```bash
# Backend
cd Prototype-to-MVP-backend
cp .env.example .env
# Edit .env dengan values yang sebenarnya
npm run dev

# Frontend
cd Prototype-to-MVP-frontend
cp .env.example .env
# No secrets needed!
npm run dev
```

### Production (Docker)
```bash
# Setup backend secrets
cd Prototype-to-MVP-backend
cp .env.example .env
# Edit dengan production values

# Deploy
cd ../Prototype-to-MVP-frontend
docker-compose up -d --build
```

---

## 🔐 Environment Variables Summary

| Variable | Location | Type | Purpose |
|----------|----------|------|---------|
| `VITE_API_BASE_URL` | Frontend | Public | API endpoint URL |
| `OPENAI_API_KEY` | Backend | Secret | Comet API authentication |
| `JWT_SECRET` | Backend | Secret | Token signing |
| `MONGODB_URI` | Backend | Secret | Database connection |
| `CORS_ORIGIN` | Backend | Config | CORS whitelist |

---

**Key Takeaway:** Frontend hanya butuh public config. Semua secrets (API keys, JWT, DB credentials) harus ada di backend!
