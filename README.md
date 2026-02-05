# 🌱 Carbon Footprint Calculator & Tracker

Track your daily activities and see your actual carbon footprint in real numbers. Get personalized AI recommendations to reduce your environmental impact.

## Features

**Core:**

- User authentication (register/login)
- Log daily activities by category (transport, food, energy, waste)
- Calculate emissions using real CO2 formulas
- Dashboard with charts and stats
- AI-powered personalized recommendations
- Chat assistant for carbon questions

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Auth:** JWT tokens + Firebase Auth
- **AI:** Google Gemini 2.5 Flash API
- **Charts:** Recharts

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
```

Add Firebase credentials:

- Get `serviceAccountKey.json` from Firebase Console
- Save to `backend/src/config/`

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Emission Formulas

| Activity     | Factor | Unit       |
| ------------ | ------ | ---------- |
| Car (Petrol) | 0.12   | kg CO2/km  |
| Car (Diesel) | 0.15   | kg CO2/km  |
| Bus          | 0.05   | kg CO2/km  |
| Train        | 0.04   | kg CO2/km  |
| Electricity  | 0.5    | kg CO2/kWh |
| Beef meal    | 6.0    | kg CO2     |
| Vegetarian   | 1.5    | kg CO2     |
| Vegan        | 0.9    | kg CO2     |

## API Endpoints

**Auth:**

- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user info

**Activities:**

- GET/POST `/api/activities` - List/create activities
- GET `/api/activities/summary` - Emission totals
- GET `/api/activities/trends` - Daily trends

**AI:**

- GET `/api/ai/recommendations` - Personalized tips
- POST `/api/ai/chat` - Chat with assistant

## Project Structure

```
├── frontend/src/
│   ├── components/
│   │   ├── Auth/        # Login, Register
│   │   ├── Dashboard/   # Stats, Charts
│   │   ├── Activities/  # Activity forms
│   │   ├── AI/          # Recommendations, Chat
│   │   └── Layout/      # Navbar
│   ├── contexts/        # Auth context
│   └── services/        # API calls
│
├── backend/src/
│   ├── routes/          # API routes
│   ├── services/        # AI, Calculator
│   ├── middleware/      # Auth middleware
│   └── config/          # Firebase config
```

## AI Integration

Uses Google Gemini to:

- Analyze user's emission patterns
- Generate personalized reduction tips
- Answer questions about carbon footprint

Falls back to rule-based suggestions if API unavailable.

---

Built for tracking and reducing personal carbon emissions.
