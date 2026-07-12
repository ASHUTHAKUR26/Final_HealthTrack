# 🏥 Health Track System

**B.Tech CSE 7th Semester Project — Techno Bengal Institute of Technology**

> A comprehensive, gender-neutral wellness platform for young adults integrating sleep, diet, skincare, fitness, and mental health tracking.

---

## 👥 Team

| Name | MAKAUT Roll No. |
|------|----------------|
| Anurag Sharma | 12100122059 |
| Vikash Mahato | 12100122099 |
| Ashu Kr Thakur | 12100122057 |
| Ayush Kumar Sharma | 12100122038 |
| Saurav Kumar Shaw | 12100122098 |

**Mentor:** Prof. Dr. Munshi Mostafijur Rahaman, Dept. of CSE & IT

---

## 📌 Project Overview

Health Track System is a full-stack wellness platform built with React.js, Node.js, Express.js, and MongoDB. It provides:

- 🛌 Sleep tracking & consistency scoring
- 🥗 Nutrition & hydration logging
- 🏃 Physical activity monitoring
- 🧴 Skincare/dermatological tracking
- 🤒 Symptom checker (Rule-Based)
- 📊 Visual analytics dashboard
- 🔐 Secure JWT/OAuth authentication

---

## 🏗️ Tech Stack

### Frontend
- React.js (Component-based UI)
- Tailwind CSS (Responsive styling)
- Chart.js (Analytics & graphs)
- Framer Motion (Animations)
- Axios (API communication)

### Backend
- Node.js + Express.js
- JWT (Authentication)
- Bcrypt.js (Password hashing)

### Database
- MongoDB + Mongoose ODM

### Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- DB: MongoDB Atlas

---

## 📁 Project Structure

```
Health/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   └── utils/          # Helper functions & algorithms
│   ├── index.html
│   └── package.json
├── backend/
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express API routes
│   ├── middleware/         # Auth & validation middleware
│   ├── server.js
│   └── package.json
├── docs/
│   └── api-reference.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/healthtrack
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### Running the App

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

App runs at: `http://localhost:5173` (frontend) and `http://localhost:5000` (backend API)

---

## 🔑 Core Algorithms

### 1. Habit Consistency Score
```
Consistency Score = Σ(Weight × Adherence) ÷ Σ(Weights)
```

### 2. Rule-Based Symptom Mapping
User-reported symptoms are matched against a predefined ruleset linking symptom clusters to wellness guidance.

### 3. Time-Series Trend Analysis
Tracks sleep, nutrition, mood, and stress over time to detect patterns and deviations.

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/health/dashboard` | Get dashboard stats |
| POST | `/api/health/sleep` | Log sleep entry |
| POST | `/api/health/nutrition` | Log meal entry |
| POST | `/api/health/symptoms` | Log symptoms |
| GET | `/api/health/insights` | Get analytics & trends |

---

## 🔐 Security

- JWT-based stateless authentication
- Bcrypt.js password hashing (salt rounds: 12)
- MongoDB field-level encryption for sensitive data
- HTTPS enforced in production
- Input validation & sanitization on all endpoints

---

## 📚 References

1. Smith & Kumar (2020) — Mobile Health Applications: Trends and Prospects
2. WHO (2021) — Global Digital Health Strategy
3. Patel et al. (2019) — Adoption of Wellness Apps Among University Students
4. Johnson & Lee (2022) — Impact of Lifestyle Tracking
5. Statista (2023) — Global mHealth Usage Statistics

---

## 📄 License

This project is developed for academic purposes under MAKAUT, B.Tech CSE curriculum.
