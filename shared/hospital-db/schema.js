/**
 * Qatra-DZ — Hospital control panel Firestore schemas (single source of truth).
 * Collections: blood_inventory, blood_requests, pre_screening
 */

export const COLLECTIONS = {
  USERS: "users",
  BLOOD_INVENTORY: "blood_inventory",
  BLOOD_REQUESTS: "blood_requests",
  PRE_SCREENING: "pre_screening",
  HOSPITALS: "hospitals",
};

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const COMPONENT_TYPES = {
  RBC: "RBC",
  PLATELETS: "Platelets",
};

export const INVENTORY_STATUS = {
  AVAILABLE: "available",
  EXPIRED: "expired",
  RESERVED: "reserved",
};

export const REQUEST_STATUS = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
};

export const URGENCY_LEVEL = {
  CRITICAL: "CRITICAL",
  MEDIUM: "MEDIUM",
};

export const USER_ROLES = {
  DONOR: "donor",
  HOSPITAL_STAFF: "hospital_staff",
};

/** Shelf life in days by component (backend computes expiration_date). */
export const SHELF_LIFE_DAYS = {
  [COMPONENT_TYPES.RBC]: 42,
  [COMPONENT_TYPES.PLATELETS]: 5,
};

export function isValidBloodType(type) {
  return BLOOD_TYPES.includes(type);
}

export function isValidComponentType(component) {
  return component === COMPONENT_TYPES.RBC || component === COMPONENT_TYPES.PLATELETS;
}

export function isValidInventoryStatus(status) {
  return Object.values(INVENTORY_STATUS).includes(status);
}

export function isValidRequestStatus(status) {
  return Object.values(REQUEST_STATUS).includes(status);
}

export function isValidUrgencyLevel(level) {
  return level === URGENCY_LEVEL.CRITICAL || level === URGENCY_LEVEL.MEDIUM;
}

/**
 * @typedef {Object} BloodInventoryUnit
 * @property {string} unit_id
 * @property {string} hospital_id
 * @property {string} blood_type
 * @property {'RBC'|'Platelets'} component_type
 * @property {string} donation_date — ISO date YYYY-MM-DD
 * @property {string} expiration_date — ISO date (computed)
 * @property {'available'|'expired'|'reserved'} status
 * @property {string} [hospital_name]
 * @property {string} [wilaya]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} BloodRequest
 * @property {string} request_id
 * @property {string} hospital_id
 * @property {string} required_blood_type
 * @property {'RBC'|'Platelets'} required_component
 * @property {number} quantity_needed
 * @property {'CRITICAL'|'MEDIUM'} urgency_level
 * @property {'pending'|'fulfilled'} status
 * @property {string} [hospital_name]
 * @property {string} [wilaya]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} PreScreeningRecord
 * @property {string} donor_hash — document id (Firebase Auth UID)
 * @property {string} encrypted_medical_answers — AES-GCM ciphertext (base64)
 * @property {number} [encryption_version]
 * @property {string} [submitted_at]
 */

export function validateInventoryUnit(data, { partial = false } = {}) {
  const errors = [];
  if (!partial && !data.unit_id) errors.push("unit_id is required");
  if (!partial && !data.hospital_id) errors.push("hospital_id is required");
  if (data.blood_type != null && !isValidBloodType(data.blood_type)) errors.push("invalid blood_type");
  if (data.component_type != null && !isValidComponentType(data.component_type)) errors.push("invalid component_type");
  if (data.status != null && !isValidInventoryStatus(data.status)) errors.push("invalid status");
  if (data.donation_date != null && !/^\d{4}-\d{2}-\d{2}$/.test(data.donation_date)) {
    errors.push("donation_date must be YYYY-MM-DD");
  }
  return errors;
}

export function validateBloodRequest(data, { partial = false } = {}) {
  const errors = [];
  if (!partial && !data.request_id) errors.push("request_id is required");
  if (!partial && !data.hospital_id) errors.push("hospital_id is required");
  if (data.required_blood_type != null && !isValidBloodType(data.required_blood_type)) {
    errors.push("invalid required_blood_type");
  }
  if (data.required_component != null && !isValidComponentType(data.required_component)) {
    errors.push("invalid required_component");
  }
  if (data.quantity_needed != null && (typeof data.quantity_needed !== "number" || data.quantity_needed < 1)) {
    errors.push("quantity_needed must be >= 1");
  }
  if (data.urgency_level != null && !isValidUrgencyLevel(data.urgency_level)) {
    errors.push("invalid urgency_level");
  }
  if (data.status != null && !isValidRequestStatus(data.status)) {
    errors.push("invalid status");
  }
  return errors;
}

export function validatePreScreening(data) {
  const errors = [];
  if (!data.donor_hash) errors.push("donor_hash is required");
  if (!data.encrypted_medical_answers || typeof data.encrypted_medical_answers !== "string") {
    errors.push("encrypted_medical_answers is required");
  }
  if (data.encrypted_medical_answers && data.encrypted_medical_answers.length < 16) {
    errors.push("encrypted_medical_answers too short");
  }
  return errors;
}
