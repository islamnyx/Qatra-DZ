# Firebase team workspace

**You own this folder.** Wire Firebase Auth + Firestore (and optional Cloud Functions) without breaking the rest of the app.

## How you fit in the project

```
React screens
     ↓
data layer (src/services/data/index.js)  ← switches REST vs Firebase
     ↓
your adapters (src/features/firebase/adapters/*.js)
     ↓
Firestore / Auth / Functions
```

When `VITE_DATA_PROVIDER=firebase` in `.env.local`, the app calls **your** adapters. If a function returns `undefined` or throws, the app **falls back to REST** automatically.

## Step-by-step setup

### 1. Clone and install

```bash
git clone https://github.com/islamnyx/Qatra-DZ.git
cd Qatra-DZ
npm install
npm install firebase
```

### 2. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project **qatra-dz** (or use team name)
3. Add a **Web app**
4. Copy config values into `.env.local` (see below)

### 3. Create `.env.local` (never commit this file)

Copy from project root:

```bash
cp .env.example .env.local
```

Edit:

```env
VITE_DATA_PROVIDER=firebase

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=qatra-dz.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qatra-dz
VITE_FIREBASE_STORAGE_BUCKET=qatra-dz.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

Keep REST running as fallback during development:

```env
VITE_API_URL=/api
```

### 4. Enable Firestore

Console → Build → Firestore → Create database → **test mode** (hackathon) or production rules.

### 5. Import seed data (optional)

Use the same structure as `server/db/seed.js` or export SQLite JSON. Collections:

| Collection | Document ID example | Purpose |
|------------|---------------------|---------|
| `donors` | `DZ-001` | Profile, points, blood type |
| `family_members` | auto | `donorId` field links to donor |
| `sos_requests` | `SOS-001` | Urgent requests (realtime!) |
| `sos_responses` | auto | Who responded |
| `wilayas` | `Alger` | Map team may add `lat`/`lng` |
| `news_feed` | `1`, `2`, `3` | Feed + `campaignInterest` number |
| `chat_sessions` | optional | Store messages |

See `collections.js` for exact names.

### 6. Implement adapters (one file at a time)

| Priority | File | Feature |
|----------|------|---------|
| 1 | `adapters/sos.js` | Live SOS on Home |
| 2 | `adapters/donors.js` | Profile + passport + family |
| 3 | `adapters/wilayas.js` | Map (coordinate with map team) |
| 4 | `adapters/feed.js` | Campaign counter |
| 5 | `adapters/chat.js` | Chat (or Cloud Function) |

Example `getDonor` in `adapters/donors.js`:

```js
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "../init.js";
import { COLLECTIONS } from "../collections.js";

export async function getDonor(id) {
  const db = await getFirestoreDb();
  const snap = await getDoc(doc(db, COLLECTIONS.donors, id));
  if (!snap.exists()) return undefined;
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    bloodType: d.bloodType,
    wilaya: d.wilaya,
    lastDonation: d.lastDonation,
    totalDonations: d.totalDonations,
    points: d.points,
    isEligible: d.isEligible,
    daysUntilEligible: d.daysUntilEligible ?? 0,
    badges: d.badges ?? [],
    badgeDetails: d.badgeDetails ?? [],
    donationHistory: d.donationHistory ?? [],
  };
}
```

### 7. Realtime SOS (recommended for demo)

In `adapters/sos.js`, use `onSnapshot` in a React hook **or** return urgent request from Firestore query:

```js
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
```

Home screen uses `data.getUrgentSos()` — implement that to read Firestore.

### 8. Auth (optional for hackathon)

- `init.js` exports `getFirebaseAuth()`
- Add `hooks/useAuth.js` for login
- Donor id can be `auth.currentUser.uid` later; for demo keep `DZ-001`

### 9. Security rules (minimum for demo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // HACKATHON ONLY — tighten later
    }
  }
}
```

### 10. Git workflow

```bash
git checkout main
git pull
git checkout -b feature/firebase
# only edit src/features/firebase/ and .env.example (not .env.local)
git add src/features/firebase/
git commit -m "feat(firebase): implement SOS and donors adapters"
git push -u origin feature/firebase
```

**Do not commit** `.env.local` or Firebase private keys.

## What you should NOT change

- `src/features/map/` (map teammate)
- `src/features/chat/` UI (chat teammate — you only change `adapters/chat.js` or backend)
- `src/pages/Home.jsx` layout (unless coordinating)

## Coordination with Node backend

| Approach | When |
|----------|------|
| **Firebase only** | Set `VITE_DATA_PROVIDER=firebase`, implement all adapters |
| **Hybrid** | SOS + family on Firebase; rest on REST (partial adapters) |
| **REST only** | Default — no Firebase config needed |

The Node server in `server/` can stay for local dev; Firebase can replace it in production.

## Testing

```bash
# Terminal 1 — optional REST fallback
cd server && npm run dev

# Terminal 2
npm run dev
```

Open app → navbar should show data source. Test Firestore writes in Firebase Console.

## Questions?

Read `docs/TEAM.md` and ask the project lead before editing shared files.
