import { Router } from "express";
import {
  getTransferRecommendations,
  getShortageAlerts,
  getExpiringForPanel,
  getDemandForecast,
  SEASONAL_FACTORS,
  broadcastShortageAlert,
  approveTransferRecommendation,
} from "../services/nexusOps.js";

const router = Router();

router.get("/recommendations", (_req, res) => {
  res.json(getTransferRecommendations());
});

router.get("/shortages", (_req, res) => {
  res.json(getShortageAlerts());
});

router.get("/expiring", (req, res) => {
  const hours = parseInt(req.query.hours, 10) || 72;
  res.json(getExpiringForPanel(hours));
});

router.get("/forecast", (req, res) => {
  const data = getDemandForecast(req.query.hospitalId ?? "h1");
  res.json(data);
});

router.get("/seasonal-factors", (_req, res) => {
  res.json(SEASONAL_FACTORS);
});

router.post("/broadcast-alert", (req, res) => {
  res.json(broadcastShortageAlert(req.body ?? {}));
});

router.post("/recommendations/:id/approve", (req, res) => {
  const result = approveTransferRecommendation(req.params.id, req.body ?? {});
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

export default router;
