import {
  buildInventoryUnit,
  REQUEST_STATUS,
  URGENCY_LEVEL,
  COMPONENT_TYPES,
} from "@shared/hospital-db/index.js";
import {
  aggregateInventoryByHospital,
  mapBloodRequestToSos,
} from "@shared/hospital-db/mappers.js";
import { hospitals as mockHospitals } from "./data.js";

function seedInventoryFromMock() {
  const units = [];
  let n = 0;
  for (const h of mockHospitals) {
    for (const s of h.stock) {
      const count = Math.min(s.units, 8);
      for (let i = 0; i < count; i++) {
        n += 1;
        const donation = new Date();
        donation.setDate(donation.getDate() - (i % 10));
        const donation_date = donation.toISOString().slice(0, 10);
        units.push(
          buildInventoryUnit({
            unit_id: `UNIT-${h.id}-${s.type}-${i}`,
            hospital_id: h.id,
            hospital_name: h.name,
            wilaya: h.wilaya,
            blood_type: s.type,
            component_type: i % 3 === 0 ? COMPONENT_TYPES.PLATELETS : COMPONENT_TYPES.RBC,
            donation_date,
            status: s.fillRatio < 0.2 && i === 0 ? "reserved" : "available",
          })
        );
      }
    }
  }
  return units;
}

const inventory = seedInventoryFromMock();

const requests = [
  {
    request_id: "REQ-h1-001",
    hospital_id: "h1",
    hospital_name: "CHU Mustapha Pacha",
    wilaya: "Alger",
    required_blood_type: "O-",
    required_component: COMPONENT_TYPES.RBC,
    quantity_needed: 4,
    urgency_level: URGENCY_LEVEL.CRITICAL,
    status: REQUEST_STATUS.PENDING,
    created_at: "2026-05-21T10:00:00.000Z",
    updated_at: "2026-05-21T10:00:00.000Z",
  },
  {
    request_id: "REQ-h3-002",
    hospital_id: "h3",
    hospital_name: "CHU Constantine",
    wilaya: "Constantine",
    required_blood_type: "A+",
    required_component: COMPONENT_TYPES.PLATELETS,
    quantity_needed: 2,
    urgency_level: URGENCY_LEVEL.MEDIUM,
    status: REQUEST_STATUS.PENDING,
    created_at: "2026-05-20T14:30:00.000Z",
    updated_at: "2026-05-20T14:30:00.000Z",
  },
];

const preScreening = new Map();

export function getMockInventory() {
  return [...inventory];
}

export function getMockRequests() {
  return [...requests];
}

export function getMockPreScreening(hash) {
  return preScreening.get(hash) ?? null;
}

export function setMockPreScreening(record) {
  preScreening.set(record.donor_hash, record);
}

export function addMockInventoryUnit(input) {
  const unit = buildInventoryUnit(input);
  inventory.push(unit);
  return unit;
}

export function patchMockInventory(unitId, patch) {
  const i = inventory.findIndex((u) => u.unit_id === unitId);
  if (i < 0) return null;
  inventory[i] = { ...inventory[i], ...patch, updated_at: new Date().toISOString() };
  return inventory[i];
}

export function addMockRequest(input) {
  const now = new Date().toISOString();
  const row = {
    request_id: input.request_id || `REQ-${Date.now()}`,
    ...input,
    created_at: now,
    updated_at: now,
  };
  requests.unshift(row);
  return row;
}

export function patchMockRequest(id, patch) {
  const i = requests.findIndex((r) => r.request_id === id);
  if (i < 0) return null;
  requests[i] = { ...requests[i], ...patch, updated_at: new Date().toISOString() };
  return requests[i];
}

export function mockHospitalsFromInventory() {
  return aggregateInventoryByHospital(getMockInventory());
}

export function mockActiveSos() {
  return getMockRequests()
    .filter((r) => r.status === REQUEST_STATUS.PENDING)
    .map(mapBloodRequestToSos);
}
