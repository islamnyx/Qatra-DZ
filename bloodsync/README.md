# BloodSync — Hospital Control Panel

Admin/hospital web app for blood distribution across Algeria. Pairs with the **قطرة Qatra** donor mobile app.

## Tech stack

| Layer | Stack |
|-------|--------|
| UI | React 19 + Vite + Tailwind CSS 4 |
| Routing | React Router 7 |
| State | Zustand (auth) |
| Map | react-leaflet + OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |
| Data (dev) | Mock API in `src/api/mockApi.js` |
| Backend (prod) | Node + Express + MongoDB (separate build — see prompt Section 15) |

## Design (matches Qatra)

- Primary `#C42B2B` · Surface `#FFF8F8` · Font **Inter**
- Cards 16px radius · Buttons 10px radius

## Run locally

```bash
cd bloodsync
npm install
npm run dev
```

Open **http://localhost:5174**

### Demo login

| Role | Redirects to |
|------|----------------|
| Hospital Manager | `/dashboard` |
| CRA Association | `/drives` |
| National Admin | `/analytics` |
| Medical Team | `/scanner` |

Any password works (mock JWT in localStorage).

## Screens included

- Login + role selector
- Dashboard (KPIs, mini map, urgent list, AI strip)
- Full GPS map + hospital side panel
- Nexus AI (4 tabs)
- Inventory table + CSV export
- Transfer log + approve/reject (Manager)
- Placeholders: Drives, Analytics, Scanner, Settings

## Ecosystem

```
Qatra (donor app)     →  port 5173  →  server/ REST API
BloodSync (hospital)    →  port 5174  →  mock API (swap to Express when ready)
```

## Team

- Hospital panel UI: `bloodsync/src/pages/`
- Map: extend `MapView.jsx` + `react-leaflet`
- Backend: new `bloodsync-server/` or extend `server/` with Mongo models from prompt
