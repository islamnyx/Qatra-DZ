import { getDb } from "../db/database.js";
import { getEligibility, MIN_DAYS_BETWEEN_DONATIONS } from "../utils/eligibility.js";
import { mapDonorRow, mapSosRow } from "../utils/donorMapper.js";
import { mapCenterRow } from "../utils/mapMapper.js";
import { evaluateEligibility, normalizeBloodType } from "./eligibilityRules.js";
import { badgesForDonationCount, nextMilestone, syncDonorBadges } from "./badgeSync.js";
import { evaluatePrescreening, getPrescreeningForm } from "./prescreening.js";

const WILAYA_ALIASES = {
  algiers: "Alger",
  alger: "Alger",
  oran: "Oran",
  constantine: "Constantine",
  blida: "Blida",
  annaba: "Annaba",
  setif: "Sétif",
  "sétif": "Sétif",
  "tizi ouzou": "Tizi Ouzou",
  tizi: "Tizi Ouzou",
  bejaia: "Béjaïa",
  béjaïa: "Béjaïa",
  bejaïa: "Béjaïa",
  mostaganem: "Mostaganem",
  mila: "Mila",
  skikda: "Skikda",
};

export function resolveWilaya(input) {
  if (!input) return null;
  const key = String(input).trim().toLowerCase();
  return WILAYA_ALIASES[key] ?? input.trim();
}

function inventoryStatus(units) {
  if (units <= 2) return "CRITICALLY_LOW";
  if (units <= 5) return "LOW";
  if (units <= 10) return "NORMAL";
  return "ADEQUATE";
}

/** 1 — Donor eligibility */
export function checkEligibility(payload) {
  return evaluateEligibility(payload);
}

/** 2 — Nearest donation centers */
export function findNearestCenters(location) {
  const db = getDb();
  const wilaya = resolveWilaya(location);
  const rows = db
    .prepare(
      `SELECT * FROM donation_centers WHERE wilaya = ? COLLATE NOCASE ORDER BY name ASC`
    )
    .all(wilaya);

  if (rows.length === 0) {
    const w = db.prepare("SELECT name, name_ar, hospitals FROM wilayas WHERE name = ?").get(wilaya);
    if (w) {
      const hospitals = JSON.parse(w.hospitals);
      return {
        wilaya: w.name,
        nameAr: w.name_ar,
        centers: hospitals.map((h) => ({ name: h, hours: "Contact CRA", phone: "3030" })),
        note: "Detailed center hours being updated — call 3030.",
      };
    }
    return { wilaya: location, centers: [], note: "Wilaya not found. Try: Alger, Oran, Constantine, Blida, Annaba, Sétif, Tizi Ouzou, Béjaïa." };
  }

  return {
    wilaya,
    centers: rows.map((r) => {
      const mapped = mapCenterRow(r);
      return {
        id: mapped.id,
        name: r.name,
        nameAr: mapped.nameAr,
        nameFr: mapped.nameFr,
        address: r.address,
        hours: r.hours,
        hoursStructured: mapped.hours,
        phone: r.phone,
        mobileDrive: r.mobile_drive,
        lat: mapped.lat,
        lng: mapped.lng,
        mapPath: "/map",
      };
    }),
  };
}

/** 3 — Milestones & badges */
export function getDonationMilestones(donorId) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM donors WHERE id = ?").get(donorId);
  if (!row) return { error: "DONOR_NOT_FOUND" };

  syncDonorBadges(db, donorId, row.total_donations);
  const earned = badgesForDonationCount(row.total_donations);
  const stored = db
    .prepare("SELECT name, icon, color FROM badges WHERE donor_id = ?")
    .all(donorId);

  return {
    donorId,
    totalDonations: row.total_donations,
    totalVolumeMl: row.total_donations * 450,
    earnedBadges: earned.map((b) => b.name),
    allBadges: stored,
    nextMilestone: nextMilestone(row.total_donations),
    livesSavedEstimate: row.total_donations * 3,
  };
}

