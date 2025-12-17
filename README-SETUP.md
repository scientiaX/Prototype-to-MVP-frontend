# Prototype to MVP - Setup Guide

## Prasyarat

- Docker Desktop installed
- Docker Compose installed
- Comet API Key dari https://www.cometapi.com

## Quick Start (Menggunakan Docker)

### 1. Pindahkan Backend ke Folder Terpisah

Folder `backend-structure` sudah di-copy ke `../Prototype-to-MVP-backend`. Hapus folder `backend-structure` dari frontend:

```bash
# Dari root frontend project
rmdir /S /Q backend-structure
```

### 2. Setup Environment Variables

```bash
# Copy template
copy .env.docker .env
```

Edit file `.env`:
```env
OPENAI_API_KEY=sk-your-comet-api-key-here
JWT_SECRET=your-secure-random-string-min-32-chars
```

**Cara generate JWT_SECRET:**
```bash
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Atau manual: random string 32+ characters
```

### 3. Build dan Run dengan Docker Compose

```bash
# Build dan start semua services (MongoDB, Backend, Frontend)
docker-compose up -d

# Check status
docker-compose ps
```

**Services yang akan berjalan:**
- MongoDB: `localhost:27017`
- Backend API: `localhost:3001`
- Frontend: `http://localhost`

### 4. Verify Deployment

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### 5. Set Mock User (Temporary Auth)

Buka browser ke `http://localhost`, tekan F12 untuk console, jalankan:

```javascript
localStorage.setItem('current_user', JSON.stringify({
  email: 'user@example.com',
  name: 'Test User'
}));
```

Refresh halaman.

### 6. Test Application

1. Buka http://localhost
2. Klik "Mulai Kalibrasi"
3. Pilih bahasa
4. Jawab pertanyaan kalibrasi
5. Masuk ke Arena
6. Generate problem dengan AI
7. Solve problem dan submit

### 7. Stop Services

```bash
# Stop semua container
docker-compose down

# Stop dan hapus volumes (reset database)
docker-compose down -v
```

## Docker Deployment (Production)

### 1. Pastikan Structure Benar
```
C:\Users\user\
├── Prototype-to-MVP-frontend/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env
└── Prototype-to-MVP-backend/
    ├── Dockerfile
    ├── .env
    └── src/
```

### 2. Setup Environment
```bash
# Di folder frontend
cp .env.docker .env

# Edit .env
OPENAI_API_KEY=your-comet-api-key
JWT_SECRET=your-secure-secret
```

### 3. Build dan Run
```bash
# Dari folder frontend
docker-compose up -d
```

### 4. Check Status
```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

### 5. Access
- Frontend: http://localhost
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

### 6. Stop Services
```bash
docker-compose down
```

## API Endpoints

### Profiles
- `POST /api/profiles/calibrate` - Kalibrasi profil
- `GET /api/profiles/:user_id` - Get profil
- `PUT /api/profiles/:user_id` - Update profil
- `GET /api/profiles` - Leaderboard

### Problems
- `POST /api/problems/generate` - Generate problem
- `GET /api/problems` - List problems

### Arena
- `POST /api/arena/start` - Start session
- `POST /api/arena/submit` - Submit solution
- `POST /api/arena/abandon` - Abandon session

### Mentor
- `POST /api/mentor/question` - Generate Socratic question

### User Data
- `GET /api/user/achievements/:user_id` - Get achievements
- `GET /api/user/artifacts/:user_id` - Get artifacts

## Troubleshooting

### Backend tidak connect ke MongoDB
```bash
# Check MongoDB running
docker ps | findstr mongo

# Restart MongoDB
docker restart prototype-mvp-mongo
```

### Frontend tidak bisa call backend API
1. Check backend running di port 3001
2. Check `.env` file di frontend
3. Check CORS settings di backend

### AI generation error
1. Verify OPENAI_API_KEY di backend `.env`
2. Check Comet API quota
3. Review backend logs: `docker-compose logs backend`

---

## Development Mode (Tanpa Docker)

Jika ingin development tanpa Docker (optional):

### Backend
```bash
cd ../Prototype-to-MVP-backend
npm install
cp .env.example .env
# Edit .env dengan Comet API key
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

### MongoDB
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

---

## Next Steps

1. **Dapatkan Comet API Key** dari https://www.cometapi.com
2. **Implement Authentication**: Backend sudah ada struktur JWT, tinggal implement login/register
3. **Update Frontend Auth**: Replace mock user dengan real auth
4. **Add Rate Limiting**: Protect AI endpoints
5. **Add Caching**: Cache problems dan profiles
6. **Add Tests**: Unit tests untuk critical paths

## File Changes Summary

### Modified Files
- `Pages/Arena.jsx` - Menggunakan apiClient
- `Pages/Calibration.jsx` - Menggunakan apiClient
- `Pages/Home.jsx` - Menggunakan apiClient
- `Pages/Leaderboard.jsx` - Menggunakan apiClient
- `Pages/Profile.jsx` - Menggunakan apiClient
- `Components/arena/ArenaBattle.jsx` - Menggunakan apiClient
- `Layout.js` - Menggunakan apiClient
- `docker-compose.yml` - Update backend path

### New Files
- `src/api/apiClient.js` - REST API client
- `.env.example` - Frontend environment template
- `.env.production` - Production environment
- `README-SETUP.md` - Panduan ini

### Backend Files (di ../Prototype-to-MVP-backend)
- Semua file backend sudah dipindahkan
- Structure lengkap dengan models, routes, services
- Comet API integration sudah siap

## Kontak & Support

Untuk issue atau pertanyaan, check:
1. Backend logs: `docker-compose logs backend`
2. Frontend console di browser
3. MongoDB connection: Test dengan MongoDB Compass
