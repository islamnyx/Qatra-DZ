# BloodSync — 12 Features Testing Guide

All features live in **Qatra-DZ** under `server/services/bloodTools.js` and `server/routes/blood.js`.

**Prerequisites**

```powershell
cd C:\Users\HP\Qatra-DZ\server
npm install
npm run dev
```

API base: `http://localhost:3001/api`

Demo donor: `DZ-001` (أمين بوعلام)

---

## Quick health check

```text
GET http://localhost:3001/api/health
```

---

## 1. Donor eligibility check

**API**

```powershell
curl -X POST http://localhost:3001/api/blood/eligibility/check -H "Content-Type: application/json" -d "{\"weightKg\": 48}"
```

Expected: `status: "deferred"`, reason `WEIGHT_LOW`

```powershell
curl -X POST http://localhost:3001/api/blood/eligibility/check -H "Content-Type: application/json" -d "{\"weightKg\": 65, \"tattooMonthsAgo\": 4}"
```

Expected: `status: "deferred"`, `TATTOO_PIERCING`

**DamBot (Chat UI)**

1. Start frontend: `npm run dev` (project root)
2. Open **Chat** tab
3. Send: `Can I donate if I weigh 48kg?` or `هل أنا مؤهل؟`

---

## 2. Location finder (9 cities)

Cities: Alger, Oran, Constantine, Blida, Annaba, Sétif, Tizi Ouzou, Béjaïa

```powershell
curl "http://localhost:3001/api/blood/centers?wilaya=Oran"
```

**DamBot:** `أقرب مركز تبرع في وهران` or `Centre le plus proche à Alger`

---

## 3. Donation milestones & badges

```powershell
curl http://localhost:3001/api/blood/milestones/DZ-001
```

Expected: badges like `🥇 First Donor`, `🎯 Triple Hero`, `⭐ Life Saver` (7 donations)

**DamBot:** `شاراتي وإنجازاتي` or `Mes badges et jalons`

**Profile UI:** Open **Profile** — badge cards from same donor record

---

## 4. Next donation date (56-day CRA rule)

```powershell
curl "http://localhost:3001/api/blood/next-donation?lastDonation=2025-03-10"
```

Expected: `minDaysBetween: 56`, `isEligible` / `daysUntilEligible` computed

**DamBot:** `متى يمكنني التبرع مرة أخرى؟` or `My last donation was 2025-03-10`

**Home UI:** Eligibility ring uses same 56-day rule via `/api/donors/DZ-001`

---

## 5. Blood inventory check

Single type:

```powershell
curl "http://localhost:3001/api/blood/inventory?wilaya=Alger&bloodType=O-"
```

All types in wilaya:

```powershell
curl "http://localhost:3001/api/blood/inventory?wilaya=Oran"
```

**DamBot:** `مخزون O- في وهران` or `Stock O- à Oran`

---

## 6. Reminder scheduler

```powershell
curl -X POST http://localhost:3001/api/blood/reminders -H "Content-Type: application/json" -d "{\"donorId\": \"DZ-001\", \"lastDonation\": \"2025-03-10\"}"
```

Expected: `remindAt` ~7 days before next eligible date

**DamBot:** `Schedule reminder last donation 2025-03-10`

---

## 7. Leaderboard

National:

```powershell
curl http://localhost:3001/api/leaderboard
```

Regional:

```powershell
curl "http://localhost:3001/api/blood/leaderboard?region=Oran"
```

**DamBot:** `لوحة المتصدرين`

---

## 8. Emergency response

```powershell
curl -X POST http://localhost:3001/api/blood/emergency -H "Content-Type: application/json" -d "{\"emergencyType\": \"earthquake\", \"location\": \"Constantine\"}"
```

Expected: protocol steps, `activeSos`, `lowInventory`

**DamBot:** `طوارئ في قسنطينة` or `emergency Constantine`

---

## 9. Cross-region transfer

```powershell
curl -X POST http://localhost:3001/api/blood/transfer -H "Content-Type: application/json" -d "{\"bloodType\": \"O+\", \"fromWilaya\": \"Oran\", \"toWilaya\": \"Alger\"}"
```

Expected: `transferId`, `status: "in_transit"`

**DamBot:** `transfer O+ from Oran to Alger`

---

## 10. Expiring units alert

```powershell
curl "http://localhost:3001/api/blood/expiring?wilaya=Alger&days=7"
```

Expected: list of units with `expires_in_days`

**DamBot:** `تنبيه وحدات منتهية الصلاحية في الجزائر`

**BloodSync panel:** Nexus AI → Expiry Prevention tab (mock UI; API is real)

---

## 11. Rare blood donor network

```powershell
curl -X POST http://localhost:3001/api/blood/rare-donors -H "Content-Type: application/json" -d "{\"bloodType\": \"AB-\"}"
```

Expected: `protocolActivated: true`, `matchedDonors`

**DamBot:** `rare blood AB- donors`

---

## 12. Medical pre-screening

Get questionnaire:

```powershell
curl http://localhost:3001/api/blood/prescreening
```

Submit answers:

```powershell
curl -X POST http://localhost:3001/api/blood/prescreening -H "Content-Type: application/json" -d "{\"answers\": {\"feelsHealthy\": true, \"highRiskMeds\": false, \"malariaTravel\": false, \"recentAlcohol\": false, \"meetsWeight\": true}}"
```

Expected: `status: "ready"`

Fail case:

```powershell
curl -X POST http://localhost:3001/api/blood/prescreening -H "Content-Type: application/json" -d "{\"answers\": {\"feelsHealthy\": false, \"meetsWeight\": true}}"
```

Expected: `status: "deferred"`

**DamBot:** `استبيان ما قبل التبرع`

---

## Nearby inventory (bonus)

```powershell
curl "http://localhost:3001/api/blood/inventory/nearby?wilaya=Alger&bloodType=O-"
```

---

## Chat prompts (all 12 via DamBot)

After starting server + frontend, try quick prompts on the Chat page (AR/FR):

| Feature | Arabic prompt |
|---------|----------------|
| Eligibility | هل أنا مؤهل للتبرع؟ |
| Centers | أقرب مركز تبرع في الجزائر |
| Inventory | مخزون O- في وهران |
| Next donation | متى يمكنني التبرع مرة أخرى؟ |
| Milestones | شاراتي وإنجازاتي |
| Leaderboard | لوحة المتصدرين |
| Pre-screening | استبيان ما قبل التبرع |
| Expiring | تنبيه وحدات منتهية الصلاحية |

---

## Automated smoke test

```powershell
cd C:\Users\HP\Qatra-DZ\server
node scripts/test-blood-features.js
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server needs **Node 22+** | Uses built-in `node:sqlite` (no `better-sqlite3`). Run `node -v` — upgrade if below 22. |
| Empty inventory / centers | Restart server — `ensureExtendedSeed` runs on boot |
| Old data | Delete `server/data/qatra.db` and restart (re-seeds demo data) |
| Chat shows offline | Ensure `npm run dev` in `server/` on port 3001 |
| 404 on `/api/blood/*` | Pull latest code; confirm `app.use("/api/blood", bloodRouter)` in `server/index.js` |
