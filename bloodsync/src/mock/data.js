const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function stockRow(type, units, optimal, hoursToExpiry) {
  const ratio = units / optimal;
  let trend = "→";
  if (ratio < 0.3) trend = "↓↓";
  else if (ratio < 0.5) trend = "↓";
  else if (ratio > 0.85) trend = "↑↑";
  else if (ratio > 0.7) trend = "↑";
  return {
    type,
    units,
    optimal,
    fillRatio: ratio,
    trend,
    expiryAlert: hoursToExpiry < 48 ? `${hoursToExpiry}h` : null,
    hoursToExpiry,
  };
}

export const hospitals = [
  {
    id: "h1",
    name: "CHU Mustapha Pacha",
    wilaya: "Alger",
    coordinates: [36.7525, 3.042],
    capacity: 1200,
    bedsTotal: 420,
    bedsUsed: 385,
    lastUpdated: "2026-05-21T18:42:00",
    facilityType: "bank",
    isBloodBank: true,
    stockLevel: 0.22,
    hasExpiryRisk: true,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [12, 4, 28, 6, 8, 2, 45, 3][i], [80, 40, 70, 35, 30, 20, 100, 50][i], [40, 20, 72, 30, 50, 10, 36, 18][i])
    ),
  },
  {
    id: "h2",
    name: "EHSU Bab El Oued",
    wilaya: "Alger",
    coordinates: [36.791, 3.24],
    capacity: 600,
    bedsTotal: 180,
    bedsUsed: 142,
    lastUpdated: "2026-05-21T18:30:00",
    facilityType: "bank",
    isBloodBank: true,
    stockLevel: 0.45,
    hasExpiryRisk: false,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [55, 22, 48, 18, 12, 8, 62, 15][i], [70, 35, 60, 30, 25, 15, 90, 40][i], [120, 90, 100, 80, 96, 72, 88, 60][i])
    ),
  },
  {
    id: "h3",
    name: "CHU Constantine",
    wilaya: "Constantine",
    coordinates: [36.365, 6.6147],
    capacity: 900,
    bedsTotal: 310,
    bedsUsed: 298,
    lastUpdated: "2026-05-21T17:55:00",
    facilityType: "bank",
    isBloodBank: true,
    stockLevel: 0.18,
    hasExpiryRisk: true,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [8, 2, 15, 5, 4, 1, 20, 2][i], [75, 38, 65, 32, 28, 18, 95, 45][i], [30, 12, 44, 22, 36, 8, 28, 14][i])
    ),
  },
  {
    id: "h4",
    name: "CHU Oran",
    wilaya: "Oran",
    coordinates: [35.6969, -0.6331],
    capacity: 800,
    bedsTotal: 280,
    bedsUsed: 210,
    lastUpdated: "2026-05-21T18:10:00",
    facilityType: "bank",
    isBloodBank: true,
    stockLevel: 0.72,
    hasExpiryRisk: false,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [70, 35, 58, 28, 22, 14, 85, 38][i], [80, 40, 70, 35, 30, 20, 100, 50][i], [200, 150, 180, 140, 160, 100, 190, 120][i])
    ),
  },
  {
    id: "h5",
    name: "CHU Annaba",
    wilaya: "Annaba",
    coordinates: [36.9, 7.7667],
    capacity: 500,
    bedsTotal: 200,
    bedsUsed: 175,
    lastUpdated: "2026-05-21T18:05:00",
    facilityType: "bank",
    isBloodBank: true,
    stockLevel: 0.35,
    hasExpiryRisk: true,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [25, 10, 22, 9, 6, 4, 30, 8][i], [60, 30, 55, 28, 24, 16, 80, 38][i], [36, 24, 40, 28, 32, 20, 44, 22][i])
    ),
  },
  {
    id: "h6",
    name: "CHU Blida",
    wilaya: "Blida",
    coordinates: [36.47, 2.83],
    capacity: 450,
    bedsTotal: 160,
    bedsUsed: 128,
    lastUpdated: "2026-05-21T18:20:00",
    facilityType: "hospital",
    isBloodBank: false,
    stockLevel: 0.68,
    hasExpiryRisk: false,
    stock: BLOOD_TYPES.map((t, i) =>
      stockRow(t, [48, 20, 42, 16, 14, 9, 55, 22][i], [55, 28, 50, 25, 22, 14, 70, 32][i], [100, 80, 96, 72, 88, 64, 92, 70][i])
    ),
  },
];

