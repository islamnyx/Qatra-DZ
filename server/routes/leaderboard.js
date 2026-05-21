import { Router } from "express";
import { getLeaderboard } from "../services/bloodTools.js";

const router = Router();

router.get("/", (req, res) => {
  const data = getLeaderboard(req.query.region ?? "national");
  res.json(data.leaders);
});

export default router;
