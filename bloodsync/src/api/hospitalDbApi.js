/**
 * Hospital database API — mock implementation (mirrors Firestore shape).
 */
import {
  buildInventoryUnit,
  validateInventoryUnit,
  validateBloodRequest,
  REQUEST_STATUS,
  URGENCY_LEVEL,
  decryptMedicalAnswers,
} from "@shared/hospital-db/index.js";
import {
  mapInventoryDoc,
  mapBloodRequestDoc,
  aggregateInventoryByHospital,
} from "@shared/hospital-db/mappers.js";
import {
  getMockInventory,
  getMockRequests,
  getMockPreScreening,
  setMockPreScreening,
  addMockInventoryUnit,
  patchMockInventory,
  addMockRequest,
  patchMockRequest,
  mockHospitalsFromInventory,
} from "../mock/hospitalDbStore.js";
import {
  hospitals,
  recommendations,
  shortages,
  expiringUnits,
  transfers,
  notifications,
  seasonalFactors,
  nationalKpis,
  forecastForHospital,
} from "../mock/data.js";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const hospitalDbApi = {
  async listBloodInventory(filters = {}) {
    await delay();
    let rows = getMockInventory();
    if (filters.hospital_id) rows = rows.filter((u) => u.hospital_id === filters.hospital_id);
    if (filters.status) rows = rows.filter((u) => u.status === filters.status);
    if (filters.blood_type) rows = rows.filter((u) => u.blood_type === filters.blood_type);
    return rows.sort((a, b) => a.expiration_date.localeCompare(b.expiration_date));
  },

  async getBloodUnit(unitId) {
    await delay();
    const u = getMockInventory().find((x) => x.unit_id === unitId);
    return u ? mapInventoryDoc(u.unit_id, u) : null;
  },

  async createBloodUnit(input) {
    await delay();
    const built = buildInventoryUnit(input);
    const errors = validateInventoryUnit(built);
    if (errors.length) throw new Error(errors.join("; "));
    return addMockInventoryUnit(built);
  },

  async updateBloodUnit(unitId, patch) {
    await delay();
    return patchMockInventory(unitId, patch);
  },

  async deleteBloodUnit(unitId) {
    await delay();
    const list = getMockInventory();
    const i = list.findIndex((u) => u.unit_id === unitId);
    if (i >= 0) list.splice(i, 1);
  },

  async listBloodRequests(filters = {}) {
    await delay();
    let rows = getMockRequests();
    if (filters.hospital_id) rows = rows.filter((r) => r.hospital_id === filters.hospital_id);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    return rows.map((r) => mapBloodRequestDoc(r.request_id, r));
  },

  async createBloodRequest(input) {
    await delay();
    const errors = validateBloodRequest({
      ...input,
      request_id: input.request_id || "x",
      status: input.status ?? REQUEST_STATUS.PENDING,
    });
    if (errors.length) throw new Error(errors.join("; "));
    return mapBloodRequestDoc(
      input.request_id || `REQ-${Date.now()}`,
      addMockRequest({
        ...input,
        urgency_level: input.urgency_level ?? URGENCY_LEVEL.MEDIUM,
        status: input.status ?? REQUEST_STATUS.PENDING,
      })
    );
  },

  async updateBloodRequest(requestId, patch) {
    await delay();
    const row = patchMockRequest(requestId, patch);
    return row ? mapBloodRequestDoc(row.request_id, row) : null;
  },

  async getPreScreening(donorHash) {
    await delay();
    return getMockPreScreening(donorHash);
  },

  async getPreScreeningDecrypted(donorHash, secret) {
    const rec = await this.getPreScreening(donorHash);
    if (!rec) return null;
    const answers = await decryptMedicalAnswers(rec.encrypted_medical_answers, secret);
    return { donor_hash: donorHash, answers, submitted_at: rec.submitted_at };
  },

  async seedDemoPreScreening(donorHash, secret, answers) {
    const { encryptMedicalAnswers } = await import("@shared/hospital-db/encryption.js");
    const enc = await encryptMedicalAnswers(answers, secret);
    const record = {
      donor_hash: donorHash,
      ...enc,
      submitted_at: new Date().toISOString(),
    };
    setMockPreScreening(record);
    return record;
  },

  async getHospitalsFromInventory() {
    await delay();
    const aggregated = mockHospitalsFromInventory();
    return aggregated.length ? aggregated : hospitals;
  },

  async getInventoryKpis() {
    await delay();
    const units = getMockInventory().filter((u) => u.status === "available");
    return {
      ...nationalKpis,
      totalUnits: units.length,
      activeShortages: getMockRequests().filter(
        (r) => r.status === REQUEST_STATUS.PENDING && r.urgency_level === URGENCY_LEVEL.CRITICAL
      ).length,
    };
  },

  async getExpiring(hours = 72) {
    await delay();
    const cutoff = Date.now() + hours * 3600000;
    return getMockInventory()
      .filter((u) => u.status === "available")
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
      }))
      .concat(expiringUnits.filter((e) => e.hoursRemaining <= hours));
  },

  // Legacy mock helpers used by dashboard / nexus / transfers
  async getHospitals() {
    return this.getHospitalsFromInventory();
  },
  async getRecommendations() {
    await delay();
    return recommendations;
  },
  async getShortages() {
    await delay();
    return shortages;
  },
  async getTransfers() {
    await delay();
    return transfers;
  },
  async patchTransfer(id, status) {
    await delay();
    const t = transfers.find((x) => x.id === id);
    if (t) t.status = status;
    return t;
  },
  async getNationalKpis() {
    return this.getInventoryKpis();
  },
  async getNotifications() {
    await delay();
    return notifications;
  },
  async getSeasonalFactors() {
    await delay();
    return seasonalFactors;
  },
  async getForecast(hospitalId) {
    await delay();
    return { days: forecastForHospital(hospitalId), context: "Ramadan active — surgical demand -20%" };
  },
  async broadcastAlert(payload = {}) {
    await delay(400);
    return { ok: true, message: "Donor alert broadcast (simulated)", reached: payload.estimatedReach ?? 0 };
  },
  async createDrive(drive) {
    await delay(350);
    return { ok: true, drive: { ...drive, id: "md-new-" + Date.now() } };
  },
  async requestTransfer(payload) {
    await delay(300);
    const from = hospitals.find((h) => h.id === payload.fromHospitalId);
    const to = hospitals.find((h) => h.id === payload.toHospitalId);
    return {
      ok: true,
      transfer: {
        id: "T-" + Date.now(),
        from: from?.name,
        to: to?.name,
        type: payload.bloodType,
        units: payload.units,
        status: "Pending",
      },
    };
  },

  async login(email, _password, role) {
    await delay();
    return {
      token: "mock-jwt-" + Date.now(),
      user: {
        email,
        name: role === "admin" ? "Dr. Benali" : role === "cra" ? "CRA Ops" : "Manager CHU",
        role,
        hospital_id: "h1",
      },
    };
  },
};
