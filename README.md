# Vaqt — Onlayn Yozilish Tizimi

**Vaqt** (meaning "Time" in Uzbek) is an appointment booking MVP for small businesses in Uzbekistan — barbers, salons, nail studios, clinics, and more.

## Quick Start

### 1. Backend (Port 3001)
```bash
cd server
npm install
node index.js
```

### 2. Frontend (Port 5173)
```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173

---

## Demo Account

| Field    | Value                    |
|----------|--------------------------|
| Email    | shakhzod@demo.com        |
| Password | demo123                  |
| Slug     | shakhzod-sartaroshxona   |

Public booking page: http://localhost:5173/book/shakhzod-sartaroshxona

---

## Features

### Business Dashboard
- Register & login with email + password (JWT auth)
- Business profile: name, category, city, address, phone, working hours per day
- Service management: add/edit/delete services with duration & UZS price
- All bookings with filters by status/date
- Dashboard with today's bookings, weekly calendar, and monthly stats

### Public Booking Page (`/book/:slug`)
- No login required for customers
- 4-step flow: service → date → time → confirm
- Timeslots generated from working hours, blocked when booked
- UZS price display, Uzbek phone format
- Uzbek/Russian language toggle

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS      |
| Backend  | Node.js + Express                   |
| Database | SQLite via better-sqlite3           |
| Auth     | JWT (stored in localStorage)        |
| Icons    | Lucide React                        |

---

## API Endpoints

```
POST   /api/auth/register              Register new business
POST   /api/auth/login                 Login

GET    /api/businesses/me              Own profile (auth)
PUT    /api/businesses/me              Update profile (auth)
GET    /api/businesses/:slug           Public business info + services

GET    /api/services                   List services (auth)
POST   /api/services                   Create service (auth)
PUT    /api/services/:id               Update service (auth)
DELETE /api/services/:id               Delete service (auth)

GET    /api/bookings                   All bookings (auth, filterable)
POST   /api/bookings                   Create booking (public)
PUT    /api/bookings/:id/status        Update status (auth)
GET    /api/bookings/available-slots   Available timeslots (public)
GET    /api/bookings/stats             Monthly stats (auth)
```

---

## Project Structure

```
/server
  index.js          Express app entry
  db.js             SQLite schema + seed data
  /middleware
    auth.js         JWT verification
  /routes
    auth.js         Register / login
    businesses.js   Profile management + public lookup
    services.js     Service CRUD
    bookings.js     Booking flow + slot logic

/client
  /src
    App.jsx         Routes
    main.jsx        Entry point
    index.css       Tailwind + component classes
    i18n.js         Uzbek/Russian translations
    api.js          Fetch wrapper + formatters
    /context
      AuthContext.jsx
      LangContext.jsx
    /pages
      Login.jsx
      Register.jsx
      Dashboard.jsx
      Profile.jsx
      Services.jsx
      Bookings.jsx
      BookingPage.jsx      Public booking flow
      BookingConfirm.jsx
    /components
      DashboardLayout.jsx
```

---

## Database

SQLite file created automatically at `server/vaqt.db` on first run.

**Tables:** `businesses`, `services`, `bookings`

No migrations needed for MVP — schema is in `server/db.js`.
