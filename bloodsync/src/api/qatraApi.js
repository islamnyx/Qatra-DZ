/**
 * BloodSync panel → Qatra API (localhost:3001 via Vite proxy).
 * Compatible with server/services/nexusOps.js + Desktop AI blood tools.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const qatraApi = {
  health: () => request("/api/health"),

  getRecommendations: () => request("/api/nexus/recommendations"),
  getShortages: () => request("/api/nexus/shortages"),
  getExpiring: (hours = 72) => request(`/api/nexus/expiring?hours=${hours}`),
  getForecast: (hospitalId = "h1") => request(`/api/nexus/forecast?hospitalId=${hospitalId}`),
  getSeasonalFactors: () => request("/api/nexus/seasonal-factors"),

  broadcastAlert: (payload) =>
    request("/api/nexus/broadcast-alert", {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    }),

  approveRecommendation: (id, body) =>
    request(`/api/nexus/recommendations/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  checkInventory: (wilaya, bloodType) => {
    const q = new URLSearchParams({ wilaya });
    if (bloodType) q.set("bloodType", bloodType);
    return request(`/api/blood/inventory?${q}`);
  },

  coordinateTransfer: (bloodType, fromWilaya, toWilaya) =>
    request("/api/blood/transfer", {
      method: "POST",
      body: JSON.stringify({ bloodType, fromWilaya, toWilaya }),
    }),
};
