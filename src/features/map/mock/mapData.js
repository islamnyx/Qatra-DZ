/** Donor map mock data — replace via mapService when backend endpoints exist */

export const donationCenters = [
  {
    id: "cra-alger-centre",
    nameAr: "مركز الجزائر الوسطى",
    nameFr: "CRA Alger Centre",
    lat: 36.7538,
    lng: 3.0588,
    phone: "+21321234567",
    hours: { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] },
  },
  {
    id: "cra-hydra",
    nameAr: "مركز حيدرة",
    nameFr: "CRA Hydra",
    lat: 36.742,
    lng: 3.028,
    phone: "+21321987654",
    hours: { open: "08:00", close: "15:00", days: [1, 2, 3, 4, 5] },
  },
  {
    id: "cra-bab-ezzouar",
    nameAr: "مركز باب الزوار",
    nameFr: "CRA Bab Ezzouar",
    lat: 36.72,
    lng: 3.182,
    phone: "+21323456789",
    hours: { open: "09:00", close: "16:00", days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    id: "cra-blida",
    nameAr: "مركز البليدة",
    nameFr: "CRA Blida",
    lat: 36.47,
    lng: 2.83,
    phone: "+21325551234",
    hours: { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] },
  },
];

function driveDate(daysFromNow, hourStart, hourEnd) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const start = new Date(d);
  start.setHours(hourStart, 0, 0, 0);
  const end = new Date(d);
  end.setHours(hourEnd, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

const todayDrive = driveDate(0, 9, 17);
const upcomingDrive = driveDate(2, 10, 16);

export const mobileDrives = [
  {
    id: "drive-polytech",
    nameAr: "المدرسة العسكرية متعددة التقنيات",
    nameFr: "École Polytechnique d'Alger",
    lat: 36.723,
    lng: 3.175,
    ...todayDrive,
    bloodTypesNeeded: ["A+", "O-"],
    volunteerCount: 47,
    qrCheckIn: true,
  },
  {
    id: "drive-univ-alger",
    nameAr: "جامعة الجزائر — بن عكنون",
    nameFr: "Université d'Alger — Ben Aknoun",
    lat: 36.758,
    lng: 3.012,
    ...upcomingDrive,
    bloodTypesNeeded: ["B+", "AB+"],
    volunteerCount: 12,
    qrCheckIn: true,
  },
  {
    id: "drive-kouba",
    nameAr: "ساحة القبة — حملة أسبوعية",
    nameFr: "Place Kouba — campagne hebdo",
    lat: 36.731,
    lng: 3.078,
    ...driveDate(5, 9, 15),
    bloodTypesNeeded: ["O+", "A-"],
    volunteerCount: 0,
    qrCheckIn: false,
  },
];

/** Hospital emergency pins — coordinates for map only */
export const emergencyAlerts = [
  {
    id: "SOS-MAP-001",
    sosId: "SOS-001",
    bloodType: "O-",
    hospitalAr: "مستشفى مصطفى باشا",
    hospitalFr: "CHU Mustapha Pacha",
    wilaya: "Alger",
    urgency: "critical",
    lat: 36.764,
    lng: 3.052,
    postedAt: "2026-05-20T08:15:00",
  },
  {
    id: "SOS-MAP-002",
    sosId: "SOS-002",
    bloodType: "AB-",
    hospitalAr: "مستشفى باب الوادي",
    hospitalFr: "EHSU Bab El Oued",
    wilaya: "Alger",
    urgency: "critical",
    lat: 36.788,
    lng: 3.098,
    postedAt: "2026-05-20T09:30:00",
  },
];

export const ALGER_CENTER = [36.7538, 3.0588];
