import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb, getFirebaseApp } from "../services/firebase/init.js";
import * as fb from "../services/firebase/hospitalDb.js";
import { decryptMedicalAnswers } from "@shared/hospital-db/encryption.js";

function requireFirebase() {
  if (!getFirebaseApp()) {
    throw new Error("Firebase not configured. Copy VITE_FIREBASE_* to bloodsync/.env.local");
  }
}

export const firebaseHospitalApi = {
  listBloodInventory: fb.listBloodInventory,
  getBloodUnit: fb.getBloodUnit,
  createBloodUnit: fb.createBloodUnit,
  updateBloodUnit: fb.updateBloodUnit,
  deleteBloodUnit: fb.deleteBloodUnit,
  listBloodRequests: fb.listBloodRequests,
  createBloodRequest: fb.createBloodRequest,
  updateBloodRequest: fb.updateBloodRequest,
  getPreScreening: fb.getPreScreening,

  async getPreScreeningDecrypted(donorHash, secret) {
    const rec = await fb.getPreScreening(donorHash);
    if (!rec) return null;
    const answers = await decryptMedicalAnswers(rec.encrypted_medical_answers, secret);
    return { donor_hash: donorHash, answers, submitted_at: rec.submitted_at };
  },

  async getHospitalsFromInventory() {
    return fb.getHospitalsFromInventory();
  },
  async getHospitals() {
    return fb.getHospitalsFromInventory();
  },
  async getInventoryKpis() {
    return fb.getInventoryKpis();
  },
  async getNationalKpis() {
    return fb.getInventoryKpis();
  },
  async getExpiring(hours) {
    return fb.getExpiringUnits(hours);
  },

  async getRecommendations() {
    return [];
  },
  async getShortages() {
    const pending = await fb.listBloodRequests({ status: "pending" });
    return pending.map((r) => ({
      hospital: r.hospital_name,
      type: r.required_blood_type,
      component: r.required_component,
      severity: r.urgency_level === "CRITICAL" ? "critical" : "medium",
    }));
  },
  async getTransfers() {
    return [];
  },
  async patchTransfer() {
    return null;
  },
  async getNotifications() {
    return [];
  },
  async getSeasonalFactors() {
    return [];
  },
  async getForecast() {
    return { days: [], context: "Connect forecast service" };
  },
  async broadcastAlert() {
    return { ok: true, message: "Broadcast via Firebase (configure FCM)" };
  },
  async createDrive(drive) {
    return { ok: true, drive: { ...drive, id: "md-" + Date.now() } };
  },
  async requestTransfer(payload) {
    return { ok: true, transfer: { id: "T-" + Date.now(), ...payload, status: "Pending" } };
  },

  async login(email, password, panelRole) {
    requireFirebase();
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const db = getFirestoreDb();
    const profile = await getDoc(doc(db, "users", cred.user.uid));
    const data = profile.data() || {};
    if (data.role !== "hospital_staff") {
      await signOut(auth);
      throw new Error("Account is not authorized for hospital control panel");
    }
    return {
      token: await cred.user.getIdToken(),
      user: {
        email: cred.user.email,
        name: data.display_name || email,
        role: panelRole || data.panel_role || "manager",
        hospital_id: data.hospital_id || "h1",
        uid: cred.user.uid,
      },
    };
  },

  async logout() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  },
};
