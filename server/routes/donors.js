import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapDonorRow, mapFamilyRow } from "../utils/donorMapper.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

function getDonorOr404(db, id, res) {
  const row = db.prepare("SELECT * FROM donors WHERE id = ?").get(id);
  if (!row) {
    res.status(404).json({ error: "Donor not found", code: "DONOR_NOT_FOUND" });
    return null;
  }
  return row;
}

router.get("/:id", (req, res) => {
  const db = getDb();
  const row = getDonorOr404(db, req.params.id, res);
  if (!row) return;

  const donor = mapDonorRow(row);
  const badges = db
    .prepare("SELECT name, icon, color FROM badges WHERE donor_id = ?")
    .all(req.params.id);
  const donationHistory = db
    .prepare(
      "SELECT donation_date AS date, hospital FROM donation_history WHERE donor_id = ? ORDER BY donation_date DESC"
    )
    .all(req.params.id);

  res.json({
    ...donor,
    badges: badges.map((b) => b.name),
    badgeDetails: badges,
    donationHistory,
  });
});

router.get("/:id/passport", (req, res) => {
  const db = getDb();
  const row = getDonorOr404(db, req.params.id, res);
  if (!row) return;

  const donor = mapDonorRow(row);
  res.json({
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
  });
});

router.get("/:id/family", (req, res) => {
  const db = getDb();
  const row = getDonorOr404(db, req.params.id, res);
  if (!row) return;

  const members = db
    .prepare(
      "SELECT * FROM family_members WHERE donor_id = ? ORDER BY alert_order ASC"
    )
    .all(req.params.id)
    .map(mapFamilyRow);

  res.json({
    circleActive: Boolean(row.family_circle_active),
    members,
  });
});

router.patch("/:id/family/circle", (req, res) => {
  const db = getDb();
  const row = getDonorOr404(db, req.params.id, res);
  if (!row) return;

  const active = req.body?.active !== false ? 1 : 0;
  db.prepare("UPDATE donors SET family_circle_active = ? WHERE id = ?").run(
    active,
    req.params.id
  );

  res.json({ circleActive: Boolean(active) });
});

router.post("/:id/family", (req, res) => {
  const db = getDb();
  if (!getDonorOr404(db, req.params.id, res)) return;

  const { name, relationAr, relationFr, bloodType, wilaya } = req.body || {};
  if (!name || !bloodType || !wilaya) {
    return res.status(400).json({
      error: "name, bloodType, and wilaya are required",
      code: "VALIDATION_ERROR",
    });
  }

  const maxOrder = db
    .prepare(
      "SELECT COALESCE(MAX(alert_order), 0) AS m FROM family_members WHERE donor_id = ?"
    )
    .get(req.params.id).m;

  const id = `F${Date.now()}`;
  db.prepare(`
    INSERT INTO family_members (id, donor_id, name, relation_ar, relation_fr, blood_type, wilaya, alert_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.params.id,
    name,
    relationAr || "قريب",
    relationFr || "Proche",
    bloodType,
    wilaya,
    maxOrder + 1
  );

  const member = mapFamilyRow(
    db.prepare("SELECT * FROM family_members WHERE id = ?").get(id)
  );
  res.status(201).json(member);
});

router.post("/:id/family/demo-alert", (req, res) => {
  const db = getDb();
  const row = getDonorOr404(db, req.params.id, res);
  if (!row) return;

  if (!row.family_circle_active) {
    return res.status(400).json({
      error: "Family circle is disabled",
      code: "CIRCLE_DISABLED",
    });
  }

  const members = db
    .prepare(
      "SELECT name, blood_type, alert_order FROM family_members WHERE donor_id = ? ORDER BY alert_order ASC"
    )
    .all(req.params.id);

  res.json({
    ok: true,
    message: "Demo alert sent to family circle (simulated)",
    alertedCount: members.length,
    members,
  });
});

router.get("/", (_req, res) => {
  res.json({
    defaultDonorId: DEFAULT_DONOR_ID,
    hint: "Use GET /api/donors/DZ-001 for the demo user",
  });
});

export default router;
