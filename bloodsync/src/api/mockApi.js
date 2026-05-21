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

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async login(email, _password, role) {
    await delay();
    return {
      token: "mock-jwt-" + Date.now(),
      user: {
        email,
        name: role === "admin" ? "Dr. Benali" : role === "cra" ? "CRA Ops" : "Manager CHU",
        role,
      },
    };
  },

  async getHospitals() {
    await delay();
    return hospitals;
  },

  async getHospital(id) {
    await delay();
    return hospitals.find((h) => h.id === id);
  },

  async getRecommendations() {
    await delay();
    return recommendations;
  },

  async getForecast(hospitalId) {
    await delay();
    return {
      days: forecastForHospital(hospitalId),
      context: "Ramadan active — surgical demand -20%",
    };
  },

  async getShortages() {
    await delay();
    return shortages;
  },

  async getExpiring(hours = 72) {
    await delay();
    return expiringUnits.filter((e) => e.hoursRemaining <= hours);
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
    await delay();
    return nationalKpis;
  },

  async getNotifications() {
    await delay();
    return notifications;
  },

  async getSeasonalFactors() {
    await delay();
    return seasonalFactors;
  },

  async broadcastAlert() {
    await delay(400);
    return { ok: true, message: "Donor alert broadcast (simulated)" };
  },
};
