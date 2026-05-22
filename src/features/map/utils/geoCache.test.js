import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadWorldCountriesGeo, loadWorldBoundariesGeo } from "./geoCache.js";
import { resolveIso2 } from "./countryLabels.js";

describe("world countries geo", () => {
  it("includes Morocco and Western Sahara as separate territories", async () => {
    const geo = await loadWorldCountriesGeo();
    assert.ok(geo.features?.length > 100);

    const morocco = geo.features.filter((f) => resolveIso2(f) === "MA");
    const westernSahara = geo.features.filter((f) => resolveIso2(f) === "EH");

    assert.equal(morocco.length, 1, "Morocco should be one polygon");
    assert.equal(westernSahara.length, 1, "Western Sahara must not be merged into Morocco");
  });

  it("excludes berm line-of-control and adds dashed MA–EH border", async () => {
    const borders = await loadWorldBoundariesGeo();
    const hasBerm = borders.features.some((f) =>
      f.properties?.FEATURECLA?.includes("Line of control")
    );
    const maEh = borders.features.find(
      (f) => f.properties?.kind === "morocco-western-sahara"
    );

    assert.equal(hasBerm, false);
    assert.ok(maEh?.geometry?.coordinates?.length >= 2);
  });
});