export const recommendations = [
  {
    id: "r1",
    action: "Transfer",
    title: "Urgent redistribution O-",
    fromHospital: "CHU Oran",
    fromWilaya: "Oran",
    toHospital: "CHU Mustapha Pacha",
    toWilaya: "Alger",
    bloodType: "O-",
    units: 15,
    distanceKm: 432,
    urgency: 94,
    expiryHours: 36,
  },
  {
    id: "r2",
    action: "Transfer",
    title: "Balance AB- stock",
    fromHospital: "EHSU Bab El Oued",
    fromWilaya: "Alger",
    toHospital: "CHU Constantine",
    toWilaya: "Constantine",
    bloodType: "AB-",
    units: 8,
    distanceKm: 312,
    urgency: 78,
    expiryHours: null,
  },
  {
    id: "r3",
    action: "Schedule Drive",
    title: "Ramadan coverage drive",
    fromHospital: "CRA — Alger Centre",
    fromWilaya: "Alger",
    toHospital: "CHU Annaba",
    toWilaya: "Annaba",
    bloodType: "B+",
    units: 40,
    distanceKm: 0,
    urgency: 65,
    expiryHours: null,
  },
];

export const shortages = [
  { hospital: "CHU Mustapha Pacha", wilaya: "Alger", types: ["O-", "AB-"], daysUntilEmpty: 0.8, updated: "2026-05-21T18:00" },
  { hospital: "CHU Constantine", wilaya: "Constantine", types: ["A-", "O-"], daysUntilEmpty: 1.2, updated: "2026-05-21T17:45" },
  { hospital: "CHU Annaba", wilaya: "Annaba", types: ["B+"], daysUntilEmpty: 2.5, updated: "2026-05-21T17:30" },
];

export const expiringUnits = [
  { hospital: "CHU Mustapha Pacha", type: "O-", units: 3, hoursRemaining: 18, suggestedTo: "EHSU Bab El Oued" },
  { hospital: "CHU Mustapha Pacha", type: "A-", units: 4, hoursRemaining: 22, suggestedTo: "CHU Blida" },
  { hospital: "CHU Constantine", type: "B+", units: 6, hoursRemaining: 30, suggestedTo: "CHU Oran" },
  { hospital: "CHU Annaba", type: "A+", units: 5, hoursRemaining: 44, suggestedTo: "CHU Mustapha Pacha" },
];

export const transfers = [
  { id: "T-1042", from: "CHU Oran", to: "CHU Mustapha Pacha", type: "O-", units: 12, status: "In Transit", date: "2026-05-21", timeline: ["Requested", "Approved", "In Transit"] },
  { id: "T-1041", from: "EHSU Bab El Oued", to: "CHU Constantine", type: "AB-", units: 8, status: "Pending", date: "2026-05-21", timeline: ["Requested"] },
  { id: "T-1040", from: "CHU Blida", to: "CHU Annaba", type: "A+", units: 10, status: "Approved", date: "2026-05-20", timeline: ["Requested", "Approved"] },
  { id: "T-1039", from: "CHU Mustapha Pacha", to: "CHU Oran", type: "B+", units: 6, status: "Rejected", date: "2026-05-19", timeline: ["Requested", "Rejected"] },
];

export const notifications = [
  { id: "n1", type: "critical", message: "CHU Mustapha: O- below 30% threshold", time: "10 min ago", read: false },
  { id: "n2", type: "critical", message: "3 units expiring < 24h at Constantine", time: "25 min ago", read: false },
  { id: "n3", type: "info", message: "Transfer T-1042 marked in transit", time: "1h ago", read: true },
];

export const seasonalFactors = [
  { event: "Ramadan", range: "2026-02-28 — 2026-03-30", adjustments: "Surgical -20%, O+ +10%" },
  { event: "Summer", range: "2026-06-01 — 2026-08-31", adjustments: "All types -5%" },
];

export function getStockUrgency(level) {
  if (level >= 0.7) return { label: "Stable", color: "#1D9E75", key: "green" };
  if (level >= 0.3) return { label: "Watch", color: "#EF9F27", key: "amber" };
  return { label: "Critical", color: "#C42B2B", key: "red" };
}

export function forecastForHospital(hospitalId) {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days.map((d) => ({
    day: d,
    "A+": 40 + Math.floor(Math.random() * 20),
    "O-": 55 + Math.floor(Math.random() * 25),
    "B+": 35 + Math.floor(Math.random() * 15),
  }));
}

export const nationalKpis = {
  totalUnits: 18420,
  expiringThisWeek: 127,
  activeShortages: 8,
  transfersToday: 14,
};
