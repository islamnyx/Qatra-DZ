import { haversineKm } from "./geo.js";

export const GEO_LOW_ACCURACY_M = 500;
export const GEO_MAX_JUMP_KM = 12;
export const GEO_MAX_JUMP_KM_LOW_ACCURACY = 2.5;

/** Reject WiFi/IP fixes that teleport far from the last trusted position. */
export function isSuspiciousGeoJump(prevCoords, nextCoords, accuracyM) {
  if (!prevCoords || !nextCoords) return false;
  const jumpKm = haversineKm(prevCoords[0], prevCoords[1], nextCoords[0], nextCoords[1]);
  if (jumpKm > GEO_MAX_JUMP_KM) return true;
  if (accuracyM != null && accuracyM > GEO_LOW_ACCURACY_M && jumpKm > GEO_MAX_JUMP_KM_LOW_ACCURACY) {
    return true;
  }
  return false;
}
