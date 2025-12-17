# Prototype to MVP Frontend

Platform pembelajaran interaktif yang menggunakan AI untuk generate masalah bisnis real-world dan mengevaluasi solusi user dengan adaptive learning system.

![CI](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/CI%20-%20Build%20and%20Test/badge.svg)
![Docker](https://github.com/scientiaX/Prototype-to-MVP-frontend/workflows/Docker%20Compose%20Test/badge.svg)

## 🚀 Quick Start

Lihat [QUICKSTART.md](QUICKSTART.md) untuk deployment dengan Docker.

```bash
# 1. Setup environment
copy .env.docker .env

# 2. Deploy semua services
docker-compose up -d --build

# 3. Akses aplikasi
# http://localhost
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Panduan tercepat untuk mulai
- **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** - Panduan lengkap Docker deployment
- **[README-SETUP.md](README-SETUP.md)** - Setup guide lengkap
- **[README-DEPLOYMENT.md](README-DEPLOYMENT.md)** - Production deployment guide
- **[.github/WORKFLOWS.md](.github/WORKFLOWS.md)** - GitHub Actions workflows documentation

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)
       ↓
   Nginx Reverse Proxy
       ↓
Backend (Node.js + Express)
       ↓
   MongoDB Database
```

## ✨ Features

- **Profile Calibration** - Psychometric assessment dengan multi-language support
- **Problem Arena** - AI-generated real-world business problems
- **AI Mentor** - Socratic questioning dengan adaptive interventions
- **Gamification** - XP system, achievements, dan solution artifacts
- **Leaderboard** - Growth-based dan reliability-based rankings

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- OpenAI SDK (via Comet API)

### Infrastructure
- Docker & Docker Compose
- Nginx
- GitHub Actions (CI/CD)

## 🔧 Development

Untuk development tanpa Docker, lihat [README-SETUP.md](README-SETUP.md#development-mode-tanpa-docker).

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Workflows otomatis akan run CI tests untuk setiap PR.

## 📝 License

Proprietary

## 🔗 Related Repositories

- [Backend Repository](https://github.com/scientiaX/Prototype-to-MVP-backend)

## 📧 Support

Untuk issues atau pertanyaan, buka GitHub Issue atau review documentation di folder `.github/`.
