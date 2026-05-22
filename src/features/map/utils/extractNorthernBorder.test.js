import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractNorthernBoundaryLine } from "./extractNorthernBorder.js";

describe("extractNorthernBoundaryLine", () => {
  it("returns a west-to-east line with multiple points", () => {
    const ring = [
      [-17, 27.7],
      [-12, 27.65],
      [-8.7, 27.66],
      [-8.7, 25],
      [-17, 21],
      [-17, 27.7],
    ];
    const line = extractNorthernBoundaryLine(ring);
    assert.ok(line);
    assert.ok(line.length >= 2);
    assert.ok(line[0][0] < line[line.length - 1][0]);
  });
});
