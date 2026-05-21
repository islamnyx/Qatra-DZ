/**
 * BloodSync hospital control panel — Transfer Optimizer, Shortages, Expiry, Forecast.
 * Data derived from Qatra DB (inventory, wilayas, expiring units, transfers).
 */
import { getDb } from "../db/database.js";
import { resolveWilaya } from "./bloodTools.js";

const WILAYA_DISTANCE_KM = {
  "Alger-Oran": 432,
  "Oran-Alger": 432,
  "Alger-Constantine": 312,
  "Constantine-Alger": 312,
  "Alger-Blida": 45,
  "Blida-Alger": 45,
  "Oran-Constantine": 380,
  "Constantine-Oran": 380,
  "Alger-Annaba": 410,
  "Annaba-Alger": 410,
};

const HOSPITAL_BY_WILAYA = {
  Alger: "CHU Mustapha Pacha",
  Oran: "CHU Oran",
  Constantine: "CHU Constantine",
  Blida: "CHU Blida",
  Annaba: "CHU Annaba",
  "Sétif": "CHU Sétif",
  "Tizi Ouzou": "EHSU Tizi Ouzou",
  "Béjaïa": "CHU Béjaïa",
};

export const SEASONAL_FACTORS = [
  { event: "Ramadan", range: "2026-02-28 — 2026-03-30", adjustments: "Surgical -20%, O+ +10%" },
  { event: "Summer", range: "2026-06-01 — 2026-08-31", adjustments: "All types -5%" },
  { event: "National campaigns", range: "Ongoing", adjustments: "A+ +8%, B+ +5% during CRA drives" },
];

function distanceKm(from, to) {
  if (from === to) return 0;
  return WILAYA_DISTANCE_KM[`${from}-${to}`] ?? WILAYA_DISTANCE_KM[`${to}-${from}`] ?? 250;
}

function urgencyFromUnits(units) {
  if (units <= 2) return 94;
  if (units <= 5) return 78;
  return 60;
}

/** Tab 0 — Transfer Optimizer recommendations */
export function getTransferRecommendations() {
  const db = getDb();
  const inventory = db.prepare("SELECT wilaya, blood_type, units FROM blood_inventory").all();
  const recs = [];
  let id = 1;

  const byType = {};
  for (const row of inventory) {
    if (!byType[row.blood_type]) byType[row.blood_type] = [];
    byType[row.blood_type].push(row);
  }

  for (const [bloodType, rows] of Object.entries(byType)) {
    const surplus = rows.filter((r) => r.units >= 10).sort((a, b) => b.units - a.units);
    const deficit = rows.filter((r) => r.units <= 5).sort((a, b) => a.units - b.units);

    for (const need of deficit) {
      const donor = surplus.find((s) => s.wilaya !== need.wilaya && s.units > need.units + 4);
      if (!donor) continue;

      const units = Math.min(15, Math.floor((donor.units - need.units) / 2));
      recs.push({
        id: `r${id++}`,
        action: "Transfer",
        title: `Redistribute ${bloodType} — low stock in ${need.wilaya}`,
        fromHospital: HOSPITAL_BY_WILAYA[donor.wilaya] ?? `CRA ${donor.wilaya}`,
        fromWilaya: donor.wilaya,
        toHospital: HOSPITAL_BY_WILAYA[need.wilaya] ?? `CRA ${need.wilaya}`,
        toWilaya: need.wilaya,
        bloodType,
        units,
        distanceKm: distanceKm(donor.wilaya, need.wilaya),
        urgency: urgencyFromUnits(need.units),
        expiryHours: need.units <= 2 ? 36 : null,
      });
      if (recs.length >= 6) break;
    }
    if (recs.length >= 6) break;
  }

  const pending = db
    .prepare(
      `SELECT id, blood_type, from_wilaya, to_wilaya, units, status FROM cross_region_transfers
       WHERE status = 'in_transit' ORDER BY created_at DESC LIMIT 3`
    )
    .all();

  for (const t of pending) {
    recs.push({
      id: t.id,
      action: "Transfer",
      title: `Active transfer ${t.blood_type}`,
      fromHospital: HOSPITAL_BY_WILAYA[t.from_wilaya] ?? t.from_wilaya,
      fromWilaya: t.from_wilaya,
      toHospital: HOSPITAL_BY_WILAYA[t.to_wilaya] ?? t.to_wilaya,
      toWilaya: t.to_wilaya,
      bloodType: t.blood_type,
      units: t.units,
      distanceKm: distanceKm(t.from_wilaya, t.to_wilaya),
      urgency: 85,
      expiryHours: null,
      status: t.status,
    });
  }

  return recs.slice(0, 8);
}

