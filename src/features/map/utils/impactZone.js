/** Feature 2.7 — donor impact zone (motivational, not medical/GIS data). */

/** One whole-blood donation can help up to 3 patients (aligned with Home stats). */
export const LIVES_PER_DONATION = 3;

export const IMPACT_BASE_RADIUS_M = 2000;
export const IMPACT_RADIUS_PER_DONATION_M = 350;
export const IMPACT_MAX_RADIUS_M = 6500;
export const IMPACT_SEED_RADIUS_M = 1800;

/** @deprecated Use getImpactRadiusM(totalDonations) — kept for imports that expect a constant. */
export const IMPACT_ZONE_RADIUS_M = IMPACT_BASE_RADIUS_M + 2 * IMPACT_RADIUS_PER_DONATION_M;

export const IMPACT_ZONE_RADIUS_KM = IMPACT_ZONE_RADIUS_M / 1000;

/** GPS uncertainty ring — only when browser reports accuracy (meters). */
export function clampGpsAccuracyM(accuracy) {
  if (accuracy == null || accuracy <= 0 || !Number.isFinite(accuracy)) return null;
  return Math.min(Math.max(accuracy, 25), 800);
}

/**
 * Impact circle radius grows with each recorded donation.
 * @param {number} totalDonations
 * @returns {number} radius in meters
 */
export function getImpactRadiusM(totalDonations = 0) {
  const n = Math.max(0, Math.floor(Number(totalDonations) || 0));
  if (n === 0) return IMPACT_SEED_RADIUS_M;
  return Math.min(
    IMPACT_MAX_RADIUS_M,
    IMPACT_BASE_RADIUS_M + n * IMPACT_RADIUS_PER_DONATION_M
  );
}

export function getImpactRadiusKm(totalDonations = 0) {
  const m = getImpactRadiusM(totalDonations);
  const km = m / 1000;
  return km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
}

/** Direct lives touched from donation history (symbolic clinical average). */
export function countLivesSaved(totalDonations = 0) {
  const n = Math.max(0, Math.floor(Number(totalDonations) || 0));
  return n * LIVES_PER_DONATION;
}

/**
 * People symbolically within the impact circle (urban density estimate).
 * Grows with area AND slightly boosted by donor history for motivation.
 */
export function estimateSymbolicReach(radiusM, totalDonations = 0) {
  const areaKm2 = Math.PI * (radiusM / 1000) ** 2;
  const symbolicDensityPerKm2 = 3500;
  const historyBoost = Math.max(0, Math.floor(Number(totalDonations) || 0)) * 120;
  const raw = areaKm2 * symbolicDensityPerKm2 + historyBoost;
  return Math.max(500, Math.round(raw / 500) * 500);
}

export function formatSymbolicReach(count, lang = "ar") {
  if (lang === "fr") {
    if (count >= 1000) return `~${Math.round(count / 1000)}k`;
    return `~${count}`;
  }
  if (count >= 1000) return `~${Math.round(count / 1000)} ألف`;
  return `~${count}`;
}

export function formatLivesCount(count, lang = "ar") {
  if (lang === "fr") return String(count);
  return String(count);
}

/** CSS tier for pulse intensity — feature 2.7 map ring */
export function getImpactTier(totalDonations = 0) {
  const n = Math.max(0, Math.floor(Number(totalDonations) || 0));
  if (n === 0) return "seed";
  if (n <= 3) return "growing";
  if (n <= 9) return "hero";
  return "legend";
}

/** Meters until the next donation widens the circle (null if at cap). */
export function metersToNextExpansion(totalDonations = 0) {
  const n = Math.max(0, Math.floor(Number(totalDonations) || 0));
  const current = getImpactRadiusM(n);
  const atCap = current >= IMPACT_MAX_RADIUS_M;
  if (atCap) return null;
  const next = getImpactRadiusM(n + 1);
  return Math.max(0, next - current);
}

export function buildImpactSnapshot(totalDonations = 0, lang = "ar") {
  const donations = Math.max(0, Math.floor(Number(totalDonations) || 0));
  const radiusM = getImpactRadiusM(donations);
  const radiusKm = getImpactRadiusKm(donations);
  const livesSaved = countLivesSaved(donations);
  const reach = estimateSymbolicReach(radiusM, donations);
  const tier = getImpactTier(donations);
  const expandM = metersToNextExpansion(donations);

  return {
    donations,
    radiusM,
    radiusKm,
    livesSaved,
    reach,
    reachLabel: formatSymbolicReach(reach, lang),
    livesLabel: formatLivesCount(livesSaved, lang),
    tier,
    expandM,
    atMaxRadius: expandM === null && donations > 0,
  };
}
