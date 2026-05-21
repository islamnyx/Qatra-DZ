import { getApiBase, DEMO_DONOR_ID } from "../config/env.js";

const API_BASE = getApiBase();
export { DEMO_DONOR_ID };

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || res.statusText);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }

  return data;
}

export const api = {
  health: () => request("/health"),
  getDonor: (id = DEMO_DONOR_ID) => request(`/donors/${id}`),
  getPassport: (id = DEMO_DONOR_ID) => request(`/donors/${id}/passport`),
  getFamily: (id = DEMO_DONOR_ID) => request(`/donors/${id}/family`),
  setFamilyCircle: (active, id = DEMO_DONOR_ID) =>
    request(`/donors/${id}/family/circle`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
  demoFamilyAlert: (id = DEMO_DONOR_ID) =>
    request(`/donors/${id}/family/demo-alert`, { method: "POST" }),
  getUrgentSos: (donorId = DEMO_DONOR_ID) =>
    request(`/sos/urgent?donorId=${donorId}`),
  respondToSos: (sosId, { donorId = DEMO_DONOR_ID, eta }) =>
    request(`/sos/${sosId}/respond`, {
      method: "POST",
      body: JSON.stringify({ donorId, eta }),
    }),
  getWilayas: () => request("/wilayas"),
  getFeed: (donorId = DEMO_DONOR_ID) =>
    request(`/feed?donorId=${donorId}`),
  registerCampaign: (feedId, donorId = DEMO_DONOR_ID) =>
    request(`/feed/campaign/${feedId}/interest`, {
      method: "POST",
      body: JSON.stringify({ donorId }),
    }),
  sendChat: (message, lang, donorId = DEMO_DONOR_ID) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, lang, donorId }),
    }),
  getChatPrompts: (lang) => request(`/chat/prompts?lang=${lang}`),

  // BloodSync — 12 core features
  checkEligibility: (body) =>
    request("/blood/eligibility/check", { method: "POST", body: JSON.stringify(body) }),
  getCenters: (wilaya) => request(`/blood/centers?wilaya=${encodeURIComponent(wilaya)}`),
  getMilestones: (donorId = DEMO_DONOR_ID) => request(`/blood/milestones/${donorId}`),
  getNextDonation: (lastDonation) =>
    request(`/blood/next-donation?lastDonation=${encodeURIComponent(lastDonation)}`),
  scheduleReminder: (lastDonation, donorId = DEMO_DONOR_ID) =>
    request("/blood/reminders", {
      method: "POST",
      body: JSON.stringify({ lastDonation, donorId }),
    }),
  getBloodInventory: (wilaya, bloodType) => {
    const q = new URLSearchParams({ wilaya });
    if (bloodType) q.set("bloodType", bloodType);
    return request(`/blood/inventory?${q}`);
  },
  getNearbyInventory: (wilaya, bloodType) =>
    request(
      `/blood/inventory/nearby?wilaya=${encodeURIComponent(wilaya)}&bloodType=${encodeURIComponent(bloodType)}`
    ),
  getExpiringUnits: (wilaya, days = 7) =>
    request(`/blood/expiring?wilaya=${encodeURIComponent(wilaya)}&days=${days}`),
  activateEmergency: (location, emergencyType = "shortage") =>
    request("/blood/emergency", {
      method: "POST",
      body: JSON.stringify({ location, emergencyType }),
    }),
  coordinateTransfer: (bloodType, fromWilaya, toWilaya) =>
    request("/blood/transfer", {
      method: "POST",
      body: JSON.stringify({ bloodType, fromWilaya, toWilaya }),
    }),
  contactRareDonors: (bloodType) =>
    request("/blood/rare-donors", { method: "POST", body: JSON.stringify({ bloodType }) }),
  getPrescreeningForm: () => request("/blood/prescreening"),
  submitPrescreening: (answers) =>
    request("/blood/prescreening", { method: "POST", body: JSON.stringify({ answers }) }),
  getBloodLeaderboard: (region = "national") =>
    request(`/blood/leaderboard?region=${encodeURIComponent(region)}`),
};
