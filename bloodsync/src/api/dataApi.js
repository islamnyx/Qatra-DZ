/**
 * Unified BloodSync data layer: Qatra API first, mock fallback.
 */
import { qatraApi } from "./qatraApi.js";
import { mockApi } from "./mockApi.js";

async function withFallback(apiFn, mockFn) {
  try {
    return await apiFn();
  } catch (err) {
    console.warn("[BloodSync] API fallback:", err.message);
    return mockFn();
  }
}

export const dataApi = {
  ...mockApi,

  getRecommendations: () => withFallback(qatraApi.getRecommendations, mockApi.getRecommendations),
  getShortages: () => withFallback(qatraApi.getShortages, mockApi.getShortages),
  getExpiring: (hours) => withFallback(() => qatraApi.getExpiring(hours), () => mockApi.getExpiring(hours)),
  getForecast: (id) =>
    withFallback(
      () => qatraApi.getForecast(id),
      () => mockApi.getForecast(id)
    ),
  getSeasonalFactors: () => withFallback(qatraApi.getSeasonalFactors, mockApi.getSeasonalFactors),
  broadcastAlert: (payload) => withFallback(() => qatraApi.broadcastAlert(payload), () => mockApi.broadcastAlert(payload)),

  health: () => qatraApi.health(),
  coordinateTransfer: (bloodType, fromWilaya, toWilaya) =>
    withFallback(() => qatraApi.coordinateTransfer(bloodType, fromWilaya, toWilaya), async () => ({
      ok: true,
      message: `Transfer ${bloodType} ${fromWilaya} → ${toWilaya} (offline)`,
    })),

  async approveRecommendation(rec) {
    try {
      return await qatraApi.approveRecommendation(rec.id, {
        bloodType: rec.bloodType,
        fromWilaya: rec.fromWilaya,
        toWilaya: rec.toWilaya,
        units: rec.units,
      });
    } catch {
      return { ok: true, message: "Approved (offline)" };
    }
  },
};
