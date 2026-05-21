import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SqliteCompatDatabase } from "./sqliteCompat.js";
import { seedDatabase } from "./seed.js";
import { ensureExtendedSeed } from "./extendedSeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "qatra.db");

let db;

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new SqliteCompatDatabase(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
    seedDatabase(db);
    ensureExtendedSeed(db);
  }
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS donors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      last_donation TEXT,
      total_donations INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      family_circle_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT DEFAULT 'award',
      color TEXT DEFAULT 'red',
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS donation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id TEXT NOT NULL,
      donation_date TEXT NOT NULL,
      hospital TEXT NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relation_ar TEXT NOT NULL,
      relation_fr TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      alert_order INTEGER NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS sos_requests (
      id TEXT PRIMARY KEY,
      blood_type TEXT NOT NULL,
      hospital TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      urgency TEXT NOT NULL,
      posted_at TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sos_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sos_id TEXT NOT NULL,
      donor_id TEXT NOT NULL,
      eta TEXT NOT NULL,
      responded_at TEXT NOT NULL,
      UNIQUE (sos_id, donor_id),
      FOREIGN KEY (sos_id) REFERENCES sos_requests(id),
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS wilayas (
      name TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      status TEXT NOT NULL,
      shortage TEXT,
      hospitals TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_feed (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      title_fr TEXT,
      description TEXT NOT NULL,
      description_fr TEXT,
      feed_date TEXT NOT NULL,
      tag TEXT NOT NULL,
      tag_color TEXT NOT NULL,
      is_campaign INTEGER DEFAULT 0,
      days_left INTEGER,
      campaign_interest INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS campaign_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      donor_id TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      UNIQUE (feed_id, donor_id),
      FOREIGN KEY (feed_id) REFERENCES news_feed(id),
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      donor_id TEXT PRIMARY KEY,
      rank_order INTEGER NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    );
  `);
}
