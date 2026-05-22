import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fetchDrivingRoute,
  estimateWalkMin,
  enrichItemsWithRoadDistance,
  clearRouteCache,
} from "./routing.js";

describe("driving route", () => {
  it("enrichItemsWithRoadDistance sets road distanceKm", async () => {
    clearRouteCache();
    const from = [36.72, 3.18];
    const items = [{ id: "a", lat: 36.7538, lng: 3.0588, distanceKm: 99 }];
    const out = await enrichItemsWithRoadDistance(from, items);
    assert.ok(out[0].distanceKm > 0);
    assert.ok(out[0].distanceKm !== 99);
    assert.ok(out[0].cachedRoute);
    assert.ok(["roads", "straight"].includes(out[0].distanceSource));
  });

  it("estimateWalkMin from road distance", () => {
    assert.ok(estimateWalkMin(5) >= 30);
  });

  it("falls back to straight line when coords invalid", async () => {
    const r = await fetchDrivingRoute(null, { lat: 36.75, lng: 3.05 });
    assert.equal(r.source, "straight");
    assert.equal(r.positions.length, 2);
  });

  it("returns road geometry for Alger area (integration)", async () => {
    const from = [36.72, 3.18];
    const to = { lat: 36.7538, lng: 3.0588 };
    const r = await fetchDrivingRoute(from, to);
    assert.ok(r.distanceKm > 0);
    assert.ok(r.durationMin >= 1);
    if (r.source === "roads") {
      assert.ok(r.positions.length > 2, "road route should have multiple points");
    }
  });
});
