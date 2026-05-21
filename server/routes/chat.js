import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapDonorRow } from "../utils/donorMapper.js";
import { runChatTurn, getWelcomeMessage } from "../services/chatConversation.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

router.get("/welcome", (req, res) => {
  const db = getDb();
  const lang = req.query.lang === "fr" ? "fr" : req.query.lang === "en" ? "en" : "ar";
  const donorId = req.query.donorId || DEFAULT_DONOR_ID;
  const row = db.prepare("SELECT * FROM donors WHERE id = ?").get(donorId);
  if (!row) return res.status(404).json({ error: "Donor not found", code: "DONOR_NOT_FOUND" });
  const donor = mapDonorRow(row);
  const welcome = getWelcomeMessage(lang, donor);
  res.json({ ...welcome, lang, donorId });
});

router.get("/prompts", (req, res) => {
  const lang = req.query.lang === "fr" ? "fr" : req.query.lang === "en" ? "en" : "ar";
  const db = getDb();
  const row = db.prepare("SELECT * FROM donors WHERE id = ?").get(DEFAULT_DONOR_ID);
  const donor = row ? mapDonorRow(row) : null;
  const welcome = getWelcomeMessage(lang, donor);
  res.json({ prompts: welcome.suggestions });
});

router.post("/", (req, res) => {
  const db = getDb();
  const { message, lang = "ar", donorId = DEFAULT_DONOR_ID, history = [] } = req.body || {};

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
  const normalizedHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.content || m.text))
        .slice(-12)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: (m.content || m.text || "").trim(),
          intent: m.intent,
        }))
    : [];

  const result = runChatTurn({
    message: message.trim(),
    lang,
    donor,
    history: normalizedHistory,
  });

  res.json({
    reply: result.reply,
    suggestions: result.suggestions,
    intent: result.intent,
    lang,
    donorId,
    context: result.context,
  });
});

export default router;
