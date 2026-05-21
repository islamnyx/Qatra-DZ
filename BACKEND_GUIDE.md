# Qatra Backend — Beginner Guide

This document explains **what the backend is**, **how it works**, and **how to run it** — written for someone with no backend experience.

---

## 1. What is a “backend”?

Your app has two parts:

| Part | What it does | Where it lives |
|------|----------------|----------------|
| **Frontend** | Buttons, screens, animations (what users see) | `src/` — runs in the browser |
| **Backend** | Saves data, answers questions, applies rules | `server/` — runs on your PC as a small program |

Before: all data was **fake** inside `mockData.js` (like a spreadsheet pasted into the app).

Now: the frontend **asks the backend** over the network, and the backend reads/writes a **real database file**.

```
  Phone / Browser (React)
         │
         │  HTTP requests  e.g. GET /api/donors/DZ-001
         ▼
  Backend (Node.js + Express)  port 3001
         │
         ▼
  SQLite file  server/data/qatra.db
```

---

## 2. Technologies we chose (simple stack)

| Tool | Role | Why |
|------|------|-----|
| **Node.js** | Runs JavaScript on the server (not in the browser) | Same language as your React app |
| **Express** | Web framework — defines URLs like `/api/sos/urgent` | Very common, small, easy to read |
| **SQLite** | Database stored in one file `qatra.db` | No separate database server to install |
| **better-sqlite3** | Node library to talk to SQLite | Fast and synchronous (simple code) |
| **CORS** | Allows the browser to call the API from another port | Needed because Vite is `:5173` and API is `:3001` |

---

## 3. Folder structure (`server/`)

```
server/
  index.js              ← START HERE: starts the server, wires routes
  package.json          ← backend dependencies and scripts
  data/
    qatra.db            ← created automatically (your database file)
  db/
    database.js         ← opens DB, creates tables
    seed.js             ← fills tables with demo data (first run only)
  routes/               ← one file per feature area
    health.js           ← “is the server alive?”
    donors.js           ← profile, passport, family
    sos.js              ← urgent SOS + respond
    wilayas.js          ← map data
    feed.js             ← news + campaign counter
    chat.js             ← DamBot replies
    leaderboard.js      ← rankings
  utils/
    eligibility.js      ← 56-day rule (computed from last donation)
    matchScore.js       ← SOS match %
    damBot.js           ← chat logic (same rules as before, on server)
    donorMapper.js      ← converts DB rows → JSON for frontend
  middleware/
    errorHandler.js     ← sends nice JSON errors
```

**Mental model:** `routes/` = “when someone visits this URL, do this”. `db/` = “where data lives”.

---

## 4. Database tables (what we store)

| Table | Stores |
|-------|--------|
| `donors` | Main user (name, blood type, wilaya, points, …) |
| `badges` | Donor badges |
| `donation_history` | Past donations |
| `family_members` | Family blood vault |
| `sos_requests` | Urgent blood requests |
| `sos_responses` | Who responded to which SOS (saved for real demos) |
| `wilayas` | Map status per wilaya |
| `news_feed` | Feed articles + campaign interest count |
| `campaign_registrations` | Who clicked “I’m interested” |
| `leaderboard` | Rank order |

Demo user id: **`DZ-001`** (أمين بوعلام).

---

## 5. API endpoints (cheat sheet)

Base URL: `http://localhost:3001/api`

| Method | URL | What it does |
|--------|-----|----------------|
| GET | `/health` | Server OK? |
| GET | `/donors/DZ-001` | Full profile + history + badges |
| GET | `/donors/DZ-001/passport` | QR JSON payload |
| GET | `/donors/DZ-001/family` | Family vault list |
| PATCH | `/donors/DZ-001/family/circle` | Toggle alert circle `{ "active": true }` |
| POST | `/donors/DZ-001/family/demo-alert` | Simulate family alert |
| GET | `/sos/urgent?donorId=DZ-001` | Most urgent SOS + match % + already responded? |
| POST | `/sos/SOS-001/respond` | Body: `{ "donorId": "DZ-001", "eta": "30 min" }` |
| GET | `/wilayas` | All wilayas for map |
| GET | `/feed?donorId=DZ-001` | News feed |
| POST | `/feed/campaign/1/interest` | Register for campaign |
| POST | `/chat` | Body: `{ "message": "هل أنا مؤهل؟", "lang": "ar" }` |
| GET | `/leaderboard` | Top donors |

