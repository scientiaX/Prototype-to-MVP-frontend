# Quick Start - Docker Only

## Prasyarat
- ✅ Docker Desktop
- ✅ Comet API Key: https://www.cometapi.com

## Langkah-langkah

### 1️⃣ Setup Environment
```bash
copy .env.docker .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-your-comet-api-key
JWT_SECRET=random-32-char-string
```

### 2️⃣ Deploy
```bash
docker-compose up -d --build
```

### 3️⃣ Set User (di browser console)
```javascript
localStorage.setItem('current_user', JSON.stringify({
  email: 'user@example.com',
  name: 'Test User'
}));
```

### 4️⃣ Akses
http://localhost

---

## Commands

**View logs:**
```bash
docker-compose logs -f
```

**Stop:**
```bash
docker-compose down
```

**Restart:**
```bash
docker-compose restart backend
```

---

## Troubleshooting

**Check status:**
```bash
docker-compose ps
```

**Backend logs:**
```bash
docker-compose logs backend
```

**Frontend logs:**
```bash
docker-compose logs frontend
```

---

✨ **Tidak perlu `npm install`! Semua dependency otomatis di-install di dalam Docker container.**
