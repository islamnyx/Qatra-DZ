import { Router } from "express";
import { getDb } from "../db/database.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

function mapFeedRow(row, donorRegistered = false) {
  return {
    id: row.id,
    title: row.title,
    titleFr: row.title_fr,
    description: row.description,
    descriptionFr: row.description_fr,
    date: row.feed_date,
    tag: row.tag,
    tagColor: row.tag_color,
    isCampaign: Boolean(row.is_campaign),
    daysLeft: row.days_left,
    campaignInterest: row.campaign_interest,
    donorRegistered,
  };
}

router.get("/", (req, res) => {
  const db = getDb();
  const donorId = req.query.donorId || DEFAULT_DONOR_ID;

  const rows = db
    .prepare("SELECT * FROM news_feed ORDER BY feed_date DESC")
    .all();

  const registered = new Set(
    db
      .prepare("SELECT feed_id FROM campaign_registrations WHERE donor_id = ?")
      .all(donorId)
      .map((r) => r.feed_id)
  );

  res.json(
    rows.map((row) =>
      mapFeedRow(row, row.is_campaign ? registered.has(row.id) : false)
    )
  );
});

router.post("/campaign/:id/interest", (req, res) => {
  const db = getDb();
  const feedId = Number(req.params.id);
  const donorId = req.body?.donorId || DEFAULT_DONOR_ID;

  const feed = db.prepare("SELECT * FROM news_feed WHERE id = ?").get(feedId);
  if (!feed || !feed.is_campaign) {
    return res.status(404).json({
      error: "Campaign not found",
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  const existing = db
    .prepare(
      "SELECT 1 FROM campaign_registrations WHERE feed_id = ? AND donor_id = ?"
    )
    .get(feedId, donorId);

  if (existing) {
    const updated = db.prepare("SELECT campaign_interest FROM news_feed WHERE id = ?").get(feedId);
    return res.json({
      ok: true,
      alreadyRegistered: true,
      campaignInterest: updated.campaign_interest,
    });
  }

  const registeredAt = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO campaign_registrations (feed_id, donor_id, registered_at) VALUES (?, ?, ?)"
    ).run(feedId, donorId, registeredAt);
    db.prepare(
      "UPDATE news_feed SET campaign_interest = campaign_interest + 1 WHERE id = ?"
    ).run(feedId);
  });
  tx();

  const updated = db.prepare("SELECT campaign_interest FROM news_feed WHERE id = ?").get(feedId);
  res.status(201).json({
    ok: true,
    campaignInterest: updated.campaign_interest,
  });
});

export default router;
