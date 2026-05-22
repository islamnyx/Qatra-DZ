import { ALGERIA_WILAYAS_69, resolveWilayaName } from "./algeriaWilayas69.js";

export function mergeWilayaStatus(apiWilayas = []) {
  const apiByName = {};
  for (const w of apiWilayas) {
    apiByName[resolveWilayaName(w.name)] = w;
  }

  return ALGERIA_WILAYAS_69.map((base) => {
    const api = apiByName[base.name];
    return {
      ...base,
      status: api?.status ?? "ok",
      shortage: api?.shortage ?? null,
      hospitals: api?.hospitals ?? [],
    };
  });
}
