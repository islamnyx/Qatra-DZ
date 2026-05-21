import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirestoreDb } from "../init.js";
import { COLLECTIONS } from "../collections.js";
import {
  buildInventoryUnit,
  validateInventoryUnit,
  validateBloodRequest,
  REQUEST_STATUS,
  URGENCY_LEVEL,
} from "@shared/hospital-db/index.js";
import {
  mapInventoryDoc,
  mapBloodRequestDoc,
  aggregateInventoryByHospital,
  mapBloodRequestToSos,
} from "@shared/hospital-db/mappers.js";

function dbOrThrow() {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firebase is not configured. Set VITE_FIREBASE_* in .env.local");
  return db;
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Blood inventory ─────────────────────────────────────────────────────────

export async function listBloodInventory(filters = {}) {
  const db = dbOrThrow();
  const col = collection(db, COLLECTIONS.BLOOD_INVENTORY);
  const constraints = [];
  if (filters.hospital_id) constraints.push(where("hospital_id", "==", filters.hospital_id));
  if (filters.status) constraints.push(where("status", "==", filters.status));
  if (filters.blood_type) constraints.push(where("blood_type", "==", filters.blood_type));
  constraints.push(orderBy("expiration_date", "asc"));
  const snap = await getDocs(constraints.length ? query(col, ...constraints) : col);
  return snap.docs.map((d) => mapInventoryDoc(d.id, d.data()));
}

export async function getBloodUnit(unitId) {
  const db = dbOrThrow();
  const ref = doc(db, COLLECTIONS.BLOOD_INVENTORY, unitId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapInventoryDoc(snap.id, snap.data());
}

export async function createBloodUnit(input) {
  const unit_id = input.unit_id || newId("UNIT");
  const built = buildInventoryUnit({ ...input, unit_id });
  const errors = validateInventoryUnit(built);
  if (errors.length) throw new Error(errors.join("; "));
  const db = dbOrThrow();
  await setDoc(doc(db, COLLECTIONS.BLOOD_INVENTORY, unit_id), built);
  return mapInventoryDoc(unit_id, built);
}

export async function updateBloodUnit(unitId, patch) {
  const errors = validateInventoryUnit(patch, { partial: true });
  if (errors.length) throw new Error(errors.join("; "));
  const db = dbOrThrow();
  const ref = doc(db, COLLECTIONS.BLOOD_INVENTORY, unitId);
  const payload = { ...patch, updated_at: new Date().toISOString() };
  await updateDoc(ref, payload);
  const snap = await getDoc(ref);
  return mapInventoryDoc(snap.id, snap.data());
}

export async function deleteBloodUnit(unitId) {
  const db = dbOrThrow();
  await deleteDoc(doc(db, COLLECTIONS.BLOOD_INVENTORY, unitId));
}

// ─── Blood requests (SOS) ───────────────────────────────────────────────────

export async function listBloodRequests(filters = {}) {
  const db = dbOrThrow();
  const col = collection(db, COLLECTIONS.BLOOD_REQUESTS);
  const constraints = [orderBy("created_at", "desc")];
  if (filters.hospital_id) constraints.unshift(where("hospital_id", "==", filters.hospital_id));
  if (filters.status) constraints.unshift(where("status", "==", filters.status));
  const snap = await getDocs(query(col, ...constraints));
  return snap.docs.map((d) => mapBloodRequestDoc(d.id, d.data()));
}

export async function listActiveSosForDonors() {
  const rows = await listBloodRequests({ status: REQUEST_STATUS.PENDING });
  return rows.map(mapBloodRequestToSos).filter((s) => s.active);
}

export async function createBloodRequest(input) {
  const request_id = input.request_id || newId("REQ");
  const now = new Date().toISOString();
  const docData = {
    hospital_id: input.hospital_id,
    hospital_name: input.hospital_name ?? "",
    wilaya: input.wilaya ?? "",
    required_blood_type: input.required_blood_type,
    required_component: input.required_component,
    quantity_needed: input.quantity_needed,
    urgency_level: input.urgency_level ?? URGENCY_LEVEL.MEDIUM,
    status: input.status ?? REQUEST_STATUS.PENDING,
    created_at: now,
    updated_at: now,
  };
  const errors = validateBloodRequest({ ...docData, request_id });
  if (errors.length) throw new Error(errors.join("; "));
  const db = dbOrThrow();
  await setDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, request_id), docData);
  return mapBloodRequestDoc(request_id, docData);
}

export async function updateBloodRequest(requestId, patch) {
  const errors = validateBloodRequest(patch, { partial: true });
  if (errors.length) throw new Error(errors.join("; "));
  const db = dbOrThrow();
  const ref = doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId);
  await updateDoc(ref, { ...patch, updated_at: new Date().toISOString() });
  const snap = await getDoc(ref);
  return mapBloodRequestDoc(snap.id, snap.data());
}

// ─── Pre-screening ──────────────────────────────────────────────────────────

export async function getPreScreening(donorHash) {
  const db = dbOrThrow();
  const snap = await getDoc(doc(db, COLLECTIONS.PRE_SCREENING, donorHash));
  if (!snap.exists()) return null;
  return { donor_hash: snap.id, ...snap.data() };
}

export async function submitPreScreening(donorHash, encryptedPayload) {
  const db = dbOrThrow();
  const ref = doc(db, COLLECTIONS.PRE_SCREENING, donorHash);
  const data = {
    encrypted_medical_answers: encryptedPayload.encrypted_medical_answers,
    encryption_version: encryptedPayload.encryption_version ?? 1,
    submitted_at: new Date().toISOString(),
  };
  await setDoc(ref, data);
  return { donor_hash: donorHash, ...data };
}

// ─── Hospital summaries (aggregated for BloodSync) ───────────────────────────

export async function getHospitalsFromInventory() {
  const units = await listBloodInventory();
  return aggregateInventoryByHospital(units);
}

export async function getExpiringUnits(hours = 72) {
  const units = await listBloodInventory({ status: "available" });
  const cutoff = Date.now() + hours * 3600000;
  return units
    .filter((u) => new Date(`${u.expiration_date}T23:59:59Z`).getTime() <= cutoff)
    .map((u) => ({
      hospital: u.hospital_name,
      type: u.blood_type,
      component: u.component_type,
      unitId: u.unit_id,
      hoursRemaining: Math.max(
        0,
        Math.floor(
          (new Date(`${u.expiration_date}T23:59:59Z`).getTime() - Date.now()) / 3600000
        )
      ),
    }));
}

export async function getInventoryKpis() {
  const units = await listBloodInventory();
  const available = units.filter((u) => u.status === "available");
  const weekEnd = Date.now() + 7 * 24 * 3600000;
  const expiringThisWeek = available.filter(
    (u) => new Date(`${u.expiration_date}T12:00:00Z`).getTime() <= weekEnd
  ).length;
  const pending = await listBloodRequests({ status: REQUEST_STATUS.PENDING });
  const shortages = pending.filter((r) => r.urgency_level === URGENCY_LEVEL.CRITICAL).length;
  return {
    totalUnits: available.length,
    expiringThisWeek,
    activeShortages: shortages,
    transfersToday: 0,
  };
}
