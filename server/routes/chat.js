import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapDonorRow } from "../utils/donorMapper.js";
import { getDamBotReply, quickPrompts } from "../utils/damBot.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

router.get("/prompts", (req, res) => {
  const lang = req.query.lang === "fr" ? "fr" : "ar";
  res.json({ prompts: quickPrompts[lang] });
});

router.post("/", (req, res) => {
  const db = getDb();
  const { message, lang = "ar", donorId = DEFAULT_DONOR_ID } = req.body || {};

  if (!message?.trim()) {
    return res.status(400).json({
      error: "message is required",
      code: "VALIDATION_ERROR",
    });
  }

  const row = db.prepare("SELECT * FROM donors WHERE id = ?").get(donorId);
  if (!row) {
    return res.status(404).json({ error: "Donor not found", code: "DONOR_NOT_FOUND" });
  }

  const donor = mapDonorRow(row);
  const reply = getDamBotReply(message, lang, donor);

  res.json({ reply, lang, donorId });
});

export default router;
