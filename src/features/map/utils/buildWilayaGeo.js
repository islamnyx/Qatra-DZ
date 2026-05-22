import { ALGERIA_WILAYAS_69 } from "../data/algeriaWilayas69.js";

export function buildWilayaFeatureCollection(wilayas = ALGERIA_WILAYAS_69) {
  const list = wilayas?.length ? wilayas : ALGERIA_WILAYAS_69;
  return {
    type: "FeatureCollection",
    features: list.map((w) => ({
      type: "Feature",
      properties: {
        code: w.code,
        name: w.name,
        nameAr: w.nameAr,
        status: w.status ?? "ok",
        shortage: w.shortage,
        hospitals: w.hospitals,
        radiusM: w.radiusM,
      },
      geometry: {
        type: "Point",
        coordinates: [w.lng, w.lat],
      },
    })),
  };
}
