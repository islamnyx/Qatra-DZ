const R = 6371;

export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDriveMin(km) {
  return Math.max(5, Math.round((km / 35) * 60));
}

/** Ray-casting point-in-polygon */
export function pointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  const [y, x] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function countDonorsInPolygon(zones, polygon) {
  if (!polygon?.length) return 0;
  return zones.reduce((sum, z) => {
    if (pointInPolygon(z.center, polygon)) return sum + z.eligibleCount;
    return sum;
  }, 0);
}

export function donorsInRadius(zones, center, radiusKm) {
  if (!center) return 0;
  const [lat, lng] = center;
  return zones.reduce((sum, z) => {
    const d = haversineKm(lat, lng, z.center[0], z.center[1]);
    if (d <= radiusKm) return sum + Math.round(z.eligibleCount * (1 - d / (radiusKm + 0.1)));
    return sum;
  }, 0);
}
