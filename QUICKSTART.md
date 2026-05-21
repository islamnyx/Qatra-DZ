# Qatra — Quick start (fix “not working”)

You need **two terminals**. Order matters.

## Terminal 1 — API (required)

```bash
cd server
npm install
npm start
```

Wait until you see **only**:

```text
Qatra API running at http://localhost:3001
```

If you see **“Port 3001 is already in use”**:

```bash
# Git Bash / PowerShell
npx kill-port 3001
npm start
```

Test in browser: http://localhost:3001/api/health → should show `"ok": true`

## Terminal 2 — Donor app

```bash
# project root (Qatra-DZ)
npm install
npm run dev
```

Open: **http://localhost:5173** (use **http**, not https)

Top bar must show **· API** in green. If it says **· offline**, Terminal 1 is not running.

## Terminal 3 — BloodSync hospital panel (optional)

```bash
cd bloodsync
npm install
npm run dev
```

Open: http://localhost:5174 — needs API on 3001.

## DamBot (Chat)

With **API** online, all 11 question types work via `POST /api/chat`.

Test:

```bash
cd server
npm run test:chat
```

## Common failures

| Symptom | Fix |
|---------|-----|
| Red Vite overlay `leaflet.css` | Run `npm install` in project **root** |
| Chat only 3 answers | API offline — start `server` |
| `Waiting for file changes` + crash | Port busy — `npx kill-port 3001` |
| HTTPS certificate errors | Use **http://localhost:5173** (SSL plugin removed) |
