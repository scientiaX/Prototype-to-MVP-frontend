# Quick Start - Docker Only

## Prasyarat
- ✅ Docker Desktop
- ✅ Comet API Key: https://www.cometapi.com

## Langkah-langkah

### 1️⃣ Setup Backend Environment
```bash
cd ..\Prototype-to-MVP-backend
copy .env.example .env
```

Edit `../Prototype-to-MVP-backend/.env`:
```env
OPENAI_API_KEY=sk-your-comet-api-key
JWT_SECRET=random-32-char-string
MONGODB_URI=mongodb://mongodb:27017/prototype-mvp
```

### 2️⃣ Setup Frontend Environment (Optional)
```bash
cd ..\Prototype-to-MVP-frontend
copy .env.example .env
```

File `.env` frontend hanya untuk config public (API URL), tidak ada secrets.

### 3️⃣ Deploy
```bash
# Dari folder frontend
docker-compose up -d --build
```

### 4️⃣ Set User (di browser console)
```javascript
localStorage.setItem('current_user', JSON.stringify({
  email: 'user@example.com',
  name: 'Test User'
}));
```

### 5️⃣ Akses
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

## Environment Variables Explained

### Frontend `.env` (Public - No Secrets)
```env
VITE_API_BASE_URL=http://localhost/api
```

### Backend `.env` (Private - Contains Secrets)
```env
OPENAI_API_KEY=sk-xxx
JWT_SECRET=xxx
MONGODB_URI=mongodb://...
```

**⚠️ Backend `.env` TIDAK pernah di-commit ke Git!**

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

✨ **Secrets (API key, JWT) harus ada di backend `.env`, bukan frontend!**
