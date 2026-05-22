import { getDb } from "../db/database.js";
import { mapCenterRow, mapDriveRow, mapEmergencyRow } from "../utils/mapMapper.js";

const R = 6371;

function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withDistance(items, lat, lng) {
  if (lat == null || lng == null) return items;
  return [...items]
    .map((item) => ({
      ...item,
      distanceKm: haversineKm(lat, lng, item.lat, item.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Aggregated donor map payload — centers, mobile drives, active SOS with coordinates. */
export function getDonorMapPayload(lat, lng) {
  const db = getDb();

  const centerRows = db
    .prepare(
      `SELECT * FROM donation_centers
       WHERE lat IS NOT NULL AND lng IS NOT NULL
       ORDER BY wilaya ASC, name ASC`
    )
    .all();

  const driveRows = db
    .prepare(
      `SELECT * FROM mobile_drives
       WHERE active = 1 AND datetime(end_at) >= datetime('now')
       ORDER BY start_at ASC`
    )
    .all();

  const sosRows = db
    .prepare(
      `SELECT * FROM sos_requests
       WHERE active = 1 AND lat IS NOT NULL AND lng IS NOT NULL
       ORDER BY
         CASE urgency WHEN 'critical' THEN 0 ELSE 1 END,
         posted_at DESC
       LIMIT 20`
    )
    .all();

  const centers = withDistance(
    centerRows.map(mapCenterRow).filter((c) => c.lat != null && c.lng != null),
    lat,
    lng
  );

  const drives = withDistance(driveRows.map(mapDriveRow), lat, lng);

  const emergencies = withDistance(sosRows.map(mapEmergencyRow), lat, lng);

  return {
    centers,
    drives,
    emergencies,
    meta: {
      centerCount: centers.length,
      driveCount: drives.length,
      emergencyCount: emergencies.length,
      sortedByDistance: lat != null && lng != null,
    },
  };
}
