import {
  COMPONENT_TYPES,
  INVENTORY_STATUS,
  SHELF_LIFE_DAYS,
} from "./schema.js";

/**
 * Compute expiration_date from donation_date + component shelf life.
 * RBC: +42 days | Platelets: +5 days
 */
export function computeExpirationDate(donationDate, componentType) {
  const days = SHELF_LIFE_DAYS[componentType];
  if (!days) throw new Error(`Unknown component_type: ${componentType}`);
  const base = new Date(`${donationDate}T12:00:00.000Z`);
  if (Number.isNaN(base.getTime())) throw new Error(`Invalid donation_date: ${donationDate}`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/**
 * Derive inventory status from expiration_date and optional reservation.
 */
export function deriveInventoryStatus(expirationDate, explicitStatus, now = new Date()) {
  if (explicitStatus === INVENTORY_STATUS.RESERVED) return INVENTORY_STATUS.RESERVED;
  const exp = new Date(`${expirationDate}T23:59:59.999Z`);
  if (exp.getTime() < now.getTime()) return INVENTORY_STATUS.EXPIRED;
  return INVENTORY_STATUS.AVAILABLE;
}

export function buildInventoryUnit(input) {
  const {
    unit_id,
    hospital_id,
    blood_type,
    component_type = COMPONENT_TYPES.RBC,
    donation_date,
    status: explicitStatus,
    hospital_name,
    wilaya,
  } = input;

  const expiration_date = computeExpirationDate(donation_date, component_type);
  const status = deriveInventoryStatus(expiration_date, explicitStatus);
  const now = new Date().toISOString();

  return {
    unit_id,
    hospital_id,
    blood_type,
    component_type,
    donation_date,
    expiration_date,
    status,
    hospital_name: hospital_name ?? null,
    wilaya: wilaya ?? null,
    created_at: input.created_at ?? now,
    updated_at: now,
  };
}

export function daysUntilExpiration(expirationDate, now = new Date()) {
  const exp = new Date(`${expirationDate}T12:00:00.000Z`);
  const diff = exp.getTime() - now.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function isExpiringSoon(expirationDate, withinDays = 3) {
  const left = daysUntilExpiration(expirationDate);
  return left >= 0 && left <= withinDays;
}
