# قطرة — Qatra · BloodSync

Blood donation ecosystem for the Algerian Red Crescent.

| App | Folder | Port | Users |
|-----|--------|------|--------|
| **Qatra** (donor mobile PWA) | project root `src/` | 5173 | Donors |
| **BloodSync** (hospital panel) | `bloodsync/` | 5174 | Hospitals, CRA, Admin |
| **API** | `server/` | 3001 | Both apps (REST) |

## Run in browser (frontend + backend)

**Terminal 1 — API (required for live data):**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 — React app:**

```bash
npm install
npm run dev
```

- PC: **http://localhost:5173** (navbar shows **API** when backend is connected)
- API health: **http://localhost:3001/api/health**
- Phone (same Wi‑Fi): use the **Network** URL from the terminal (e.g. `http://10.x.x.x:5173`)

**New to backends?** Read [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) — plain-language explanation of every folder and endpoint.

## Team workflow (map / chat / Firebase)

| Role | Workspace | Guide |
|------|-----------|--------|
| Map | `src/features/map/` | [map/README.md](./src/features/map/README.md) |
| Chat | `src/features/chat/` | [chat/README.md](./src/features/chat/README.md) |
| Firebase | `src/features/firebase/` | [firebase/README.md](./src/features/firebase/README.md) |
| Everyone | Git + PR rules | [docs/TEAM.md](./docs/TEAM.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) |

Copy `.env.example` → `.env.local` before starting. Firebase teammate sets `VITE_DATA_PROVIDER=firebase`.

## Features

- Blood drop splash animation
- SOS respond flow + match score
- Family Blood Vault
- Digital Donation Passport (QR)
- DamBot chat, AR/FR toggle, wilaya map sheets

## Android APK (optional)

```bash
npm run cap:sync
npm run cap:android
```