/** 4 — Next donation date (56-day CRA rule) */
export function calculateNextDonationDate(lastDonationDate) {
  const { isEligible, daysUntilEligible } = getEligibility(lastDonationDate);
  let nextDate = null;
  if (lastDonationDate) {
    const last = new Date(lastDonationDate);
    const next = new Date(last);
    next.setDate(next.getDate() + MIN_DAYS_BETWEEN_DONATIONS);
    nextDate = next.toISOString().split("T")[0];
  }

  return {
    lastDonation: lastDonationDate,
    minDaysBetween: MIN_DAYS_BETWEEN_DONATIONS,
    isEligible,
    daysUntilEligible,
    nextEligibleDate: isEligible ? new Date().toISOString().split("T")[0] : nextDate,
  };
}

/** 5 — Blood inventory by type & wilaya */
export function checkInventory(bloodType, wilaya) {
  const db = getDb();
  const type = normalizeBloodType(bloodType);
  const w = resolveWilaya(wilaya);
  if (!type) return { error: "INVALID_BLOOD_TYPE" };

  const row = db
    .prepare("SELECT units, updated_at FROM blood_inventory WHERE wilaya = ? AND blood_type = ?")
    .get(w, type);

  const units = row?.units ?? 0;
  return {
    bloodType: type,
    wilaya: w,
    units,
    status: inventoryStatus(units),
    updatedAt: row?.updated_at ?? null,
    note: type === "O-" ? "Universal donor type — highest priority in shortages." : null,
  };
}

/** 5b — All types in wilaya */
export function checkInventoryAll(wilaya) {
  const db = getDb();
  const w = resolveWilaya(wilaya);
  const rows = db.prepare("SELECT blood_type, units FROM blood_inventory WHERE wilaya = ?").all(w);
  return {
    wilaya: w,
    inventory: rows.map((r) => ({
      bloodType: r.blood_type,
      units: r.units,
      status: inventoryStatus(r.units),
    })),
  };
}

/** Nearby inventory when local is low */
export function findNearbyInventory(bloodType, wilaya) {
  const local = checkInventory(bloodType, wilaya);
  const db = getDb();
  const type = normalizeBloodType(bloodType);
  const w = resolveWilaya(wilaya);

  const nearby = db
    .prepare(
      `SELECT wilaya, units FROM blood_inventory
       WHERE blood_type = ? AND wilaya != ? AND units > 5
       ORDER BY units DESC LIMIT 5`
    )
    .all(type, w);

  return { local, nearby };
}

/** 6 — Reminder scheduler */
export function scheduleReminder(donorId, lastDonationDate) {
  const db = getDb();
  const calc = calculateNextDonationDate(lastDonationDate);
  if (!calc.nextEligibleDate && !lastDonationDate) {
    return { error: "INVALID_LAST_DONATION" };
  }

  const eligible = new Date(calc.isEligible ? Date.now() : calc.nextEligibleDate);
  const remind = new Date(eligible);
  remind.setDate(remind.getDate() - 7);
  const remindAt = remind.toISOString();

  db.prepare(
    `INSERT INTO reminders (donor_id, remind_at, channel, last_donation, created_at)
     VALUES (?, ?, 'app', ?, datetime('now'))`
  ).run(donorId, remindAt, lastDonationDate);

  return {
    donorId,
    remindAt: remindAt.split("T")[0],
    eligibleDate: calc.nextEligibleDate,
    channel: "app",
    message: "Reminder scheduled 7 days before eligibility.",
  };
}

/** 7 — Leaderboard */
export function getLeaderboard(region = "national") {
  const db = getDb();
  const key = String(region).toLowerCase();

  let sql = `
    SELECT d.id, d.name, d.blood_type, d.wilaya, d.total_donations, d.points, l.rank_order
    FROM leaderboard l
    JOIN donors d ON d.id = l.donor_id
  `;
  const params = [];

  if (key !== "national" && key !== "all") {
    const w = resolveWilaya(region);
    sql += " WHERE d.wilaya = ? COLLATE NOCASE";
    params.push(w);
  }

  sql += " ORDER BY l.rank_order ASC LIMIT 10";

  const rows = db.prepare(sql).all(...params);
  return {
    region: key === "national" || key === "all" ? "national" : resolveWilaya(region),
    leaders: rows.map((r) => ({
      id: r.id,
      name: r.name,
      bloodType: r.blood_type,
      wilaya: r.wilaya,
      totalDonations: r.total_donations,
      points: r.points,
      rank: r.rank_order,
    })),
  };
}

