/**
 * Map team: change data HERE only. Do not import api/ or firebase/ in UI components.
 */
import { data } from "../../../services/data/index.js";
import { wilayaStatus as mockWilayas } from "../../../mockData.js";

export async function fetchWilayas() {
  try {
    return await data.getWilayas();
  } catch {
    return mockWilayas;
  }
}