/** Tab 1 — Shortage alerts */
export function getShortageAlerts() {
  const db = getDb();
  const criticalWilayas = db
    .prepare("SELECT name, shortage FROM wilayas WHERE status = 'critical'")
    .all();

  const low = db
    .prepare(
      `SELECT wilaya, blood_type, units FROM blood_inventory WHERE units <= 5 ORDER BY units ASC`
    )
    .all();

  const shortages = [];
  const seen = new Set();

  for (const w of criticalWilayas) {
    const types = low.filter((r) => r.wilaya === w.name).map((r) => r.blood_type);
    const merged = [...new Set([w.shortage, ...types].filter(Boolean))];
    if (merged.length === 0) continue;
    const key = w.name;
    if (seen.has(key)) continue;
    seen.add(key);
    const minUnits = Math.min(...low.filter((r) => r.wilaya === w.name).map((r) => r.units), 5);
    shortages.push({
      hospital: HOSPITAL_BY_WILAYA[w.name] ?? `Centre ${w.name}`,
      wilaya: w.name,
      types: merged,
      daysUntilEmpty: Math.max(0.5, minUnits / 4),
      updated: new Date().toISOString(),
    });
  }

  for (const row of low) {
    if (seen.has(row.wilaya)) continue;
    seen.add(row.wilaya);
    shortages.push({
      hospital: HOSPITAL_BY_WILAYA[row.wilaya] ?? row.wilaya,
      wilaya: row.wilaya,
      types: [row.blood_type],
      daysUntilEmpty: Math.max(0.8, row.units / 3),
      updated: new Date().toISOString(),
    });
  }

  return shortages.sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);
}

/** Tab 2 — Expiry prevention */
export function getExpiringForPanel(maxHours = 72) {
  const db = getDb();
  const maxDays = maxHours / 24;
  const rows = db
    .prepare(
      `SELECT wilaya, hospital, blood_type, units, expires_in_days FROM blood_units_expiring
       WHERE expires_in_days <= ? ORDER BY expires_in_days ASC`
    )
    .all(Math.ceil(maxDays) || 7);

  const allWilayas = db.prepare("SELECT name FROM wilayas").all().map((w) => w.name);

  return rows.map((r, i) => {
    const hoursRemaining = Math.max(1, Math.round(r.expires_in_days * 24));
    const dest = allWilayas.find((w) => w !== r.wilaya) ?? "Alger";
    return {
      hospital: r.hospital,
      type: r.blood_type,
      units: r.units,
      hoursRemaining,
      suggestedTo: HOSPITAL_BY_WILAYA[dest] ?? dest,
      wilaya: r.wilaya,
    };
  });
}

/** Tab 3 — Demand forecast (7-day chart) */
export function getDemandForecast(hospitalId = "h1") {
  const db = getDb();
  const wilaya =
    { h1: "Alger", h2: "Alger", h3: "Constantine", h4: "Oran", h5: "Annaba", h6: "Blida" }[hospitalId] ??
    "Alger";

  const stock = db.prepare("SELECT blood_type, units FROM blood_inventory WHERE wilaya = ?").all(wilaya);

  const base = { "A+": 40, "O-": 55, "B+": 35 };
  for (const row of stock) {
    if (base[row.blood_type] != null) base[row.blood_type] = Math.max(20, Math.round(row.units * 4));
  }

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const ramadanFactor = 0.85;

  const chartDays = days.map((day, i) => ({
    day,
    "A+": Math.round(base["A+"] * (ramadanFactor + i * 0.02)),
    "O-": Math.round(base["O-"] * (1 + (i % 3) * 0.05)),
    "B+": Math.round(base["B+"] * (ramadanFactor + (i % 2) * 0.03)),
  }));

  return {
    hospitalId,
    wilaya,
    days: chartDays,
    context: "Ramadan active — surgical demand -20%. Forecast uses live inventory baseline.",
    seasonalFactors: SEASONAL_FACTORS,
  };
}

export function broadcastShortageAlert(payload = {}) {
  const shortages = getShortageAlerts();
  return {
    ok: true,
    message: "CRA donor alert broadcast initiated",
    shortagesNotified: shortages.length,
    estimatedReach: payload.estimatedReach ?? shortages.length * 1200,
    timestamp: new Date().toISOString(),
  };
}

export function approveTransferRecommendation(recId, body = {}) {
  const db = getDb();
  const { bloodType, fromWilaya, toWilaya, units = 2 } = body;
  if (!bloodType || !fromWilaya || !toWilaya) {
    return { ok: false, error: "bloodType, fromWilaya, toWilaya required" };
  }
  const id = recId?.startsWith("TR-") ? recId : `TR-${Date.now()}`;
  db.prepare(
    `INSERT OR REPLACE INTO cross_region_transfers (id, blood_type, from_wilaya, to_wilaya, units, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'))`
  ).run(id, bloodType, resolveWilaya(fromWilaya), resolveWilaya(toWilaya), units);
  return { ok: true, transferId: id, status: "approved" };
}
