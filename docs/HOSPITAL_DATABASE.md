# Hospital control panel database (Firestore)

Industrial schema for BloodSync and Qatra donor app, backed by **Firebase Firestore**.

## Collections

| Collection | Document ID | Access |
|------------|-------------|--------|
| `blood_inventory` | `unit_id` | `hospital_staff` read/write only |
| `blood_requests` | `request_id` | All authenticated read; staff write |
| `pre_screening` | `donor_hash` (= Auth UID) | Donor create; donor/staff get by id; no list |
| `users` | Firebase Auth UID | Role ACL (`donor` \| `hospital_staff`) |
| `hospitals` | `hospital_id` | Staff read (reference metadata) |

## 1. Blood inventory (`blood_inventory`)

| Field | Type | Notes |
|-------|------|--------|
| `unit_id` | string | Document ID, unique bag serial |
| `hospital_id` | string | Owning facility |
| `blood_type` | string | A+, O-, … |
| `component_type` | string | `RBC` (42 days) or `Platelets` (5 days) |
| `donation_date` | string | `YYYY-MM-DD` |
| `expiration_date` | string | Auto: donation + shelf life |
| `status` | string | `available` \| `expired` \| `reserved` |

## 2. Blood requests (`blood_requests`)

| Field | Type | Notes |
|-------|------|--------|
| `request_id` | string | Document ID |
| `hospital_id` | string | Intermediary hospital |
| `required_blood_type` | string | |
| `required_component` | string | RBC / Platelets |
| `quantity_needed` | int | 1–99 |
| `urgency_level` | string | `CRITICAL` \| `MEDIUM` |
| `status` | string | `pending` \| `fulfilled` |

**Golden rule:** No `donor_id`, `matched_donor_*`, or matching fields on this collection.

## 3. Pre-screening (`pre_screening`)

| Field | Type | Notes |
|-------|------|--------|
| `donor_hash` | string | Document ID = Firebase Auth UID |
| `encrypted_medical_answers` | string | AES-256-GCM base64 ciphertext |
| `encryption_version` | number | |
| `submitted_at` | string | ISO timestamp |

Encryption: `shared/hospital-db/encryption.js` (browser). Production: encrypt with native/HSM before upload.

## Code layout

- `shared/hospital-db/` — schema, validation, expiration math, encryption, mappers
- `src/features/firebase/adapters/hospitalDb.js` — Firestore CRUD
- `bloodsync/src/api/` — `api` facade (mock or Firebase via env)

## Setup

1. Copy `.env.example` → `.env.local` (root + `bloodsync/.env.local`) and set `VITE_FIREBASE_*`.
2. Deploy rules and indexes:

```bash
cd src/features/Fire_Base
npx firebase deploy --only firestore:rules,firestore:indexes
```

3. Create **hospital_staff** users in Firebase Auth; add `/users/{uid}`:

```json
{
  "role": "hospital_staff",
  "hospital_id": "h1",
  "panel_role": "manager",
  "display_name": "CHU Manager"
}
```

4. BloodSync: set `VITE_DATA_PROVIDER=firebase` in bloodsync `.env.local` (optional; mock works offline).

5. Seed sample units/requests: import `scripts/seed-hospital-db.json` via Firebase Console or Admin SDK.

## BloodSync pages wired

- **Inventory** — unit-level `blood_inventory`
- **SOS Requests** — `blood_requests` CRUD
- **Scanner** — decrypt `pre_screening` by donor hash
