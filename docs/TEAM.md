# Qatra — Team collaboration guide

Project: **قطرة Qatra** · Repo: [github.com/islamnyx/Qatra-DZ](https://github.com/islamnyx/Qatra-DZ)

## Who owns what

| Teammate | Folder(s) | Branch name | Route |
|----------|-----------|-------------|-------|
| **UI / you** | `src/pages/`, `src/components/`, `src/context/` | `main` or `feature/ui` | `/`, `/profile`, `/family`, `/passport` |
| **Map** | `src/features/map/` | `feature/map` | `/map` |
| **Chat** | `src/features/chat/` | `feature/chat` | `/chat` |
| **Firebase** | `src/features/firebase/` | `feature/firebase` | (all data) |
| **Backend (optional)** | `server/` | `feature/api` | API `:3001` |

## Project structure (simplified)

```
simple-app/
├── src/
│   ├── features/
│   │   ├── map/          ← MAP TEAM
│   │   ├── chat/         ← CHAT TEAM
│   │   └── firebase/     ← FIREBASE TEAM
│   ├── services/data/    ← REST vs Firebase switch (do not fork)
│   ├── pages/            ← thin wrappers (do not duplicate logic here)
│   ├── components/       ← shared UI (Navbar, BottomNav, …)
│   └── context/          ← global state
├── server/               ← Node API (default data)
├── docs/TEAM.md          ← this file
└── .env.example          ← copy to .env.local per developer
```

## Git workflow (everyone)

```bash
git clone https://github.com/islamnyx/Qatra-DZ.git
cd Qatra-DZ
npm install
cd server && npm install && cd ..

git checkout main
git pull origin main

git checkout -b feature/YOUR-AREA   # e.g. feature/map

# ... edit only your folder ...

git add src/features/map/           # only your paths
git status                          # verify you are not committing .env.local
git commit -m "feat(map): describe your change"
git push -u origin feature/YOUR-AREA
```

Then open a **Pull Request** on GitHub → `main`.  
**Do not push directly to `main`** unless you are the lead merging PRs.

### Files never commit

- `.env.local` (secrets)
- `node_modules/`
- `server/data/*.db`
- `dist/`

## Running the full app locally

**Terminal 1 — API (recommended for map/chat until Firebase is done):**

```powershell
cd server
npm run dev
```

**Terminal 2 — Frontend:**

```powershell
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001/api/health  

## Data layer (important)

All screens should load data through:

```js
import { data } from "../services/data/index.js";
await data.getWilayas();
```

Not directly:

```js
import { api } from "../api/client.js";  // avoid in feature folders
```

Firebase teammate implements `src/features/firebase/adapters/`.  
Map/chat teams use `mapService.js` / `chatService.js` inside their feature folders.

## Merge conflicts — how to avoid

1. Each team works **only in their folder**
2. Pull `main` before starting each day: `git pull origin main`
3. Rebase your branch if main moved: `git rebase main`
4. If conflict in `App.jsx` or `package.json` → ask project lead

## Environment variables

| Variable | Who sets it |
|----------|-------------|
| `VITE_API_URL` | Everyone (default `/api`) |
| `VITE_DATA_PROVIDER` | `rest` (default) or `firebase` |
| `VITE_FIREBASE_*` | Firebase team only |

Copy `.env.example` → `.env.local` (gitignored).

## Before hackathon demo

- [ ] All PRs merged to `main`
- [ ] `npm run build` passes
- [ ] One person runs `server` + `npm run dev` OR Firebase production config
- [ ] Phone test on same Wi‑Fi (Network URL from Vite)

## Help

| Topic | Doc |
|-------|-----|
| Backend basics | `BACKEND_GUIDE.md` |
| Firebase setup | `src/features/firebase/README.md` |
| Map | `src/features/map/README.md` |
| Chat | `src/features/chat/README.md` |
