# Prototype to MVP - Backend

Backend API untuk platform Prototype to MVP yang menggunakan AI untuk generate masalah bisnis dan mengevaluasi solusi user.

## Features

- **AI-Powered Problem Generation**: Generate masalah bisnis real-world menggunakan OpenAI via Comet API
- **Solution Evaluation**: Evaluasi solusi user dengan AI mentor
- **Adaptive Learning**: System yang menyesuaikan difficulty berdasarkan performa user
- **Gamification**: XP system, achievements, dan artifacts
- **Profile Calibration**: Kalibrasi profil user untuk personalisasi experience

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB dengan Mongoose ODM
- **AI Integration**: OpenAI SDK (via Comet API)
- **Authentication**: JWT (ready for implementation)

## Setup

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- Comet API Key (dari https://www.cometapi.com)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` dengan credentials Anda:
```env
OPENAI_API_KEY=sk-your-comet-api-key
MONGODB_URI=mongodb://localhost:27017/prototype-mvp
JWT_SECRET=your-secure-secret-here
```

4. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Profiles
- `POST /api/profiles/calibrate` - Kalibrasi profil user baru
- `GET /api/profiles/:user_id` - Get profil user
- `PUT /api/profiles/:user_id` - Update profil user
- `GET /api/profiles` - Get leaderboard

### Problems
- `POST /api/problems/generate` - Generate masalah baru dengan AI
- `GET /api/problems` - Get list masalah
- `GET /api/problems/:problem_id` - Get detail masalah

### Arena
- `POST /api/arena/start` - Mulai arena session
- `POST /api/arena/submit` - Submit solusi dan evaluasi
- `POST /api/arena/abandon` - Abandon session
- `GET /api/arena/user/:user_id` - Get user sessions

### Mentor
- `POST /api/mentor/question` - Generate Socratic question

### User Data
- `GET /api/user/achievements/:user_id` - Get achievements
- `GET /api/user/artifacts/:user_id` - Get artifacts

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `OPENAI_API_KEY` | Comet API key | Required |
| `OPENAI_BASE_URL` | Comet API base URL | `https://api.cometapi.com/v1` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/prototype-mvp` |
| `JWT_SECRET` | JWT signing secret | Required |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:5173` |

## Comet API Integration

Project ini menggunakan Comet API sebagai gateway ke OpenAI models. Comet API compatible dengan OpenAI SDK.

### Setup Comet API

1. Sign up di https://www.cometapi.com
2. Dapatkan API key dari dashboard
3. Set `OPENAI_API_KEY` di `.env` dengan Comet API key Anda
4. Base URL sudah di-set ke `https://api.cometapi.com/v1`

### Keuntungan Comet API

- Akses ke multiple AI models dalam satu API
- OpenAI-compatible interface
- Built-in monitoring dan analytics
- Cost optimization

## Docker Deployment

Build dan run dengan Docker:

```bash
docker build -t prototype-mvp-backend .
docker run -p 3001:3001 --env-file .env prototype-mvp-backend
```

Atau gunakan docker-compose (dari root project):

```bash
docker-compose up -d
```

## Project Structure

```
backend-structure/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── openai.js        # OpenAI/Comet API config
│   ├── models/
│   │   ├── UserProfile.js   # User profile schema
│   │   ├── Problem.js       # Problem schema
│   │   ├── ArenaSession.js  # Session schema
│   │   ├── Achievement.js   # Achievement schema
│   │   └── Artifact.js      # Artifact schema
│   ├── routes/
│   │   ├── profileRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── arenaRoutes.js
│   │   ├── mentorRoutes.js
│   │   └── userDataRoutes.js
│   ├── services/
│   │   ├── aiService.js     # AI integration logic
│   │   └── profileService.js # Profile calculation
│   └── server.js            # Main server file
├── .env.example
├── package.json
└── Dockerfile
```

## Development

```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Run tests
npm test
```

## License

Proprietary
