import { Router } from "express";
import { getDonorMapPayload } from "../services/donorMap.js";

const router = Router();

router.get("/donor", (req, res) => {
  const lat = req.query.lat != null ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng != null ? parseFloat(req.query.lng) : null;

  if ((req.query.lat != null && Number.isNaN(lat)) || (req.query.lng != null && Number.isNaN(lng))) {
    return res.status(400).json({
      error: "lat and lng must be valid numbers",
      code: "VALIDATION_ERROR",
    });
  }

  res.json(getDonorMapPayload(lat, lng));
});

export default router;
