/** Neighboring countries — shown at low zoom for regional context (not Algeria wilayas) */

function radiusFromAreaKm2(km2) {
  return Math.min(55000, Math.max(12000, Math.round(Math.sqrt((km2 * 1e6) / Math.PI) * 0.18)));
}

function n(code, country, countryAr, name, nameAr, lat, lng, areaKm2) {
  return {
    code,
    country,
    countryAr,
    name,
    nameAr,
    lat,
    lng,
    areaKm2,
    radiusM: radiusFromAreaKm2(areaKm2),
    isNeighbor: true,
    status: "neighbor",
  };
}

export const NEIGHBOR_REGIONS = [
  // Tunisia
  n("TN-11", "Tunisia", "تونس", "Tunis", "تونس", 36.8065, 10.1815, 2800),
  n("TN-21", "Tunisia", "تونس", "Sfax", "صفاقس", 34.7406, 10.7603, 7500),
  n("TN-31", "Tunisia", "تونس", "Gabès", "قابس", 33.8815, 10.0982, 7000),
  n("TN-41", "Tunisia", "تونس", "Bizerte", "بنزرت", 37.2744, 9.8739, 4500),
  // Morocco
  n("MA-01", "Morocco", "المغرب", "Rabat", "الرباط", 34.0209, -6.8416, 1200),
  n("MA-02", "Morocco", "المغرب", "Casablanca", "الدار البيضاء", 33.5731, -7.5898, 2000),
  n("MA-03", "Morocco", "المغرب", "Fes", "فاس", 34.0331, -5.0003, 5500),
  n("MA-04", "Morocco", "المغرب", "Oujda", "وجدة", 34.6867, -1.9086, 9000),
  // Libya
  n("LY-01", "Libya", "ليبيا", "Tripoli", "طرابلس", 32.8872, 13.1913, 4000),
  n("LY-02", "Libya", "ليبيا", "Benghazi", "بنغازي", 32.1194, 20.0868, 12000),
  n("LY-03", "Libya", "ليبيا", "Sebha", "سبها", 27.0377, 14.4853, 35000),
  // Mali
  n("ML-01", "Mali", "مالي", "Bamako", "باماكو", 12.6392, -8.0029, 18000),
  n("ML-02", "Mali", "مالي", "Gao", "غاو", 16.2719, -0.0447, 45000),
  // Niger
  n("NE-01", "Niger", "النيجر", "Niamey", "نيامي", 13.5127, 2.1124, 14000),
  n("NE-02", "Niger", "النيجر", "Agadez", "أغاديز", 16.9667, 7.9833, 55000),
  // Mauritania
  n("MR-01", "Mauritania", "موريتانيا", "Nouakchott", "نواكشوط", 18.0735, -15.9582, 12000),
  n("MR-02", "Mauritania", "موريتانيا", "Nouadhibou", "نواذيبو", 20.9419, -17.0347, 25000),
];
