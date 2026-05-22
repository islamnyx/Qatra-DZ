/** World map — ISO country fills + clean borders; Morocco ≠ Western Sahara. */

import { resolveIso2 } from "./countryLabels.js";
import { extractNorthernBoundaryLine } from "./extractNorthernBorder.js";

/** ISO 3166 polygons — correct Morocco / Western Sahara separation. */
const GEO_COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson";

const NE_COUNTRIES_URL_50M =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson";

const BOUNDARIES_URL_50M =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_boundary_lines_land.geojson";
const BOUNDARIES_URL_110M =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_boundary_lines_land.geojson";

let countriesPromise = null;
let boundariesPromise = null;

function ringCoords(feature) {
  const g = feature.geometry;
  if (!g) return null;
  if (g.type === "Polygon") return g.coordinates[0];
  if (g.type === "MultiPolygon") return g.coordinates[0]?.[0] ?? null;
  return null;
}

function normalizeWorldCountriesGeo(geo) {
  const features = (geo?.features ?? []).filter((f) => {
    const iso2 = resolveIso2(f);
    return iso2 && iso2 !== "-99" && iso2.length === 2;
  });
  return { type: "FeatureCollection", features };
}

function isInternationalBoundary(feature) {
  const fc = feature.properties?.FEATURECLA ?? "";
  return fc.includes("International boundary");
}

/** Drop berm / line-of-control segments inside NW Africa (wrong jagged line in Western Sahara). */
function isExcludedBoundaryLine(feature) {
  const fc = feature.properties?.FEATURECLA ?? "";
  if (fc.includes("Line of control")) return true;
  if (fc.includes("Elusive frontier")) return true;
  if (fc.includes("Indefinite")) return true;
  return false;
}

/** Extend dashed line to Atlantic coast (ISO polygons omit the western segment). */
function extendMaEhBorderToAtlantic(line) {
  if (!line?.length) return line;
  const sorted = [...line].sort((a, b) => a[0] - b[0]);
  if (sorted[0][0] <= -16.9) return sorted;

  const sample = sorted.slice(0, Math.min(6, sorted.length));
  const lat = sample.reduce((s, p) => s + p[1], 0) / sample.length;
  return [[-17.105, lat], ...sorted];
}

function isDuplicateMaEhIntlLine(feature) {
  const pts = [];
  const walk = (a) => {
    if (typeof a[0] === "number") pts.push(a);
    else a.forEach(walk);
  };
  walk(feature.geometry?.coordinates ?? []);
  if (!pts.length) return false;
  const lats = pts.map((p) => p[1]);
  const lngs = pts.map((p) => p[0]);
  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return avgLat > 26.5 && avgLat < 28.6 && minLng > -17.5 && maxLng < -8.2;
}

function mergeBorderPoints(pointLists) {
  const byLng = new Map();
  for (const pts of pointLists) {
    for (const p of pts) {
      if (!p) continue;
      const key = `${p[0].toFixed(5)}:${p[1].toFixed(5)}`;
      byLng.set(key, p);
    }
  }
  return [...byLng.values()].sort((a, b) => a[0] - b[0]);
}

/** Dashed Morocco ↔ Western Sahara line from ISO polygons (not the internal berm). */
function buildMoroccoWesternSaharaBorder(countriesGeo) {
  const eh = countriesGeo.features.find((f) => resolveIso2(f) === "EH");
  const ma = countriesGeo.features.find((f) => resolveIso2(f) === "MA");
  const lists = [];

  const ehRing = eh ? ringCoords(eh) : null;
  if (ehRing) {
    const north = extractNorthernBoundaryLine(ehRing);
    if (north?.length) lists.push(north);
  }

  const maRing = ma ? ringCoords(ma) : null;
  if (maRing) {
    const band = maRing.filter(
      (p) => p[1] >= 27.05 && p[1] <= 28.25 && p[0] >= -17.2 && p[0] <= -8.5
    );
    if (band.length) lists.push(band);
  }

  let line = mergeBorderPoints(lists);
  line = extendMaEhBorderToAtlantic(line);
  if (line.length < 2) return null;

  return {
    type: "Feature",
    properties: { id: "ma-eh-border", kind: "morocco-western-sahara" },
    geometry: { type: "LineString", coordinates: line },
  };
}

function mergeBoundariesGeo(linesGeo, countriesGeo) {
  const intl = (linesGeo?.features ?? []).filter(
    (f) =>
      isInternationalBoundary(f) &&
      !isExcludedBoundaryLine(f) &&
      !isDuplicateMaEhIntlLine(f)
  );

  const maEh = buildMoroccoWesternSaharaBorder(countriesGeo);
  const features = maEh ? [...intl, maEh] : intl;

  return { type: "FeatureCollection", features };
}

async function fetchCountriesGeo() {
  try {
    const r = await fetch(GEO_COUNTRIES_URL);
    if (!r.ok) throw new Error("geo-countries");
    return normalizeWorldCountriesGeo(await r.json());
  } catch {
    const r = await fetch(NE_COUNTRIES_URL_50M);
    if (!r.ok) throw new Error("ne countries");
    return normalizeWorldCountriesGeo(await r.json());
  }
}

async function fetchBoundariesGeo(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`boundaries geo: ${url}`);
  return { type: "FeatureCollection", features: (await r.json())?.features ?? [] };
}

export function loadWorldCountriesGeo() {
  if (!countriesPromise) {
    countriesPromise = fetchCountriesGeo().catch(() => ({
      type: "FeatureCollection",
      features: [],
    }));
  }
  return countriesPromise;
}

export function loadWorldBoundariesGeo() {
  if (!boundariesPromise) {
    boundariesPromise = loadWorldCountriesGeo()
      .then(async (countries) => {
        const lines = await fetchBoundariesGeo(BOUNDARIES_URL_50M).catch(() =>
          fetchBoundariesGeo(BOUNDARIES_URL_110M)
        );
        return mergeBoundariesGeo(lines, countries);
      })
      .catch(() => ({ type: "FeatureCollection", features: [] }));
  }
  return boundariesPromise;
}

/** Fill only — strokes come from boundary layer. */
export function worldCountryFillStyle(feature) {
  const { iso2 } = resolveIso2(feature);
  const base = { stroke: false, weight: 0 };

  if (iso2 === "DZ") {
    return { ...base, fillColor: "#fecaca", fillOpacity: 0.45 };
  }
  if (iso2 === "EH") {
    return { ...base, fillColor: "#fafaf9", fillOpacity: 0.72 };
  }
  if (iso2 === "MA") {
    return { ...base, fillColor: "#e7e5e4", fillOpacity: 0.65 };
  }
  return { ...base, fillColor: "#f1f5f9", fillOpacity: 0.5 };
}

export function worldBoundaryStyle(feature) {
  const kind = feature?.properties?.kind;

  if (kind === "morocco-western-sahara") {
    return {
      color: "#57534e",
      weight: 1.25,
      opacity: 0.9,
      dashArray: "7 5",
      fill: false,
      interactive: false,
    };
  }

  return {
    color: "#57534e",
    weight: 1,
    opacity: 0.85,
    fill: false,
    interactive: false,
  };
}
