import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapDonorRow, mapSosRow } from "../utils/donorMapper.js";
import { calculateMatchScore } from "../utils/matchScore.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

function sortByUrgency(requests) {
  return [...requests].sort((a, b) => {
    if (a.urgency === "critical" && b.urgency !== "critical") return -1;
    if (b.urgency === "critical" && a.urgency !== "critical") return 1;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });
}

router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM sos_requests WHERE active = 1 ORDER BY posted_at DESC")
    .all();
  res.json(rows.map(mapSosRow));
});

router.get("/urgent", (req, res) => {
  const db = getDb();
  const donorId = req.query.donorId || DEFAULT_DONOR_ID;

  const donorRow = db.prepare("SELECT * FROM donors WHERE id = ?").get(donorId);
  if (!donorRow) {
    return res.status(404).json({ error: "Donor not found", code: "DONOR_NOT_FOUND" });
  }

  const donor = mapDonorRow(donorRow);
  const rows = db
    .prepare("SELECT * FROM sos_requests WHERE active = 1")
    .all()
    .map(mapSosRow);

  const urgent = sortByUrgency(rows)[0] || null;
  const matchScore = urgent ? calculateMatchScore(urgent, donor) : 0;

  const responded = urgent
    ? Boolean(
        db
          .prepare(
            "SELECT 1 FROM sos_responses WHERE sos_id = ? AND donor_id = ?"
          )
          .get(urgent.id, donorId)
      )
    : false;

  res.json({ request: urgent, matchScore, responded, donorId });
});

router.post("/:id/respond", (req, res) => {
  const db = getDb();
  const sosId = req.params.id;
  const donorId = req.body?.donorId || DEFAULT_DONOR_ID;
  const eta = req.body?.eta || "30 min";

  const sos = db.prepare("SELECT * FROM sos_requests WHERE id = ?").get(sosId);
  if (!sos) {
    return res.status(404).json({ error: "SOS not found", code: "SOS_NOT_FOUND" });
  }

  const donorRow = db.prepare("SELECT * FROM donors WHERE id = ?").get(donorId);
  if (!donorRow) {
    return res.status(404).json({ error: "Donor not found", code: "DONOR_NOT_FOUND" });
  }

  const respondedAt = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO sos_responses (sos_id, donor_id, eta, responded_at)
      VALUES (?, ?, ?, ?)
    `).run(sosId, donorId, eta, respondedAt);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: "You already responded to this SOS",
        code: "ALREADY_RESPONDED",
      });
    }
    throw err;
  }

  res.status(201).json({
    ok: true,
    sosId,
    donorId,
    eta,
    respondedAt,
    message: "Response recorded. Hospital will be notified (simulated).",
  });
});

router.get("/:id/responses", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.*, d.name AS donor_name, d.blood_type
       FROM sos_responses r
       JOIN donors d ON d.id = r.donor_id
       WHERE r.sos_id = ?
       ORDER BY r.responded_at DESC`
    )
    .all(req.params.id);

  res.json(
    rows.map((r) => ({
      donorId: r.donor_id,
      donorName: r.donor_name,
      bloodType: r.blood_type,
      eta: r.eta,
      respondedAt: r.responded_at,
    }))
  );
});

export default router;
