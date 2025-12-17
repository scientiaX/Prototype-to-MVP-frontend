# Prototype to MVP - Docker Deployment Guide

## Prasyarat

✅ Docker Desktop installed  
✅ Docker Compose installed  
✅ Comet API Key dari https://www.cometapi.com

## Struktur Project

Pastikan struktur folder seperti ini:

```
C:\Users\user\
├── Prototype-to-MVP-frontend/
│   ├── docker-compose.yml      ← Orchestration file
│   ├── Dockerfile              ← Frontend container
│   ├── nginx.conf              ← Nginx configuration
│   ├── .env                    ← Environment variables
│   ├── src/
│   └── ...
│
└── Prototype-to-MVP-backend/
    ├── Dockerfile              ← Backend container
    ├── src/
    ├── package.json
    └── ...
```

---

## Setup & Deployment

### 1. Setup Backend Environment

**PENTING: Secrets harus ada di backend `.env`, bukan frontend!**

```bash
# Pindah ke folder backend
cd C:\Users\user\Prototype-to-MVP-backend

# Copy environment template
copy .env.example .env
```

### 2. Edit Backend Environment Variables

Buka file `C:\Users\user\Prototype-to-MVP-backend\.env` dan isi:

```env
NODE_ENV=production
PORT=3001

# Comet API Configuration
OPENAI_API_KEY=sk-your-comet-api-key-here
OPENAI_BASE_URL=https://api.cometapi.com/v1

# MongoDB Configuration
MONGODB_URI=mongodb://mongodb:27017/prototype-mvp

# JWT Configuration
JWT_SECRET=your-secure-random-string-min-32-characters
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost
```

**Cara generate JWT_SECRET (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 3. Setup Frontend Environment (Optional)

Frontend `.env` hanya untuk public configuration, tidak ada secrets:

```bash
cd C:\Users\user\Prototype-to-MVP-frontend

# Copy template
copy .env.example .env
```

File `.env` frontend:
```env
VITE_API_BASE_URL=http://localhost/api
```

### 4. Build dan Run

```bash
# Build semua images dan start containers
docker-compose up -d --build

# Tanpa rebuild (jika sudah pernah build)
docker-compose up -d
```

**Proses yang terjadi:**
1. Build backend image dengan Node.js dependencies
2. Build frontend image dengan Vite + Nginx
3. Pull MongoDB image
4. Start semua containers
5. Setup networking antar containers

### 4. Verify Deployment

```bash
# Check semua container running
docker-compose ps

# Expected output:
# NAME                        STATUS      PORTS
# prototype-mvp-backend       Up          0.0.0.0:3001->3001/tcp
# prototype-mvp-frontend      Up          0.0.0.0:80->80/tcp
# prototype-mvp-mongodb       Up          0.0.0.0:27017->27017/tcp
```

### 5. Check Logs

```bash
# Semua logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend

# MongoDB logs only
docker-compose logs -f mongodb
```

### 6. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/health
- **MongoDB**: localhost:27017

### 7. Set Mock User (Browser Console)

Buka http://localhost, tekan F12, jalankan:

```javascript
localStorage.setItem('current_user', JSON.stringify({
  email: 'user@example.com',
  name: 'Test User'
}));
```

Refresh halaman dan mulai gunakan aplikasi.

---

## Docker Commands Reference

### Container Management

```bash
# Stop semua containers
docker-compose down

# Stop dan hapus volumes (reset database)
docker-compose down -v

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Rebuild specific service
docker-compose up -d --build backend
```

### Logs & Debugging

```bash
# Follow logs real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs dari specific service
docker-compose logs backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### Scaling

```bash
# Scale backend (jika perlu load balancing)
docker-compose up -d --scale backend=3
```

### Clean Up

```bash
# Stop dan remove containers
docker-compose down

# Remove containers + volumes
docker-compose down -v

# Remove containers + images
docker-compose down --rmi all

# Full cleanup
docker-compose down -v --rmi all
docker system prune -a
```

---

## Health Checks

Setiap service punya health check:

### Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Prototype to MVP Backend API",
  "timestamp": "2025-12-17T..."
}
```

### Frontend Health
```bash
curl http://localhost
```

Harus return HTML page.

### MongoDB Health
```bash
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

---

## Troubleshooting

### Problem: Container tidak start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port sudah dipakai
netstat -ano | findstr :3001
netstat -ano | findstr :80

# 2. Backend folder tidak ditemukan
# Check docker-compose.yml context path
```

### Problem: Backend tidak connect ke MongoDB

```bash
# Check MongoDB health
docker-compose ps mongodb

# Check backend environment
docker-compose exec backend printenv | findstr MONGODB

# Restart MongoDB
docker-compose restart mongodb
```

### Problem: Frontend tidak bisa akses backend API

```bash
# Check nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Check network
docker network ls
docker network inspect prototype-to-mvp-frontend_prototype-mvp-network

# Test dari frontend container
docker-compose exec frontend wget -O- http://backend:3001/health
```

### Problem: AI generation error

```bash
# Check Comet API key
docker-compose exec backend printenv | findstr OPENAI

# Check backend logs
docker-compose logs backend | findstr -i error
```

### Problem: Build gagal

```bash
# Clear cache dan rebuild
docker-compose build --no-cache

# Check Dockerfile
docker-compose config
```

---

## Data Persistence

MongoDB data disimpan di Docker volume:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect prototype-to-mvp-frontend_mongodb_data

# Backup database
docker-compose exec mongodb mongodump --out=/backup
docker cp prototype-mvp-mongodb:/backup ./mongodb-backup

# Restore database
docker cp ./mongodb-backup prototype-mvp-mongodb:/backup
docker-compose exec mongodb mongorestore /backup
```

---

## Production Deployment

### Rekomendasi untuk Production:

1. **Gunakan environment yang berbeda**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Enable HTTPS dengan reverse proxy (Nginx/Traefik)**

3. **Setup MongoDB authentication**
   ```yaml
   mongodb:
     environment:
       MONGO_INITDB_ROOT_USERNAME: admin
       MONGO_INITDB_ROOT_PASSWORD: secure-password
   ```

4. **Use secrets management (Docker secrets / Vault)**

5. **Add monitoring (Prometheus + Grafana)**

6. **Setup backup automation**

7. **Use managed MongoDB (MongoDB Atlas)**

8. **Load balancing untuk backend**

---

## Update Application

### Update Backend Code

```bash
# Stop backend
docker-compose stop backend

# Rebuild
docker-compose build backend

# Start
docker-compose up -d backend
```

### Update Frontend Code

```bash
docker-compose stop frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Update Semua

```bash
# Pull latest code (jika dari Git)
git pull

# Rebuild dan restart
docker-compose up -d --build
```

---

## Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Application Metrics

```bash
# Backend response time
time curl http://localhost:3001/health

# Database size
docker-compose exec mongodb mongosh --eval "db.stats()"
```

---

## Security Checklist

- ✅ `.env` tidak di-commit ke Git
- ✅ JWT secret adalah random string
- ✅ MongoDB tidak exposed ke public
- ✅ Backend API punya rate limiting (TODO)
- ✅ CORS configured properly
- ✅ Helmet.js enabled untuk security headers
- ⚠️ Implement real authentication (TODO)

---

## Support

Jika ada masalah:

1. Check logs: `docker-compose logs -f`
2. Check container status: `docker-compose ps`
3. Verify environment: `docker-compose config`
4. Test connectivity: `docker-compose exec backend wget -O- http://mongodb:27017`
