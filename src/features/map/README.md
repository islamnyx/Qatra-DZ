# Map team workspace

**You own this folder.** Push changes here without touching Home, Chat, or Firebase folders.

## Your files

| File | Your work |
|------|-----------|
| `MapPage.jsx` | Main screen — add real map in the `[data-map-slot]` section |
| `components/WilayaSheet.jsx` | Bottom sheet when user taps a wilaya |
| `api/mapService.js` | Load wilaya data (already wired to REST/Firebase) |
| `components/` | Add `MapView.jsx`, markers, legends, etc. |

## Do NOT edit

- `src/pages/Home.jsx` (UI/UX lead)
- `src/features/firebase/` (Firebase teammate — unless syncing wilaya schema)
- `src/components/BottomNav.jsx`, `LanguageToggle.jsx`

## Data

Wilayas come from `fetchWilayas()` in `api/mapService.js` → uses `data.getWilayas()` (REST or Firebase).

Optional fields to agree with Firebase team:

```js
{ name, nameAr, status, shortage, hospitals, lat, lng, zoom }
```

## Git branch

```bash
git checkout main
git pull
git checkout -b feature/map
# work in src/features/map/
git add src/features/map/
git commit -m "feat(map): add interactive wilaya map"
git push -u origin feature/map
```

Open a Pull Request on GitHub.

## Run app

```bash
# terminal 1
cd server && npm run dev
# terminal 2
npm run dev
```

Route: `/map` (already registered in `App.jsx`).
