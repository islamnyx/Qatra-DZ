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

export function formatDistance(km, lang = "ar") {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return lang === "fr" ? `${m} m` : `${m} م`;
  }
  const v = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return lang === "fr" ? `${v} km` : `${v} كم`;
}

/** Rough walk (km/h=5) and drive (km/h=25) estimates */
export function estimateTravel(km) {
  const walkMin = Math.max(1, Math.round((km / 5) * 60));
  const driveMin = Math.max(1, Math.round((km / 25) * 60));
  return { walkMin, driveMin };
}

export function sortByDistance(items, lat, lng, getCoords = (x) => x) {
  return [...items]
    .map((item) => {
      const c = getCoords(item);
      const distanceKm = haversineKm(lat, lng, c.lat, c.lng);
      return { ...item, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function navigationUrl(lat, lng, label) {
  const q = encodeURIComponent(label ?? "CRA");
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${q}`;
}
