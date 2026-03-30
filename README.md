<<<<<<< HEAD
# 🧥 StyleVault — Smart Online Wardrobe System

A full-stack MERN application for managing your wardrobe intelligently.

---

## 🚀 Tech Stack

| Layer     | Technology                         |
|-----------|-------------------------------------|
| Frontend  | React 18, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Node.js, Express.js, MVC Pattern   |
| Database  | MongoDB + Mongoose ODM             |
| Auth      | JWT + bcryptjs                     |
| Images    | Cloudinary / Local Multer Storage  |
| Deploy    | Docker + docker-compose            |

---

## 📁 Project Structure

```
wardrobe/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   ├── cloudinary.js   # Image upload config
│   │   └── seed.js         # Sample data seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clothingController.js
│   │   ├── outfitController.js
│   │   ├── plannerController.js
│   │   └── recommendationController.js
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── ClothingItem.js
│   │   ├── Outfit.js
│   │   └── OutfitPlan.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clothing.js
│   │   ├── outfit.js
│   │   ├── favorites.js
│   │   ├── recommendations.js
│   │   ├── planner.js
│   │   ├── travel.js
│   │   └── user.js
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Layout.jsx
│   │   │   ├── ui/index.jsx        # Shared UI components
│   │   │   └── wardrobe/
│   │   │       ├── ClothingCard.jsx
│   │   │       └── AddClothingModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WardrobePage.jsx
│   │   │   ├── OutfitBuilder.jsx
│   │   │   ├── PlannerPage.jsx
│   │   │   ├── FavoritesPage.jsx
│   │   │   ├── TravelPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── utils/api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── docker-compose.yml
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- VS Code

---

### Step 1 — Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev
```

The API starts at `http://localhost:5000`

### Step 2 — Seed Sample Data (Optional)

```bash
cd backend
node config/seed.js
```
This creates a demo user:
- **Email:** `demo@wardrobe.com`
- **Password:** `demo1234`

### Step 3 — Setup Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`

---

## 🐳 Docker Deployment

```bash
# Build and run everything
docker-compose up --build

# Run in background
docker-compose up -d

# Stop
docker-compose down
```

Access: `http://localhost:3000`

---

## 📮 API Reference (Postman Guide)

### Auth
| Method | Endpoint                  | Auth | Body |
|--------|---------------------------|------|------|
| POST   | /api/auth/register        | No   | `{name, email, password}` |
| POST   | /api/auth/login           | No   | `{email, password}` |
| GET    | /api/auth/me              | Yes  | — |
| PUT    | /api/auth/updateprofile   | Yes  | `{name, preferences}` |
| PUT    | /api/auth/changepassword  | Yes  | `{currentPassword, newPassword}` |

### Clothing
| Method | Endpoint                     | Auth | Description |
|--------|------------------------------|------|-------------|
| GET    | /api/clothing                | Yes  | Get all items (supports `?search=&category=&occasion=&season=&sort=&page=&limit=`) |
| POST   | /api/clothing                | Yes  | Create item (multipart/form-data with `image`) |
| GET    | /api/clothing/:id            | Yes  | Get single item |
| PUT    | /api/clothing/:id            | Yes  | Update item |
| DELETE | /api/clothing/:id            | Yes  | Delete item |
| POST   | /api/clothing/:id/wear       | Yes  | Log wear |
| PATCH  | /api/clothing/:id/favorite   | Yes  | Toggle favourite |
| GET    | /api/clothing/stats          | Yes  | Wardrobe analytics |

### Outfits
| Method | Endpoint                   | Auth | Description |
|--------|----------------------------|------|-------------|
| GET    | /api/outfits               | Yes  | Get all outfits |
| POST   | /api/outfits               | Yes  | Create outfit `{name, items:[{item, position}], occasion, season}` |
| PUT    | /api/outfits/:id           | Yes  | Update outfit |
| DELETE | /api/outfits/:id           | Yes  | Delete outfit |
| POST   | /api/outfits/:id/wear      | Yes  | Log wear |
| PATCH  | /api/outfits/:id/favorite  | Yes  | Toggle favourite |

### Recommendations
| Method | Endpoint                        | Auth | Description |
|--------|---------------------------------|------|-------------|
| GET    | /api/recommendations            | Yes  | Smart outfit combos (`?occasion=&season=&limit=`) |
| GET    | /api/recommendations/unused     | Yes  | Suggest unworn items |
| POST   | /api/recommendations/travel     | Yes  | Travel packing `{destination, days, occasions}` |

### Planner
| Method | Endpoint              | Auth | Description |
|--------|-----------------------|------|-------------|
| GET    | /api/planner          | Yes  | Get plans `?startDate=&endDate=` |
| POST   | /api/planner          | Yes  | Create/update plan `{date, outfit, notes}` |
| PUT    | /api/planner/:id      | Yes  | Update plan |
| DELETE | /api/planner/:id      | Yes  | Delete plan |
| PATCH  | /api/planner/:id/worn | Yes  | Mark as worn |

**Auth header format:** `Authorization: Bearer <token>`

---

## ✨ Features Summary

- ✅ JWT Authentication + bcrypt password hashing
- ✅ Protected routes (frontend + backend)
- ✅ Digital closet with image upload (Cloudinary / local)
- ✅ Smart outfit recommendations (content-based filtering)
- ✅ Outfit Builder with position-based canvas
- ✅ Calendar-based weekly outfit planner
- ✅ Travel packing assistant
- ✅ Favorites system
- ✅ Wear tracking & usage analytics
- ✅ Recharts visualisations (pie, bar charts)
- ✅ Dark mode support
- ✅ Fully responsive (mobile + desktop)
- ✅ Lazy loading for performance
- ✅ Rate limiting + Helmet security headers
- ✅ MVC architecture
- ✅ Docker + docker-compose ready
- ✅ MongoDB seed data

---

## 🔧 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_wardrobe
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=StyleVault
```
=======
# SMART-WARDROBE
>>>>>>> 64b2d4e667d494ed2d3f947ca38f07dd690f344d
