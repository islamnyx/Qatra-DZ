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
};
