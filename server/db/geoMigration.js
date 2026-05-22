/**
 * Idempotent geo + map schema upgrades for existing qatra.db files.
 */

const WILAYA_COORDS = {
  Alger: { lat: 36.7538, lng: 3.0588 },
  Oran: { lat: 35.6911, lng: -0.6417 },
  Constantine: { lat: 36.365, lng: 6.6147 },
  Blida: { lat: 36.47, lng: 2.83 },
  Annaba: { lat: 36.9, lng: 7.7667 },
  "Sétif": { lat: 36.1911, lng: 5.4137 },
  "Tizi Ouzou": { lat: 36.7167, lng: 4.05 },
  "Béjaïa": { lat: 36.75, lng: 5.0833 },
  Mostaganem: { lat: 35.9333, lng: 0.0833 },
  Mila: { lat: 36.45, lng: 6.2644 },
  Skikda: { lat: 36.8667, lng: 6.9 },
};

const CENTER_GEO = [
  {
    match: /national|transfusion sanguine/i,
    slug: "cra-alger-centre",
    nameAr: "المركز الوطني لنقل الدم",
    nameFr: "Centre National de Transfusion Sanguine",
    lat: 36.7538,
    lng: 3.0588,
    hours: { open: "08:00", close: "20:00", days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    match: /mustapha/i,
    slug: "chu-mustapha",
    nameAr: "مستشفى مصطفى باشا",
    nameFr: "CHU Mustapha Pacha",
    lat: 36.764,
    lng: 3.052,
    hours: { open: "08:00", close: "18:00", days: [1, 2, 3, 4, 5, 6] },
  },
  {
    match: /oran/i,
    slug: "ehu-oran",
    nameAr: "مستشفى وهران",
    nameFr: "EHU Oran",
    lat: 35.6911,
    lng: -0.6417,
    hours: { open: "08:00", close: "18:00", days: [1, 2, 3, 4, 5, 6] },
  },
  {
    match: /constantine/i,
    slug: "chu-constantine",
    nameAr: "مستشفى قسنطينة",
    nameFr: "CHU Constantine",
    lat: 36.365,
    lng: 6.6147,
    hours: { open: "08:00", close: "20:00", days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    match: /blida/i,
    slug: "chu-blida",
    nameAr: "مستشفى البليدة",
    nameFr: "CHU Blida Frantz Fanon",
    lat: 36.47,
    lng: 2.83,
    hours: { open: "09:00", close: "17:00", days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    match: /annaba/i,
    slug: "chu-annaba",
    nameAr: "مستشفى عنابة",
    nameFr: "CHU Annaba",
    lat: 36.9,
    lng: 7.7667,
    hours: { open: "08:00", close: "17:00", days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    match: /sétif|setif/i,
    slug: "chu-setif",
    nameAr: "مستشفى سطيف",
    nameFr: "CHU Sétif",
    lat: 36.1911,
    lng: 5.4137,
    hours: { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] },
  },
  {
    match: /tizi/i,
    slug: "ehsu-tizi",
    nameAr: "مستشفى تيزي وزو",
    nameFr: "EHSU Tizi Ouzou",
    lat: 36.7167,
    lng: 4.05,
    hours: { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5] },
  },
  {
    match: /béjaïa|bejaia/i,
    slug: "chu-bejaia",
    nameAr: "مستشفى بجاية",
    nameFr: "CHU Béjaïa",
    lat: 36.75,
    lng: 5.0833,
    hours: { open: "08:00", close: "17:00", days: [1, 2, 3, 4, 5, 6] },
  },
];

const SOS_GEO = {
  "SOS-001": {
    lat: 36.764,
    lng: 3.052,
    hospitalAr: "مستشفى مصطفى باشا",
    hospitalFr: "CHU Mustapha Pacha",
  },
  "SOS-002": {
    lat: 36.788,
    lng: 3.098,
    hospitalAr: "مستشفى باب الوادي",
    hospitalFr: "EHSU Bab El Oued",
  },
  "SOS-003": {
    lat: 36.365,
    lng: 6.6147,
    hospitalAr: "مستشفى قسنطينة",
    hospitalFr: "CHU Constantine",
  },
  "SOS-004": {
    lat: 35.6911,
    lng: -0.6417,
    hospitalAr: "مستشفى وهران",
    hospitalFr: "CHU Oran",
  },
};

function addColumn(db, table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

function driveDate(daysFromNow, hourStart, hourEnd) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const start = new Date(d);
  start.setHours(hourStart, 0, 0, 0);
  const end = new Date(d);
  end.setHours(hourEnd, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

const MOBILE_DRIVES_SEED = [
  {
    id: "drive-polytech",
    wilaya: "Alger",
    nameAr: "المدرسة العسكرية متعددة التقنيات",
    nameFr: "École Polytechnique d'Alger",
    lat: 36.723,
    lng: 3.175,
    ...driveDate(0, 9, 17),
    bloodTypes: ["A+", "O-"],
    volunteers: 47,
    qr: 1,
  },
  {
    id: "drive-univ-alger",
    wilaya: "Alger",
    nameAr: "جامعة الجزائر — بن عكنون",
    nameFr: "Université d'Alger — Ben Aknoun",
    lat: 36.758,
    lng: 3.012,
    ...driveDate(2, 10, 16),
    bloodTypes: ["B+", "AB+"],
    volunteers: 12,
    qr: 1,
  },
  {
    id: "drive-kouba",
    wilaya: "Alger",
    nameAr: "ساحة القبة — حملة أسبوعية",
    nameFr: "Place Kouba — campagne hebdo",
    lat: 36.731,
    lng: 3.078,
    ...driveDate(5, 9, 15),
    bloodTypes: ["O+", "A-"],
    volunteers: 0,
    qr: 0,
  },
];

export function ensureGeoSchema(db) {
  addColumn(db, "donation_centers", "slug", "TEXT");
  addColumn(db, "donation_centers", "name_ar", "TEXT");
  addColumn(db, "donation_centers", "name_fr", "TEXT");
  addColumn(db, "donation_centers", "lat", "REAL");
  addColumn(db, "donation_centers", "lng", "REAL");
  addColumn(db, "donation_centers", "hours_json", "TEXT");

  addColumn(db, "sos_requests", "lat", "REAL");
  addColumn(db, "sos_requests", "lng", "REAL");
  addColumn(db, "sos_requests", "hospital_ar", "TEXT");
  addColumn(db, "sos_requests", "hospital_fr", "TEXT");

  db.exec(`
    CREATE TABLE IF NOT EXISTS mobile_drives (
      id TEXT PRIMARY KEY,
      wilaya TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      name_fr TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      blood_types TEXT NOT NULL,
      volunteer_count INTEGER DEFAULT 0,
      qr_check_in INTEGER DEFAULT 1,
      active INTEGER DEFAULT 1
    );
  `);
}

export function backfillGeoData(db) {
  const centers = db.prepare("SELECT id, name, wilaya, lat FROM donation_centers").all();
  const updateCenter = db.prepare(`
    UPDATE donation_centers
    SET slug = ?, name_ar = ?, name_fr = ?, lat = ?, lng = ?, hours_json = ?
    WHERE id = ?
  `);

  for (const row of centers) {
    if (row.lat != null) continue;
    const geo =
      CENTER_GEO.find((g) => g.match.test(row.name)) ??
      (() => {
        const w = WILAYA_COORDS[row.wilaya];
        if (!w) return null;
        return {
          slug: `center-${row.id}`,
          nameAr: row.name,
          nameFr: row.name,
          lat: w.lat + (row.id % 5) * 0.008,
          lng: w.lng + (row.id % 3) * 0.006,
          hours: { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] },
        };
      })();

    if (!geo) continue;
    updateCenter.run(
      geo.slug,
      geo.nameAr,
      geo.nameFr,
      geo.lat,
      geo.lng,
      JSON.stringify(geo.hours),
      row.id
    );
  }

  const sosRows = db.prepare("SELECT id, hospital, lat FROM sos_requests").all();
  const updateSos = db.prepare(`
    UPDATE sos_requests
    SET lat = ?, lng = ?, hospital_ar = ?, hospital_fr = ?
    WHERE id = ?
  `);

  for (const row of sosRows) {
    if (row.lat != null) continue;
    const geo = SOS_GEO[row.id];
    const fallback = WILAYA_COORDS.Alger;
    updateSos.run(
      geo?.lat ?? fallback.lat,
      geo?.lng ?? fallback.lng,
      geo?.hospitalAr ?? row.hospital,
      geo?.hospitalFr ?? row.hospital,
      row.id
    );
  }

  const driveCount = db.prepare("SELECT COUNT(*) AS c FROM mobile_drives").get().c;
  if (driveCount === 0) {
    const insert = db.prepare(`
      INSERT INTO mobile_drives (
        id, wilaya, name_ar, name_fr, lat, lng, start_at, end_at,
        blood_types, volunteer_count, qr_check_in, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const d of MOBILE_DRIVES_SEED) {
      insert.run(
        d.id,
        d.wilaya,
        d.nameAr,
        d.nameFr,
        d.lat,
        d.lng,
        d.start,
        d.end,
        JSON.stringify(d.bloodTypes),
        d.volunteers,
        d.qr
      );
    }
  }

  const extraWilayas = [
    ["Mostaganem", "مستغانم", "ok", null, JSON.stringify(["CHU Mostaganem"])],
    ["Mila", "ميلة", "ok", null, JSON.stringify(["CHU Mila"])],
    ["Skikda", "سكيكدة", "critical", "O+", JSON.stringify(["CHU Skikda"])],
  ];
  const insertW = db.prepare(
    "INSERT OR IGNORE INTO wilayas (name, name_ar, status, shortage, hospitals) VALUES (?, ?, ?, ?, ?)"
  );
  for (const row of extraWilayas) insertW.run(...row);
}

export function ensureGeoMigration(db) {
  ensureGeoSchema(db);
  backfillGeoData(db);
}
