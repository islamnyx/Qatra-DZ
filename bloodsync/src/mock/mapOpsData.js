/** Control panel map — wilayas, drives, density, rare blood, analytics */

export const BLOOD_TYPES_FILTER = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Platelets",
];

export const WILAYA_REGIONS = [
  { wilaya: "Alger", center: [36.7538, 3.0588], radiusM: 32000 },
  { wilaya: "Blida", center: [36.47, 2.83], radiusM: 24000 },
  { wilaya: "Constantine", center: [36.365, 6.6147], radiusM: 28000 },
  { wilaya: "Oran", center: [35.6969, -0.6331], radiusM: 30000 },
  { wilaya: "Annaba", center: [36.9, 7.7667], radiusM: 22000 },
];

export const mobileDrives = [
  {
    id: "md-live-1",
    name: "CRA — École Polytechnique",
    wilaya: "Alger",
    coordinates: [36.723, 3.175],
    status: "live",
    plannedDonors: 80,
    qrEnabled: true,
  },
  {
    id: "md-plan-1",
    name: "CRA — Kouba (planned)",
    wilaya: "Alger",
    coordinates: [36.731, 3.078],
    status: "planned",
    plannedDonors: 120,
    qrEnabled: false,
  },
];

export const completedDrives = [
  {
    id: "md-done-1",
    name: "Université Alger — Ben Aknoun",
    wilaya: "Alger",
    coordinates: [36.758, 3.012],
    donorsCame: 94,
    targetDonors: 80,
    unitsCollected: { "A+": 22, "O+": 31, "B+": 18, "O-": 8 },
    efficiency: 1.18,
    performance: "exceeded",
  },
  {
    id: "md-done-2",
    name: "CHU Blida — parking drive",
    wilaya: "Blida",
    coordinates: [36.468, 2.825],
    donorsCame: 52,
    targetDonors: 60,
    unitsCollected: { "A+": 14, "O+": 20, "B+": 11 },
    efficiency: 0.87,
    performance: "under",
  },
  {
    id: "md-done-3",
    name: "Annaba — centre-ville",
    wilaya: "Annaba",
    coordinates: [36.902, 7.76],
    donorsCame: 61,
    targetDonors: 60,
    unitsCollected: { "A+": 16, "O+": 22, "AB+": 5 },
    efficiency: 1.02,
    performance: "met",
  },
];

export const donorDensityZones = [
  { id: "dz-1", label: "Bab Ezzouar", center: [36.72, 3.182], radiusM: 4500, eligibleCount: 1247 },
  { id: "dz-2", label: "Hydra", center: [36.742, 3.028], radiusM: 3800, eligibleCount: 892 },
  { id: "dz-3", label: "Constantine centre", center: [36.365, 6.61], radiusM: 5000, eligibleCount: 654 },
  { id: "dz-4", label: "Oran Es Sénia", center: [35.63, -0.62], radiusM: 4200, eligibleCount: 1103 },
  { id: "dz-5", label: "Annaba port", center: [36.89, 7.75], radiusM: 3500, eligibleCount: 421 },
];

export const rareBloodClusters = [
  { id: "rb-1", phenotype: "AB-", center: [36.75, 3.04], count: 3, wilaya: "Alger" },
  { id: "rb-2", phenotype: "Bombay", center: [36.36, 6.62], count: 1, wilaya: "Constantine" },
  { id: "rb-3", phenotype: "Rh-null variant", center: [35.7, -0.64], count: 2, wilaya: "Oran" },
];

export const PLATELET_DAYS_BY_WILAYA = {
  Alger: 4.2,
  Blida: 9,
  Constantine: 2.8,
  Oran: 11,
  Annaba: 6.5,
};
