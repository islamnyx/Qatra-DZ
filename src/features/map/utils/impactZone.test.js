import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getImpactRadiusM,
  getImpactRadiusKm,
  countLivesSaved,
  estimateSymbolicReach,
  buildImpactSnapshot,
  LIVES_PER_DONATION,
  IMPACT_MAX_RADIUS_M,
} from "./impactZone.js";

describe("feature 2.7 impact zone", () => {
  it("grows circle radius with each donation", () => {
    const r0 = getImpactRadiusM(0);
    const r1 = getImpactRadiusM(1);
    const r7 = getImpactRadiusM(7);
    assert.ok(r1 > r0);
    assert.ok(r7 > r1);
    assert.equal(r7, 2000 + 7 * 350);
  });

  it("caps radius at maximum", () => {
    const huge = getImpactRadiusM(50);
    assert.equal(huge, IMPACT_MAX_RADIUS_M);
  });

  it("increases lives saved by 3 per donation", () => {
    assert.equal(LIVES_PER_DONATION, 3);
    assert.equal(countLivesSaved(7), 21);
    assert.equal(countLivesSaved(0), 0);
  });

  it("increases symbolic reach with donations and radius", () => {
    const low = estimateSymbolicReach(2000, 1);
    const high = estimateSymbolicReach(getImpactRadiusM(12), 12);
    assert.ok(high > low);
  });

  it("buildImpactSnapshot matches mock donor (7 donations)", () => {
    const snap = buildImpactSnapshot(7, "ar");
    assert.equal(snap.donations, 7);
    assert.equal(snap.livesSaved, 21);
    assert.equal(snap.radiusM, 4450);
    assert.equal(snap.radiusKm, 4.5);
    assert.ok(snap.reach >= 500);
    assert.equal(snap.tier, "hero");
  });
});
