# 🌿 CropGuard — AI Crop Disease Reporting & Advisory System

A full-stack AI-powered platform for detecting crop diseases, generating treatment advisories, and connecting farmers through community reporting.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, Tailwind CSS, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, JWT Auth, Multer |
| **Database** | MongoDB with Mongoose ODM |
| **AI** | OpenAI GPT-4 Vision (pluggable) |
| **Charts** | Chart.js via react-chartjs-2 |

---

## 📁 Project Structure

```
crop-disease-system/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── aiService.js       # AI integration (replace with your model)
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   ├── reportController.js # CRUD + AI trigger
│   │   ├── advisoryController.js # Advisory CRUD + feedback
│   │   └── dashboardController.js # Stats aggregation
│   ├── middleware/
│   │   ├── auth.js            # JWT protect/authorize
│   │   └── upload.js          # Multer config (5 images, 10MB each)
│   ├── models/
│   │   ├── User.js            # Farmer/agronomist/admin
│   │   ├── Report.js          # Disease reports with images & AI analysis
│   │   └── Advisory.js        # Treatment plans and recommendations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── advisory.js
│   │   └── dashboard.js
│   ├── uploads/               # Auto-created on first run
│   ├── server.js              # Express entry point
│   ├── .env.example           # Copy to .env
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx     # Sidebar navigation layout
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # Public landing page
    │   │   ├── LoginPage.jsx     # Auth
    │   │   ├── RegisterPage.jsx  # With farm details
    │   │   ├── Dashboard.jsx     # Stats + charts
    │   │   ├── NewReport.jsx     # Image upload + form
    │   │   ├── MyReports.jsx     # Filtered list view
    │   │   ├── ReportDetail.jsx  # AI results + auto-refresh
    │   │   ├── Advisories.jsx    # Advisory list
    │   │   ├── AdvisoryDetail.jsx # Full treatment plan + feedback
    │   │   ├── Community.jsx     # Public reports
    │   │   └── Profile.jsx       # User settings
    │   ├── utils/
    │   │   └── api.js         # Axios instance + all API calls
    │   ├── App.jsx            # Routes
    │   └── index.css          # Tailwind + base styles
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) OpenAI API key for real AI analysis

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env        # Fill in your values
npm install
mkdir uploads               # Create upload dir

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crop_disease_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

# For real AI analysis
AI_API_KEY=sk-your-openai-key
AI_API_URL=https://api.openai.com/v1
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev       # Starts on :5000

# Terminal 2 - Frontend
cd frontend
npm start         # Starts on :3000
```

### 4. Open Browser
Navigate to `http://localhost:3000`

---

## 🤖 AI Integration

The system uses a **pluggable AI service** (`backend/config/aiService.js`).

### Development (Mock)
By default, it uses mock analysis that simulates a 2-second AI delay and returns realistic demo data. No API key needed.

### Production (OpenAI GPT-4 Vision)
Uncomment the fetch block in `aiService.js`:

```javascript
const response = await fetch(process.env.AI_API_URL + '/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: buildDiseaseDetectionPrompt(cropType, symptoms) },
        ...images.map(img => ({ type: 'image_url', image_url: { url: publicImageUrl } }))
      ]
    }]
  })
});
```

### Custom Model
Replace the fetch call with any REST API — Gemini, Claude, custom fine-tuned model, or local Ollama endpoint.

---

## 📡 API Reference

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Reports
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/reports` | Get my reports (with filters) |
| POST | `/api/reports` | Submit new report + images |
| GET | `/api/reports/:id` | Get report + advisory |
| PUT | `/api/reports/:id` | Update report |
| DELETE | `/api/reports/:id` | Delete report |
| GET | `/api/reports/community` | Public reports |

### Advisories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/advisory` | My advisories |
| GET | `/api/advisory/:id` | Get advisory (marks as read) |
| POST | `/api/advisory/:id/feedback` | Submit rating/feedback |
| PUT | `/api/advisory/:id/resolve` | Mark resolved |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/stats` | Personal stats + charts data |

---

## 🗃️ Data Models

### Report Status Flow
```
pending → analyzing → analyzed → advisory_sent → resolved
                                               ↘ escalated
```

### User Roles
- **farmer** — Submit reports, view advisories
- **agronomist** — All farmer permissions + can review reports
- **admin** — Full system access

---

## 🔒 Security Features

- JWT tokens with configurable expiry
- Rate limiting: 100 req/15min global, 20 uploads/hour
- Helmet.js security headers
- CORS configured per environment
- File type validation (JPEG, PNG, WebP only)
- Max file size: 10MB per image, 5 images per report
- Passwords hashed with bcrypt (12 rounds)

---

## 📈 Scaling Considerations

1. **Image Storage** — Replace local `uploads/` with AWS S3 or Cloudinary
2. **AI Queue** — Use Bull.js + Redis for async analysis job queue
3. **Caching** — Add Redis for dashboard stats and community reports
4. **Monitoring** — Add Winston logging + Sentry error tracking
5. **Testing** — Add Jest + Supertest for API tests

---

## 🌱 Crop & Disease Coverage

**Supported Crops:** Wheat, Rice, Maize, Cotton, Soybean, Sugarcane, Tomato, Potato, Onion, Groundnut, Sunflower, Barley

**Disease Categories:** Fungal, Bacterial, Viral, Pest, Nutritional, Environmental

---

Built with ❤️ for farmers everywhere.
