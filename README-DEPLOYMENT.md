# Prototype to MVP Platform

Platform pembelajaran interaktif yang menggunakan AI untuk generate masalah bisnis real-world dan mengevaluasi solusi user dengan adaptive learning system.

## Project Structure

Project ini terdiri dari 2 bagian utama:

### Frontend (React + Vite)
- **Location**: Root directory
- **Tech**: React, Vite, Tailwind CSS, Framer Motion
- **Port**: 5173 (dev), 80 (production)

### Backend (Node.js + Express)
- **Location**: `backend-structure/`
- **Tech**: Express, MongoDB, OpenAI via Comet API
- **Port**: 3001

## Quick Start dengan Docker

### 1. Prasyarat
- Docker Desktop installed
- Comet API Key dari https://www.cometapi.com

### 2. Setup Environment
```bash
# Copy template
copy .env.docker .env

# Edit .env dan isi:
# OPENAI_API_KEY=your-comet-api-key
# JWT_SECRET=random-string-min-32-chars
```

### 3. Deploy
```bash
# Build dan start semua services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access
- Frontend: http://localhost
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

### 5. Set Mock User
Buka browser console (F12):
```javascript
localStorage.setItem('current_user', JSON.stringify({
  email: 'user@example.com',
  name: 'Test User'
}));
```

### 6. Stop
```bash
docker-compose down
```

**Semua dependency otomatis di-install di dalam Docker container. Tidak perlu `npm install` manual!**

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=sk-your-comet-api-key-here
JWT_SECRET=your-secure-jwt-secret-min-32-chars
MONGODB_URI=mongodb://mongodb:27017/prototype-mvp
```

Dapatkan Comet API key dari: https://www.cometapi.com

## Features

### 1. Profile Calibration
- Multi-language support (EN/ID)
- Psychometric assessment
- Archetype determination (Risk Taker, Analyst, Builder, Strategist)

### 2. Problem Arena
- AI-generated real-world problems
- Custom problem generation
- Adaptive difficulty system
- Time-based challenges

### 3. AI Mentor
- Socratic questioning
- Context-aware guidance
- Over-analysis detection
- Adaptive interventions

### 4. Gamification
- XP system per archetype
- Difficulty-based progression
- Achievement badges
- Solution artifacts

### 5. Profile & Leaderboard
- Personal progress tracking
- Archetype radar chart
- Achievement showcase
- Global leaderboard

## API Integration

Backend menggunakan **Comet API** sebagai gateway ke OpenAI models:

- **Base URL**: https://api.cometapi.com/v1
- **Compatible**: OpenAI SDK
- **Models**: GPT-4, GPT-4o, dan lainnya

Setup di `backend-structure/src/config/openai.js`

## Database Schema

### Collections
1. **userprofiles** - User calibration data dan progress
2. **problems** - AI-generated problems
3. **arenasessions** - Problem-solving sessions
4. **achievements** - User achievements
5. **artifacts** - Solution records

Detail schema ada di `backend-structure/src/models/`

## Docker Services

```yaml
services:
  - mongodb (port 27017)
  - backend (port 3001)
  - frontend (port 80)
```

Semua services menggunakan health checks dan auto-restart.

## Development Notes

### Frontend
- Base44 client references perlu di-replace dengan REST API calls ke backend
- Update API base URL di environment config
- Implement proper authentication flow

### Backend
- JWT authentication ready tapi belum implemented
- Rate limiting bisa ditambahkan
- Consider caching untuk frequently accessed data

## Troubleshooting

### Docker Issues

**Container tidak start:**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

**MongoDB connection failed:**
- Check MongoDB health: `docker-compose ps`
- Verify connection string di .env

**Backend API errors:**
- Check Comet API key valid
- Verify MongoDB running
- Check logs: `docker-compose logs backend`

### Development Issues

**Frontend can't connect to backend:**
- Verify backend running di port 3001
- Check CORS configuration
- Update API base URL di frontend config

**AI generation fails:**
- Verify OPENAI_API_KEY di .env
- Check Comet API quota
- Review error logs

## Next Steps

1. **Authentication**: Implement JWT-based auth
2. **Frontend API Migration**: Replace base44 calls dengan REST API
3. **Rate Limiting**: Add rate limiting middleware
4. **Caching**: Implement Redis untuk performance
5. **Monitoring**: Add application monitoring
6. **Testing**: Add unit dan integration tests

## License

Proprietary
