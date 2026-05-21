import { Router } from "express";
import {
  checkEligibility,
  findNearestCenters,
  getDonationMilestones,
  calculateNextDonationDate,
  scheduleReminder,
  checkInventory,
  checkInventoryAll,
  findNearbyInventory,
  getLeaderboard,
  activateEmergency,
  coordinateTransfer,
  getExpiringUnits,
  contactRareBloodDonors,
  prescreeningForm,
  runPrescreening,
} from "../services/bloodTools.js";

const router = Router();
const DEFAULT_DONOR_ID = "DZ-001";

router.post("/eligibility/check", (req, res) => {
  const result = checkEligibility(req.body ?? {});
  res.json(result);
});

router.get("/centers", (req, res) => {
  const { wilaya } = req.query;
  if (!wilaya) {
    return res.status(400).json({ error: "wilaya query required", code: "VALIDATION_ERROR" });
  }
  res.json(findNearestCenters(wilaya));
});

router.get("/milestones/:donorId", (req, res) => {
  const result = getDonationMilestones(req.params.donorId);
  if (result.error) return res.status(404).json({ error: "Donor not found", code: result.error });
  res.json(result);
});

router.get("/next-donation", (req, res) => {
  const { lastDonation } = req.query;
  if (!lastDonation) {
    return res.status(400).json({ error: "lastDonation query required (YYYY-MM-DD)", code: "VALIDATION_ERROR" });
  }
  res.json(calculateNextDonationDate(lastDonation));
});

router.post("/reminders", (req, res) => {
  const { donorId = DEFAULT_DONOR_ID, lastDonation } = req.body ?? {};
  if (!lastDonation) {
    return res.status(400).json({ error: "lastDonation required", code: "VALIDATION_ERROR" });
  }
  const result = scheduleReminder(donorId, lastDonation);
  if (result.error) return res.status(400).json({ error: result.error, code: result.error });
  res.status(201).json(result);
});

router.get("/inventory", (req, res) => {
  const { wilaya, bloodType } = req.query;
  if (!wilaya) {
    return res.status(400).json({ error: "wilaya required", code: "VALIDATION_ERROR" });
  }
  if (bloodType) {
    const result = checkInventory(bloodType, wilaya);
    if (result.error) return res.status(400).json({ error: result.error, code: result.error });
    return res.json(result);
  }
  res.json(checkInventoryAll(wilaya));
});

router.get("/inventory/nearby", (req, res) => {
  const { wilaya, bloodType } = req.query;
  if (!wilaya || !bloodType) {
    return res.status(400).json({ error: "wilaya and bloodType required", code: "VALIDATION_ERROR" });
  }
  res.json(findNearbyInventory(bloodType, wilaya));
});

router.get("/expiring", (req, res) => {
  const { wilaya, days = "7" } = req.query;
  if (!wilaya) {
    return res.status(400).json({ error: "wilaya required", code: "VALIDATION_ERROR" });
  }
  res.json(getExpiringUnits(wilaya, parseInt(days, 10) || 7));
});

router.post("/emergency", (req, res) => {
  const { emergencyType = "shortage", location } = req.body ?? {};
  if (!location) {
    return res.status(400).json({ error: "location required", code: "VALIDATION_ERROR" });
  }
  res.json(activateEmergency(emergencyType, location));
});

router.post("/transfer", (req, res) => {
  const { bloodType, fromWilaya, toWilaya } = req.body ?? {};
  if (!bloodType || !fromWilaya || !toWilaya) {
    return res.status(400).json({
      error: "bloodType, fromWilaya, toWilaya required",
      code: "VALIDATION_ERROR",
    });
  }
  res.json(coordinateTransfer(bloodType, fromWilaya, toWilaya));
});

router.post("/rare-donors", (req, res) => {
  const { bloodType } = req.body ?? {};
  if (!bloodType) {
    return res.status(400).json({ error: "bloodType required", code: "VALIDATION_ERROR" });
  }
  res.json(contactRareBloodDonors(bloodType));
});

router.get("/prescreening", (_req, res) => {
  res.json(prescreeningForm());
});

router.post("/prescreening", (req, res) => {
  res.json(runPrescreening(req.body?.answers ?? req.body ?? {}));
});

router.get("/leaderboard", (req, res) => {
  res.json(getLeaderboard(req.query.region ?? "national"));
});

export default router;