### Try in the browser

With the server running, open:

- http://localhost:3001/api/health
- http://localhost:3001/api/donors/DZ-001

You should see JSON (raw data).

---

## 6. How the frontend talks to the backend

1. **`src/api/client.js`** — small wrapper around `fetch()` for every endpoint.
2. **`vite.config.js`** — proxy: browser calls `/api/...` on port 5173, Vite forwards to 3001.
3. **`src/context/DonorContext.jsx`** — loads donor on app start; shows **API** vs **offline** in navbar.
4. Each page calls `api.getWilayas()`, `api.getFeed()`, etc. If the server is down, it **falls back** to `mockData.js` so the UI still works.

---

## 7. Important business logic (on the server now)

### Eligibility (56 days)

`utils/eligibility.js` reads `last_donation` and computes:

- `isEligible` — can donate today?
- `daysUntilEligible` — days left

So changing `last_donation` in the DB changes the UI everywhere.

### Match score

`utils/matchScore.js` — same formula as before, but uses donor from DB.

### SOS respond

`POST /api/sos/:id/respond` inserts into `sos_responses`. Same user cannot respond twice (unique constraint).

### Campaign counter

Stored in `news_feed.campaign_interest` and incremented in the database (shared for all users of this demo server).

---

## 8. How to run everything

### Terminal 1 — Backend

```powershell
cd C:\Users\islam\simple-app\server
npm install
npm run dev
```

You should see: `Qatra API running at http://localhost:3001`

### Terminal 2 — Frontend

```powershell
cd C:\Users\islam\simple-app
npm run dev
```

Open http://localhost:5173 — navbar subtitle should show **· API** (green) when connected.

### One-liner (two terminals still safest on Windows)

```powershell
cd C:\Users\islam\simple-app\server; npm install; npm run dev
```

Then in another terminal: `npm run dev` from project root.

---

## 9. Reset the database

Delete the file and restart the server:

```powershell
Remove-Item C:\Users\islam\simple-app\server\data\qatra.db -ErrorAction SilentlyContinue
cd C:\Users\islam\simple-app\server
npm run dev
```

Tables are recreated and **seed data** is inserted again.

---

## 10. What is NOT done yet (normal for hackathon MVP)

- Login / passwords (everyone uses demo user `DZ-001`)
- Real push notifications
- Hospital admin panel
- Real AI for DamBot (still rule-based keywords)
- Hosting on the internet (only runs on your PC for now)

---

## 11. Glossary

| Term | Meaning |
|------|---------|
| **API** | List of URLs the frontend can call |
| **Endpoint** | One URL + method, e.g. `GET /api/health` |
| **JSON** | Text format for data `{ "name": "أمين" }` |
| **Route** | Code that handles one endpoint |
| **Middleware** | Code that runs on every request (e.g. parse JSON body) |
| **Seed** | Initial fake data loaded into empty DB |
| **Port** | Door number for a program — frontend 5173, backend 3001 |

---

## 12. Next steps for your team

1. Open `server/index.js` and follow the `app.use("/api/...", router)` lines.
2. Open `server/routes/sos.js` and read one handler top to bottom.
3. Change a donor name in DB (or seed) and refresh the app.
4. For production: deploy API (Railway, Render, Fly.io) and set `VITE_API_URL` to that URL.

If you want to go deeper on one file, start with **`server/routes/donors.js`** — it mirrors what you already know from the Profile and Passport screens.
