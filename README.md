# 🌱 Carbon Footprint Calculator & Tracker

A web application that helps individuals and small businesses track and reduce their carbon footprint through AI-powered personalized recommendations.

![Carbon Footprint Tracker](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)

## 🎯 Features

### Core Features

- **User Authentication** - Secure registration and login with JWT
- **Activity Logging** - Track daily activities (transport, energy, food, waste)
- **Carbon Calculator** - Calculate CO2 emissions using scientific formulas
- **Visual Dashboard** - Charts showing trends and category breakdowns
- **AI Recommendations** - Personalized tips powered by OpenAI

### Technical Highlights

- Real-time emission calculations
- Interactive charts with Recharts
- Responsive design for mobile & desktop
- Dark theme with modern UI

## 🛠️ Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 18, Vite, React Router      |
| Styling  | Vanilla CSS, Modern Design System |
| Charts   | Recharts                          |
| Icons    | Lucide React                      |
| Backend  | Node.js, Express.js               |
| Database | Firebase Firestore                |
| Auth     | JWT, bcrypt                       |
| AI       | OpenAI API                        |

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- OpenAI API key (optional, for AI features)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/carbon-footprint-tracker.git
   cd carbon-footprint-tracker
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend Environment**

   Create `.env` file in backend folder:

   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your_super_secret_jwt_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Generate a service account key (Project Settings > Service Accounts > Generate New Private Key)
   - Save as `backend/src/config/serviceAccountKey.json`

5. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

6. **Run the Application**

   Terminal 1 (Backend):

   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```bash
   cd frontend
   npm run dev
   ```

7. **Open in Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🌍 Carbon Emission Formulas

| Activity        | Formula          | Unit        |
| --------------- | ---------------- | ----------- |
| Car (Petrol)    | Distance × 0.12  | kg CO₂/km   |
| Car (Diesel)    | Distance × 0.15  | kg CO₂/km   |
| Flight (Short)  | Distance × 0.255 | kg CO₂/km   |
| Flight (Long)   | Distance × 0.195 | kg CO₂/km   |
| Electricity     | kWh × 0.5        | kg CO₂/kWh  |
| Beef Meal       | 6.0              | kg CO₂/meal |
| Vegetarian Meal | 1.5              | kg CO₂/meal |

## 📊 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| GET    | `/api/auth/profile`  | Get user profile  |

### Activities

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| GET    | `/api/activities`         | Get user activities  |
| POST   | `/api/activities`         | Create activity      |
| PUT    | `/api/activities/:id`     | Update activity      |
| DELETE | `/api/activities/:id`     | Delete activity      |
| GET    | `/api/activities/summary` | Get emission summary |
| GET    | `/api/activities/trends`  | Get daily trends     |
| GET    | `/api/activities/types`   | Get activity types   |

### AI

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/api/ai/recommendations` | Get AI recommendations |
| POST   | `/api/ai/chat`            | Chat with AI assistant |

## 🎨 Screenshots

### Dashboard

- Overview with emission stats
- Interactive trend charts
- Category breakdown pie chart

### Activity Logging

- Easy category selection
- Real-time emission preview
- Date and notes tracking

### AI Recommendations

- Personalized tips
- Interactive chatbot
- Actionable suggestions

## 📱 Responsive Design

The application is fully responsive and works on:

- 📱 Mobile devices (375px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🤖 AI Integration

The application uses OpenAI's GPT for:

- Personalized recommendations based on user's emission patterns
- Interactive chatbot for carbon footprint questions
- Contextual advice using actual user data

**Note:** AI features require an OpenAI API key. Without it, the app provides rule-based suggestions.

## 📁 Project Structure

```
carbon-footprint-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Activities/
│   │   │   ├── AI/
│   │   │   └── Layout/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.js
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy the dist folder
```

### Backend (Railway/Render)

- Deploy backend folder
- Set environment variables
- Configure Firebase credentials

## 📝 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [OpenAI](https://openai.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

---

**Built with 💚 for a greener planet**
