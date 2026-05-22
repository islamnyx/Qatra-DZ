import { haversineKm } from "./geo.js";

const OSRM_BASE = "https://router.project-osrm.org/route/v1";
const REQUEST_TIMEOUT_MS = 12000;

/** In-memory cache — avoids duplicate OSRM calls when reopening centers / toggling route */
const routeCache = new Map();

function routeCacheKey(from, to) {
  const [a, b] = from;
  return `${a.toFixed(5)},${b.toFixed(5)};${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
}

/**
 * @typedef {Object} DrivingRouteResult
 * @property {[number, number][]} positions Leaflet [lat, lng] along roads
 * @property {number} distanceKm
 * @property {number} durationMin driving time (minutes)
 * @property {'roads' | 'straight'} source
 */

function straightFallback(from, to) {
  const [lat1, lng1] = from;
  const distanceKm = haversineKm(lat1, lng1, to.lat, to.lng);
  const durationMin = Math.max(1, Math.round((distanceKm / 25) * 60));
  return {
    positions: [
      [lat1, lng1],
      [to.lat, to.lng],
    ],
    distanceKm,
    durationMin,
    source: "straight",
  };
}

function parseOsrmRoute(json) {
  const route = json?.routes?.[0];
  const geom = route?.geometry;
  if (!route || geom?.type !== "LineString" || !geom.coordinates?.length) {
    return null;
  }

  const positions = geom.coordinates.map(([lng, lat]) => [lat, lng]);
  const distanceKm = route.distance / 1000;
  const durationMin = Math.max(1, Math.round(route.duration / 60));

  return {
    positions,
    distanceKm,
    durationMin,
    source: "roads",
  };
}

/**
 * Driving route along real roads (OSRM). Falls back to straight line if unavailable.
 * @param {[number, number]} from [lat, lng]
 * @param {{ lat: number, lng: number }} to
 * @returns {Promise<DrivingRouteResult>}
 */
async function fetchDrivingRouteUncached(from, to) {
  const [lat1, lng1] = from;
  const { lat: lat2, lng: lng2 } = to;
  const coords = `${lng1},${lat1};${lng2},${lat2}`;
  const url = `${OSRM_BASE}/driving/${coords}?overview=full&geometries=geojson&alternatives=false`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return straightFallback(from, to);
    const json = await res.json();
    if (json.code !== "Ok") return straightFallback(from, to);
    return parseOsrmRoute(json) ?? straightFallback(from, to);
  } catch {
    return straightFallback(from, to);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Driving route along real roads (OSRM). Falls back to straight line if unavailable.
 * @param {[number, number]} from [lat, lng]
 * @param {{ lat: number, lng: number }} to
 * @returns {Promise<DrivingRouteResult>}
 */
export async function fetchDrivingRoute(from, to) {
  if (!from || to?.lat == null || to?.lng == null) {
    return straightFallback(from ?? [0, 0], to ?? { lat: 0, lng: 0 });
  }

  const key = routeCacheKey(from, to);
  if (routeCache.has(key)) return routeCache.get(key);

  const result = await fetchDrivingRouteUncached(from, to);
  routeCache.set(key, result);
  return result;
}

/**
 * Replace straight-line distanceKm with real road distance + cache geometry for the map route.
 * @param {[number, number]} from
 * @param {Array<{ id: string, lat: number, lng: number }>} items
 */
export async function enrichItemsWithRoadDistance(from, items) {
  if (!from?.length || !items?.length) return items;

  const enriched = await Promise.all(
    items.map(async (item) => {
      const route = await fetchDrivingRoute(from, { lat: item.lat, lng: item.lng });
      return {
        ...item,
        distanceKm: route.distanceKm,
        driveDurationMin: route.durationMin,
        distanceSource: route.source,
        cachedRoute: route,
      };
    })
  );

  return [...enriched].sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Walk time estimate from road distance (km). */
export function estimateWalkMin(distanceKm) {
  return Math.max(1, Math.round((distanceKm / 5) * 60));
}

/** Clear route cache (tests). */
export function clearRouteCache() {
  routeCache.clear();
}
