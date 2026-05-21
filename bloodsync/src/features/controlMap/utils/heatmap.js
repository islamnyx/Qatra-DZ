import { PLATELET_DAYS_BY_WILAYA } from "../../../mock/mapOpsData.js";

export const HEAT_LEVELS = {
  critical: { color: "#dc2626", label: "< 3 days", maxDays: 3 },
  low: { color: "#ea580c", label: "< 7 days", maxDays: 7 },
  moderate: { color: "#eab308", label: "< 14 days", maxDays: 14 },
  adequate: { color: "#16a34a", label: "Adequate", maxDays: Infinity },
};

export function daysToHeatLevel(days) {
  if (days < 3) return "critical";
  if (days < 7) return "low";
  if (days < 14) return "moderate";
  return "adequate";
}

/** Estimate days of supply for one blood type at a hospital */
export function stockDaysForType(hospital, bloodType) {
  if (bloodType === "Platelets") {
    const base = hospital.stockLevel * 14;
    return Math.max(0.5, base * 0.6);
  }
  const row = hospital.stock?.find((s) => s.type === bloodType);
  if (!row) return 14;
  const dailyUse = row.optimal / 14;
  if (dailyUse <= 0) return 14;
  return row.units / dailyUse;
}

export function aggregateWilayaDays(hospitals, wilaya, bloodType) {
  if (bloodType === "Platelets") {
    return PLATELET_DAYS_BY_WILAYA[wilaya] ?? 10;
  }
  const inWilaya = hospitals.filter((h) => h.wilaya === wilaya);
  if (!inWilaya.length) return 14;
  const days = inWilaya.map((h) => stockDaysForType(h, bloodType));
  return days.reduce((a, b) => a + b, 0) / days.length;
}

export function buildWilayaHeatmap(hospitals, regions, bloodType) {
  return regions.map((r) => {
    const daysRemaining = aggregateWilayaDays(hospitals, r.wilaya, bloodType);
    const level = daysToHeatLevel(daysRemaining);
    return {
      ...r,
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      level,
      color: HEAT_LEVELS[level].color,
    };
  });
}