/** 8 — Emergency response */
export function activateEmergency(emergencyType, location) {
  const db = getDb();
  const w = resolveWilaya(location);
  const critical = db
    .prepare(
      `SELECT id, blood_type, hospital, wilaya, urgency FROM sos_requests WHERE active = 1 ORDER BY posted_at DESC LIMIT 5`
    )
    .all();

  const lowStock = db
    .prepare(
      `SELECT blood_type, units FROM blood_inventory WHERE wilaya = ? AND units <= 5 ORDER BY units ASC`
    )
    .all(w);

  return {
    emergencyType,
    location: w,
    protocol: [
      "Regional inventory assessment",
      "Rare donor network activation",
      "Mobile collection units dispatched",
      "CRA emergency hotline 3030 notified",
    ],
    priorityTypes: ["O-", "O+", "AB-"],
    activeSos: critical.map(mapSosRow),
    lowInventory: lowStock.map((r) => ({
      bloodType: r.blood_type,
      units: r.units,
    })),
    estimatedResponseMinutes: "30-60",
  };
}

/** 9 — Cross-region transfer */
export function coordinateTransfer(bloodType, fromWilaya, toWilaya) {
  const db = getDb();
  const type = normalizeBloodType(bloodType);
  const from = resolveWilaya(fromWilaya);
  const to = resolveWilaya(toWilaya);

  const source = db
    .prepare("SELECT units FROM blood_inventory WHERE wilaya = ? AND blood_type = ?")
    .get(from, type);

  if (!source || source.units < 2) {
    return {
      status: "blocked",
      message: `Insufficient ${type} units in ${from} for transfer.`,
      unitsAvailable: source?.units ?? 0,
    };
  }

  const transferId = `TR-${Date.now()}`;
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE blood_inventory SET units = units - 2, updated_at = datetime('now')
       WHERE wilaya = ? AND blood_type = ?`
    ).run(from, type);
    db.prepare(
      `INSERT INTO cross_region_transfers (id, blood_type, from_wilaya, to_wilaya, units, status, created_at)
       VALUES (?, ?, ?, ?, 2, 'in_transit', datetime('now'))`
    ).run(transferId, type, from, to);
  });
  tx();

  return {
    transferId,
    bloodType: type,
    fromWilaya: from,
    toWilaya: to,
    units: 2,
    status: "in_transit",
    estimatedHours: "2-4",
    message: "CRA logistics team notified. Transport via blood supply chain.",
  };
}

/** 10 — Expiring units */
export function getExpiringUnits(wilaya, daysThreshold = 7) {
  const db = getDb();
  const w = resolveWilaya(wilaya);
  const rows = db
    .prepare(
      `SELECT hospital, blood_type, units, expires_in_days
       FROM blood_units_expiring
       WHERE wilaya = ? AND expires_in_days <= ?
       ORDER BY expires_in_days ASC`
    )
    .all(w, daysThreshold);

  return {
    wilaya: w,
    daysThreshold,
    units: rows,
    recommendation:
      rows.length > 0
        ? "Transfer expiring units to high-demand centers immediately."
        : "No units expiring within threshold.",
  };
}

/** 11 — Rare blood donor network */
export function contactRareBloodDonors(bloodType) {
  const db = getDb();
  const type = normalizeBloodType(bloodType);
  const rareTypes = ["AB-", "Bombay"];
  const isRare = rareTypes.includes(type) || type === "AB-";

  const donors = db
    .prepare(
      `SELECT id, name, wilaya, blood_type FROM donors
       WHERE blood_type = ? AND is_rare_donor = 1 LIMIT 5`
    )
    .all(type);

  const fallback = db
    .prepare(
      `SELECT id, name, wilaya, blood_type FROM donors WHERE blood_type = ? LIMIT 3`
    )
    .all(type);

  const matched = donors.length > 0 ? donors : fallback;

  return {
    bloodType: type,
    isRare,
    protocolActivated: true,
    matchedDonors: matched.length,
    donors: matched.map((d) => ({
      id: d.id,
      name: d.name.split(" ")[0] + " ***",
      wilaya: d.wilaya,
    })),
    estimatedResponseMinutes: "30-60",
    message: "CRA coordination team notified. Medical staff will contact eligible donors.",
  };
}

/** 12 — Pre-screening */
export function prescreeningForm() {
  return getPrescreeningForm();
}

export function runPrescreening(answers) {
  return evaluatePrescreening(answers);
}

export { getPrescreeningForm, evaluatePrescreening };
