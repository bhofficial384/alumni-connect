# 🎓 AlumniConnect — Alumni Mentorship & Guidance Platform

> **Group 08** | Team Leader: Saurabh Kumar | CSE (IoT) | Reg No: 24155154046

A production-grade networking directory connecting engineering students with alumni for 1-on-1 career guidance, mock interviews, and professional mentorship.

---

## 🌟 Features

### 🔐 Authentication & Access Control
- Role-based sign-up (Student / Alumni Mentor)
- JWT-based session management with bcrypt password hashing
- Protected routes on both frontend and backend
- Role-specific dashboard routing

### 🎯 Student Dashboard
- **Mentor Directory** — Browse alumni with domain/company filters
- **Request Session** — Book 1-on-1 mentoring sessions via modal
- **My Sessions** — Track all session requests with live status badges (Pending / Approved / Rejected / Completed)
- **AI Outreach Drafter** — Generate professional cold outreach emails to mentors

### 👨‍💼 Alumni/Mentor Dashboard
- **Incoming Requests** — View and manage session requests (Approve / Reject)
- **Availability Scheduler** — Set weekly time slots for mentoring sessions
- **Session History** — Track mentoring engagement

### 🏠 5-Section Landing Page
1. **Hero** — Headline, CTAs, animated stat counters (500+ Alumni, 2000+ Sessions)
2. **How It Works** — 3-step flow: Search → Book → Get Mentored
3. **Featured Alumni** — Directory cards with company, domain, and bios
4. **Testimonials** — Success stories from placed students
5. **Contact Us** — Functional contact form + footer

### 🤖 AI Bonus Feature
- **Cold Outreach Drafter** — AI-powered email composer using Anthropic Claude API
- Graceful fallback template when API key isn't configured
- Server-side API call (key never exposed to frontend)

---

## 🏗️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS 3    |
| Backend     | Node.js + Express.js                |
| Database    | MongoDB (Atlas free tier)           |
| Auth        | JWT + bcrypt                        |
| AI          | Anthropic Claude API (server-side)  |
| Routing     | React Router v6                     |
| HTTP Client | Axios                               |
| Validation  | express-validator                   |

---

## 📁 Project Structure

```
alumni-connect/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance & API layer
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── RequestSessionModal.jsx
│   │   │   └── AIAssistant.jsx
│   │   ├── context/            # Auth context provider
│   │   ├── pages/              # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route handlers
│   │   ├── authController.js
│   │   ├── mentorController.js
│   │   ├── sessionController.js
│   │   ├── adminController.js
│   │   ├── contactController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verify + role check
│   │   └── validate.js         # Input validation rules
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mentors.js
│   │   ├── sessions.js
│   │   ├── admin.js
│   │   ├── contact.js
│   │   └── ai.js
│   ├── seed.js                 # Database seeder
│   ├── server.js               # Entry point
│   └── package.json
│
├── .env.example                # Environment template
├── .gitignore
├── package.json                # Root scripts
└── README.md                   # This file
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** free-tier cluster ([create one here](https://cloud.mongodb.com))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/alumni-connect.git
cd alumni-connect
```

### 2. Install dependencies
```bash
# Install root + client + server dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Configure environment variables
```bash
# Copy the template
cp .env.example server/.env

# Edit server/.env with your values:
# - MONGODB_URI: Your MongoDB Atlas connection string
# - JWT_SECRET: A strong random string (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - FRONTEND_URL: http://localhost:5173 (for local dev)
# - ANTHROPIC_API_KEY: (optional) Your Anthropic API key for AI features
```

### 4. Seed the database
```bash
cd server
npm run seed
cd ..
```

This creates demo accounts you can use to test:

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@alumniconnect.com      | Admin@123   |
| Mentor  | rajesh@alumniconnect.com     | Mentor@123  |
| Mentor  | priya@alumniconnect.com      | Mentor@123  |
| Mentor  | amit@alumniconnect.com       | Mentor@123  |
| Mentor  | sneha@alumniconnect.com      | Mentor@123  |
| Student | rahul@student.com            | Student@123 |
| Student | ananya@student.com           | Student@123 |

### 5. Start the development servers
```bash
# Option A: Run both with concurrently (from root)
npm run dev

# Option B: Run separately in two terminals
# Terminal 1 (backend):
cd server && npm run dev

# Terminal 2 (frontend):
cd client && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🌐 Deployment Guide

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select repo
3. Set framework preset to **Vite**
4. Set root directory to `client`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
8. Deploy

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_secret
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ANTHROPIC_API_KEY=sk-ant-... (optional)
   ```
7. Deploy

### Database → MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Add `0.0.0.0/0` to IP Access List (for Render)
5. Get the connection string and paste into `MONGODB_URI`
6. Run seed script once after deployment:
   ```bash
   MONGODB_URI="your_atlas_uri" node seed.js
   ```

### CORS Configuration
The backend is already configured to accept requests from `FRONTEND_URL`. Set this to your Vercel deployment URL in production.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| POST   | `/api/auth/register`| No   | Register new user     |
| POST   | `/api/auth/login`   | No   | Login & get JWT token |
| GET    | `/api/auth/me`      | Yes  | Get current user      |

### Mentors
| Method | Endpoint                   | Auth   | Description              |
|--------|----------------------------|--------|--------------------------|
| GET    | `/api/mentors`             | Yes    | List mentors (filterable)|
| GET    | `/api/mentors/:id`         | Yes    | Get single mentor        |
| PUT    | `/api/mentors/availability`| Mentor | Update availability      |

### Sessions
| Method | Endpoint                       | Auth    | Description              |
|--------|--------------------------------|---------|--------------------------|
| POST   | `/api/sessions`                | Student | Request a session        |
| GET    | `/api/sessions/my`             | Student | Get my sessions          |
| GET    | `/api/sessions/incoming`       | Mentor  | Get incoming requests    |
| PATCH  | `/api/sessions/:id/status`     | Mentor  | Approve/reject session   |

### Admin
| Method | Endpoint             | Auth  | Description           |
|--------|----------------------|-------|-----------------------|
| GET    | `/api/admin/students`| Admin | List all students     |
| GET    | `/api/admin/mentors` | Admin | List all mentors      |
| GET    | `/api/admin/stats`   | Admin | Dashboard statistics  |

### Other
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | `/api/contact`       | No   | Submit contact form      |
| POST   | `/api/ai-assistant`  | Yes  | Generate outreach email  |

---

## 🎨 Design System

| Token           | Value       | Usage                     |
|-----------------|-------------|---------------------------|
| Navy            | `#0F2B46`   | Headers, hero, navbar     |
| Gold            | `#C9A84C`   | CTAs, accents, highlights |
| Teal            | `#1B7A6E`   | Secondary accents         |
| Cream           | `#FBF8F1`   | Page backgrounds          |
| Charcoal        | `#1A202C`   | Primary text              |
| Heading Font    | DM Serif Display | Section headings     |
| Body Font       | Inter        | Body text, UI elements   |

---

## 👥 Team

| Name          | Role         | Reg No        |
|---------------|--------------|---------------|
| Saurabh Kumar | Team Leader  | 24155154046   |
| Member 2      | Developer    | —             |
| Member 3      | Developer    | —             |

**Branch**: CSE (IoT) | **Group**: 08

---

## 📄 License

MIT License — Built for College Hackathon 2026
