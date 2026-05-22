import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSuspiciousGeoJump } from "./geoJump.js";

describe("geo jump filter", () => {
  const alger = [36.7538, 3.0588];
  const zeralda = [36.711, 2.842];

  it("flags coarse fix far from last position (Zeralda vs Alger)", () => {
    assert.equal(isSuspiciousGeoJump(alger, zeralda, 1200), true);
  });

  it("allows small movement with good accuracy", () => {
    const nearby = [36.754, 3.06];
    assert.equal(isSuspiciousGeoJump(alger, nearby, 40), false);
  });
});
