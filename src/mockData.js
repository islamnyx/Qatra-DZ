export const donor = {
  id: "DZ-001",
  name: "أمين بوعلام",
  bloodType: "O-",
  wilaya: "Alger",
  lastDonation: "2025-03-10",
  totalDonations: 7,
  isEligible: true,
  daysUntilEligible: 0,
  badges: ["بطل الدم", "نجم الولاية"],
  points: 1450,
};

export const familyMembers = [
  { id: "F1", name: "فاطمة بوعلام", relationAr: "الأم", relationFr: "Mère", bloodType: "A+", wilaya: "Alger", alertOrder: 1 },
  { id: "F2", name: "بوعلام بن أحمد", relationAr: "الأب", relationFr: "Père", bloodType: "O+", wilaya: "Alger", alertOrder: 2 },
  { id: "F3", name: "سارة بوعلام", relationAr: "الأخت", relationFr: "Sœur", bloodType: "O-", wilaya: "Alger", alertOrder: 3 },
  { id: "F4", name: "ياسين بوعلام", relationAr: "الأخ", relationFr: "Frère", bloodType: "B+", wilaya: "Blida", alertOrder: 4 },
];

export function getPassportPayload() {
  return {
    app: "Qatra",
    passportId: `QATRA-${donor.id}`,
    donorId: donor.id,
    name: donor.name,
    bloodType: donor.bloodType,
    wilaya: donor.wilaya,
    eligible: donor.isEligible,
    lastDonation: donor.lastDonation,
    totalDonations: donor.totalDonations,
    verified: true,
    issuer: "Croissant-Rouge Algérien",
    issuedAt: new Date().toISOString().split("T")[0],
  };
}

export const leaderboard = [
  { id: "DZ-002", name: "سارة بن عودة", bloodType: "A+", wilaya: "Alger", totalDonations: 12, points: 2100 },
  { id: "DZ-003", name: "يوسف قاسمي", bloodType: "B+", wilaya: "Alger", totalDonations: 9, points: 1780 },
  { id: "DZ-001", name: "أمين بوعلام", bloodType: "O-", wilaya: "Alger", totalDonations: 7, points: 1450 },
  { id: "DZ-004", name: "نادية مرزاق", bloodType: "AB+", wilaya: "Alger", totalDonations: 6, points: 1200 },
  { id: "DZ-005", name: "كريم حداد", bloodType: "O+", wilaya: "Alger", totalDonations: 5, points: 980 },
  { id: "DZ-006", name: "ليلى بوزيد", bloodType: "A-", wilaya: "Alger", totalDonations: 4, points: 820 },
];

export const sosRequests = [
  {
    id: "SOS-001",
    bloodType: "O-",
    hospital: "CHU Mustapha Pacha",
    wilaya: "Alger",
    urgency: "critical",
    postedAt: "2026-05-20T08:15:00",
  },
  {
    id: "SOS-002",
    bloodType: "AB-",
    hospital: "EHSU Bab El Oued",
    wilaya: "Alger",
    urgency: "critical",
    postedAt: "2026-05-20T09:30:00",
  },
  {
    id: "SOS-003",
    bloodType: "B+",
    hospital: "CHU Constantine",
    wilaya: "Constantine",
    urgency: "normal",
    postedAt: "2026-05-19T14:00:00",
  },
  {
    id: "SOS-004",
    bloodType: "A+",
    hospital: "CHU Oran",
    wilaya: "Oran",
    urgency: "normal",
    postedAt: "2026-05-19T11:45:00",
  },
];

export const donationHistory = [
  { date: "2025-03-10", hospital: "CHU Mustapha Pacha" },
  { date: "2024-11-22", hospital: "Centre de transfusion Alger" },
  { date: "2024-06-05", hospital: "Hôpital Maillot" },
  { date: "2023-12-18", hospital: "CHU Bab El Oued" },
];

export const badgeDetails = [
  { name: "بطل الدم", icon: "award", color: "red" },
  { name: "نجم الولاية", icon: "star", color: "amber" },
];

export const wilayaStatus = [
  { name: "Alger", nameAr: "الجزائر", status: "critical", shortage: "O-", hospitals: ["CHU Mustapha Pacha", "EHSU Bab El Oued", "Centre transfusion Alger"] },
  { name: "Oran", nameAr: "وهران", status: "ok", shortage: null, hospitals: ["CHU Oran", "Centre transfusion Oran"] },
  { name: "Constantine", nameAr: "قسنطينة", status: "critical", shortage: "AB-", hospitals: ["CHU Constantine", "Hôpital Mouad Boudiaf"] },
  { name: "Blida", nameAr: "البليدة", status: "ok", shortage: null, hospitals: ["CHU Blida", "Centre transfusion Blida"] },
  { name: "Annaba", nameAr: "عنابة", status: "critical", shortage: "B+", hospitals: ["CHU Annaba", "EHSU Annaba"] },
  { name: "Sétif", nameAr: "سطيف", status: "ok", shortage: null, hospitals: ["CHU Sétif", "Centre transfusion Sétif"] },
];

export const chatMessages = [
  { id: 1, role: "user", text: "هل أنا مؤهل للتبرع اليوم؟", time: "10:02" },
  {
    id: 2,
    role: "bot",
    text: "نعم أمين! أنت مؤهل للتبرع اليوم. آخر تبرع كان في 10 مارس 2025.",
    time: "10:02",
  },
  { id: 3, role: "user", text: "أين أقرب مركز تبرع في الجزائر؟", time: "10:04" },
  {
    id: 4,
    role: "bot",
    text: "أقرب مركز: Centre de transfusion — Alger Centre، على بعد 2.4 كم.",
    time: "10:04",
  },
];

export const newsFeed = [
  {
    id: 1,
    title: "حملة تبرع وطنية — رمضان 2026",
    titleFr: "Campagne nationale — Ramadan 2026",
    description: "انضموا إلى حملة الهلال الأحمر الجزائري في 48 ولاية.",
    descriptionFr: "Rejoignez la campagne CRA dans 48 wilayas.",
    date: "2026-05-01",
    tag: "حملة",
    tagColor: "red",
    isCampaign: true,
    daysLeft: 3,
  },
  {
    id: 2,
    title: "نجاح: 12,000 متبرع في أسبوع واحد",
    description: "شكراً لجميع المتبرعين الذين أنقذوا آلاف الأرواح.",
    date: "2026-04-18",
    tag: "نجاح",
    tagColor: "green",
  },
  {
    id: 3,
    title: "فعالية: يوم التبرع — حديقة بن عكنون",
    description: "تبرع مجاني مع فحص طبي ووجبات خفيفة للمتبرعين.",
    date: "2026-05-25",
    tag: "فعالية",
    tagColor: "blue",
  },
];

export function getMostUrgentSOS() {
  const sorted = [...sosRequests].sort((a, b) => {
    if (a.urgency === "critical" && b.urgency !== "critical") return -1;
    if (b.urgency === "critical" && a.urgency !== "critical") return 1;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });
  return sorted[0];
}

export function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} ي`;
}
