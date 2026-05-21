import { deriveInventoryStatus } from "./bloodLifecycle.js";

/** Firestore doc snapshot → BloodInventoryUnit */
export function mapInventoryDoc(id, data) {
  const status = deriveInventoryStatus(data.expiration_date, data.status);
  return {
    unit_id: id,
    hospital_id: data.hospital_id,
    hospital_name: data.hospital_name ?? "",
    wilaya: data.wilaya ?? "",
    blood_type: data.blood_type,
    component_type: data.component_type,
    donation_date: data.donation_date,
    expiration_date: data.expiration_date,
    status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/** Firestore doc → BloodRequest */
export function mapBloodRequestDoc(id, data) {
  return {
    request_id: id,
    hospital_id: data.hospital_id,
    hospital_name: data.hospital_name ?? "",
    wilaya: data.wilaya ?? "",
    required_blood_type: data.required_blood_type,
    required_component: data.required_component,
    quantity_needed: data.quantity_needed,
    urgency_level: data.urgency_level,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/** Aggregate unit-level inventory into hospital stock summary (BloodSync UI). */
export function aggregateInventoryByHospital(units) {
  const byHospital = new Map();

  for (const u of units) {
    if (!byHospital.has(u.hospital_id)) {
      byHospital.set(u.hospital_id, {
        id: u.hospital_id,
        name: u.hospital_name || u.hospital_id,
        wilaya: u.wilaya || "",
        stock: [],
        stockLevel: 1,
        hasExpiryRisk: false,
        lastUpdated: u.updated_at,
      });
    }
    const h = byHospital.get(u.hospital_id);
    const key = `${u.blood_type}|${u.component_type}`;
    let row = h.stock.find((s) => s._key === key);
    if (!row) {
      row = {
        _key: key,
        type: u.blood_type,
        component: u.component_type,
        units: 0,
        optimal: 50,
        fillRatio: 0,
        trend: "→",
        expiryAlert: null,
        hoursToExpiry: 999,
      };
      h.stock.push(row);
    }
    if (u.status === "available" || u.status === "reserved") {
      row.units += 1;
    }
    const expMs = new Date(`${u.expiration_date}T12:00:00Z`).getTime() - Date.now();
    const hours = Math.max(0, Math.floor(expMs / 3600000));
    if (hours < row.hoursToExpiry) {
      row.hoursToExpiry = hours;
      row.expiryAlert = hours < 48 ? `${hours}h` : null;
    }
    if (hours < 72) h.hasExpiryRisk = true;
  }

  for (const h of byHospital.values()) {
    h.stock = h.stock.map(({ _key, ...rest }) => {
      const fillRatio = rest.units / rest.optimal;
      return { ...rest, fillRatio };
    });
    const total = h.stock.reduce((s, r) => s + r.units, 0);
    const optimal = h.stock.reduce((s, r) => s + r.optimal, 0);
    h.stockLevel = optimal ? total / optimal : 0;
  }

  return [...byHospital.values()];
}

/** Donor app SOS shape ↔ blood_requests */
export function mapBloodRequestToSos(req) {
  return {
    id: req.request_id,
    bloodType: req.required_blood_type,
    component: req.required_component,
    hospital: req.hospital_name,
    wilaya: req.wilaya,
    urgency: req.urgency_level === "CRITICAL" ? "critical" : "medium",
    quantity: req.quantity_needed,
    status: req.status,
    postedAt: req.created_at,
    active: req.status === "pending",
  };
}
