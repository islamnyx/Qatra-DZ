# Firebase layer

- `init.js` — App, Auth, Firestore singletons
- `adapters/hospitalDb.js` — `blood_inventory`, `blood_requests`, `pre_screening`
- `provider.js` — Donor app data switch target when `VITE_DATA_PROVIDER=firebase`

Deploy rules from `../Fire_Base/`:

```bash
cd ../Fire_Base && npx firebase deploy --only firestore
```

See `docs/HOSPITAL_DATABASE.md` for full schema.
