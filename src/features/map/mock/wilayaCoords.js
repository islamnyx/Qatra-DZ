/**
 * @deprecated Use ../data/mergeWilayaStatus.js — kept for imports that still reference enrichWilayasForMap
 */
import { mergeWilayaStatus } from "../data/mergeWilayaStatus.js";

export function enrichWilayasForMap(wilayas) {
  return mergeWilayaStatus(wilayas);
}
