/** Seeds extended BloodSync tables (runs even when donors already exist). */
import { ensureGeoMigration } from "./geoMigration.js";

const INVENTORY_DEFAULTS = {
  Alger: { "O-": 5, "O+": 12, "A-": 3, "A+": 8, "B-": 2, "B+": 7, "AB-": 1, "AB+": 4 },
  Oran: { "O-": 8, "O+": 15, "A-": 6, "A+": 10, "B-": 4, "B+": 9, "AB-": 2, "AB+": 5 },
  Constantine: { "O-": 4, "O+": 9, "A-": 5, "A+": 7, "B-": 3, "B+": 6, "AB-": 1, "AB+": 3 },
  Blida: { "O-": 6, "O+": 11, "A-": 4, "A+": 9, "B-": 5, "B+": 8, "AB-": 2, "AB+": 4 },
  Annaba: { "O-": 3, "O+": 8, "A-": 2, "A+": 6, "B-": 2, "B+": 5, "AB-": 1, "AB+": 2 },
  "Sétif": { "O-": 7, "O+": 13, "A-": 5, "A+": 9, "B-": 4, "B+": 8, "AB-": 2, "AB+": 5 },
  "Tizi Ouzou": { "O-": 5, "O+": 10, "A-": 4, "A+": 7, "B-": 3, "B+": 6, "AB-": 1, "AB+": 3 },
  "Béjaïa": { "O-": 4, "O+": 9, "A-": 3, "A+": 6, "B-": 3, "B+": 5, "AB-": 1, "AB+": 2 },
};

const CENTERS = [
  ["Alger", "Centre National de Transfusion Sanguine", "Alger Centre", "Open 24/7 emergencies", "021 23 45 67", "Multiple mobile drives daily"],
  ["Alger", "CHU Mustapha Pacha", "Mustapha", "Mon–Sat 8:00–18:00", "021 67 11 11", "Thursday mobile — Bab El Oued"],
  ["Oran", "EHU Oran", "Oran", "Mon–Sat 8:00–18:00", "041 33 66 77", "Place d'Armes — Thursday"],
  ["Constantine", "CHU Constantine", "Constantine", "Daily 8:00–20:00", "031 44 55 66", "University — Wednesday"],
  ["Blida", "CHU Blida Frantz Fanon", "Blida", "Daily 9:00–17:00", "023 41 23 45", "Bab El Oued — Tuesday"],
  ["Annaba", "CHU Annaba", "Annaba", "Daily 8:00–17:00", "038 87 65 43", "City center — Friday"],
  ["Sétif", "CHU Sétif", "Sétif", "Mon–Sat 8:00–16:00", "036 12 34 56", "Wilaya plaza — monthly"],
  ["Tizi Ouzou", "EHSU Tizi Ouzou", "Tizi Ouzou", "Mon–Fri 8:00–16:00", "026 55 44 33", "Mkira campus drive"],
  ["Béjaïa", "CHU Béjaïa", "Béjaïa", "Mon–Sat 8:00–17:00", "034 21 09 87", "Port area — Saturday"],
];

const EXPIRING = [
  ["Alger", "CHU Mustapha Pacha", "O+", 3, 5],
  ["Alger", "EHSU Bab El Oued", "A-", 2, 6],
  ["Oran", "EHU Oran", "B-", 1, 3],
  ["Constantine", "CHU Constantine", "AB-", 2, 4],
  ["Blida", "CHU Blida", "O+", 2, 7],
];

export function ensureExtendedSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS donation_centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wilaya TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      hours TEXT,
      phone TEXT,
      mobile_drive TEXT
    );

    CREATE TABLE IF NOT EXISTS blood_inventory (
      wilaya TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      units INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (wilaya, blood_type)
    );

    CREATE TABLE IF NOT EXISTS blood_units_expiring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wilaya TEXT NOT NULL,
      hospital TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      units INTEGER NOT NULL,
      expires_in_days INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      channel TEXT DEFAULT 'app',
      last_donation TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS cross_region_transfers (
      id TEXT PRIMARY KEY,
      blood_type TEXT NOT NULL,
      from_wilaya TEXT NOT NULL,
      to_wilaya TEXT NOT NULL,
      units INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  try {
    db.exec(`ALTER TABLE donors ADD COLUMN is_rare_donor INTEGER DEFAULT 0`);
  } catch {
    /* column exists */
  }
}

export function ensureExtendedSeed(db) {
  ensureExtendedSchema(db);

  const invCount = db.prepare("SELECT COUNT(*) AS c FROM blood_inventory").get().c;
  if (invCount === 0) {
    const insertInv = db.prepare(
      "INSERT INTO blood_inventory (wilaya, blood_type, units) VALUES (?, ?, ?)"
    );
    const tx = db.transaction(() => {
      for (const [wilaya, types] of Object.entries(INVENTORY_DEFAULTS)) {
        for (const [bt, units] of Object.entries(types)) {
          insertInv.run(wilaya, bt, units);
        }
      }
    });
    tx();
  }

  const centerCount = db.prepare("SELECT COUNT(*) AS c FROM donation_centers").get().c;
  if (centerCount === 0) {
    const insert = db.prepare(
      "INSERT INTO donation_centers (wilaya, name, address, hours, phone, mobile_drive) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const row of CENTERS) insert.run(...row);
  }

  const expCount = db.prepare("SELECT COUNT(*) AS c FROM blood_units_expiring").get().c;
  if (expCount === 0) {
    const insert = db.prepare(
      "INSERT INTO blood_units_expiring (wilaya, hospital, blood_type, units, expires_in_days) VALUES (?, ?, ?, ?, ?)"
    );
    for (const row of EXPIRING) insert.run(...row);
  }

  db.prepare(`UPDATE donors SET is_rare_donor = 1 WHERE blood_type IN ('O-', 'AB-')`).run();

  const wilayaExtras = [
    ["Tizi Ouzou", "تيزي وزو", "ok", null, JSON.stringify(["EHSU Tizi Ouzou"])],
    ["Béjaïa", "بجاية", "ok", null, JSON.stringify(["CHU Béjaïa"])],
  ];
  const insertW = db.prepare(
    "INSERT OR IGNORE INTO wilayas (name, name_ar, status, shortage, hospitals) VALUES (?, ?, ?, ?, ?)"
  );
  for (const row of wilayaExtras) insertW.run(...row);

  ensureGeoMigration(db);
}
