/**
 * BloodSync operations map — automated validation (run: npm run validate:map)
 */
import assert from "node:assert/strict";
import { buildWilayaHeatmap, daysToHeatLevel, HEAT_LEVELS } from "../src/features/controlMap/utils/heatmap.js";
import {
  countDonorsInPolygon,
  donorsInRadius,
  haversineKm,
  pointInPolygon,
} from "../src/features/controlMap/utils/geo.js";
import { loadControlMapData } from "../src/features/controlMap/api/controlMapApi.js";
import { WILAYA_REGIONS, donorDensityZones } from "../src/mock/mapOpsData.js";

const mockHospital = {
  wilaya: "Alger",
  stockLevel: 0.4,
  stock: [
    { type: "O-", units: 2, optimal: 20, fillRatio: 0.1 },
    { type: "A+", units: 10, optimal: 20, fillRatio: 0.5 },
  ],
};

let passed = 0;
let failed = 0;

async function ok(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

console.log("\n=== BloodSync Control Map Validation ===\n");

console.log("1. Heatmap logic");
await ok("critical when O- stock very low", () => {
  assert.equal(daysToHeatLevel(2), "critical");
  assert.equal(HEAT_LEVELS.critical.color, "#dc2626");
});
await ok("buildWilayaHeatmap returns 5 wilaya zones", () => {
  const heat = buildWilayaHeatmap([mockHospital], WILAYA_REGIONS, "O-");
  assert.equal(heat.length, 5);
  assert.ok(heat.every((z) => z.color && z.daysRemaining >= 0));
});
await ok("blood type filter changes heatmap values", () => {
  const oNeg = buildWilayaHeatmap([mockHospital], WILAYA_REGIONS, "O-");
  const aPos = buildWilayaHeatmap([mockHospital], WILAYA_REGIONS, "A+");
  const algerONeg = oNeg.find((z) => z.wilaya === "Alger");
  const algerAPos = aPos.find((z) => z.wilaya === "Alger");
  assert.notEqual(algerONeg.daysRemaining, algerAPos.daysRemaining);
});
await ok("O- vs O+ change wilaya color on full mock network", async () => {
  const { hospitals } = await import("../src/mock/data.js");
  const oNeg = buildWilayaHeatmap(hospitals, WILAYA_REGIONS, "O-");
  const oPos = buildWilayaHeatmap(hospitals, WILAYA_REGIONS, "O+");
  const changed = oNeg.filter((z) => {
    const other = oPos.find((x) => x.wilaya === z.wilaya);
    return other && (z.color !== other.color || z.level !== other.level);
  });
  assert.ok(changed.length >= 2, "at least 2 wilayas should change color between O- and O+");
});

console.log("\n2. Geo tools (planner + broadcast)");
await ok("haversineKm reasonable", () => {
  const km = haversineKm(36.75, 3.05, 36.47, 2.83);
  assert.ok(km > 20 && km < 60);
});
await ok("pointInPolygon detects inside", () => {
  const poly = [
    [36.7, 3.0],
    [36.8, 3.0],
    [36.8, 3.2],
    [36.7, 3.2],
  ];
  assert.equal(pointInPolygon([36.75, 3.1], poly), true);
  assert.equal(pointInPolygon([35.0, 3.1], poly), false);
});
await ok("countDonorsInPolygon sums zones inside polygon", () => {
  const poly = [
    [36.72, 3.18],
    [36.74, 3.18],
    [36.74, 3.2],
    [36.72, 3.2],
  ];
  const n = countDonorsInPolygon(donorDensityZones, poly);
  assert.ok(n > 0);
});
await ok("donorsInRadius grows with radius", () => {
  const center = [36.75, 3.05];
  const small = donorsInRadius(donorDensityZones, center, 5);
  const large = donorsInRadius(donorDensityZones, center, 50);
  assert.ok(large >= small);
});

console.log("\n3. API payload (mock data)");
await ok("loadControlMapData returns required layers", async () => {
  const data = await loadControlMapData();
  assert.ok(data.hospitals?.length > 0, "hospitals");
  assert.equal(data.heatmap?.length, 5, "heatmap wilayas");
  assert.ok(data.drives?.length > 0, "drives");
  assert.ok(data.completedDrives?.length > 0, "completedDrives");
  assert.ok(data.donorDensityZones?.length > 0, "donorDensityZones");
  assert.ok(data.rareBloodClusters?.length > 0, "rareBloodClusters");
  assert.ok(data.transferRoutes?.length > 0, "transferRoutes");
  assert.ok(data.expiryMarkers?.length > 0, "expiryMarkers");
  assert.ok(data.recommendations?.length > 0, "recommendations");
});
await ok("transfer routes have coordinates", async () => {
  const data = await loadControlMapData();
  for (const t of data.transferRoutes) {
    assert.ok(t.fromCoords?.length === 2);
    assert.ok(t.toCoords?.length === 2);
  }
});
await ok("expiry markers linked to hospitals", async () => {
  const data = await loadControlMapData();
  for (const em of data.expiryMarkers) {
    assert.ok(em.hospital?.coordinates);
    assert.ok(em.units > 0);
  }
});

console.log("\n4. World borders (shared with Qatra donor map)");
await ok("loadWorldBoundariesGeo includes MA–EH dashed border", async () => {
  const { loadWorldCountriesGeo, loadWorldBoundariesGeo } = await import(
    "../../src/features/map/utils/geoCache.js"
  );
  const { resolveIso2 } = await import("../../src/features/map/utils/countryLabels.js");
  const countries = await loadWorldCountriesGeo();
  const boundaries = await loadWorldBoundariesGeo();
  const ma = countries.features.find((f) => resolveIso2(f) === "MA");
  const eh = countries.features.find((f) => resolveIso2(f) === "EH");
  assert.ok(ma, "Morocco polygon");
  assert.ok(eh, "Western Sahara polygon");
  const maEh = boundaries.features.find((f) => f.properties?.kind === "morocco-western-sahara");
  assert.ok(maEh, "dashed Morocco–Western Sahara border");
  assert.equal(maEh.geometry.type, "LineString");
});

console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
