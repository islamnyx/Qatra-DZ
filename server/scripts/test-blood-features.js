/**
 * Smoke test for all 12 BloodSync features.
 * Run: node scripts/test-blood-features.js
 * Requires server running OR uses getDb directly.
 */
import { getDb } from "../db/database.js";
import {
  checkEligibility,
  findNearestCenters,
  getDonationMilestones,
  calculateNextDonationDate,
  scheduleReminder,
  checkInventory,
  findNearbyInventory,
  getLeaderboard,
  activateEmergency,
  coordinateTransfer,
  getExpiringUnits,
  contactRareBloodDonors,
  prescreeningForm,
  runPrescreening,
} from "../services/bloodTools.js";

const tests = [];

function assert(name, condition, detail = "") {
  tests.push({ name, ok: Boolean(condition), detail });
  const icon = condition ? "✅" : "❌";
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

function run() {
  getDb();
  console.log("\n=== BloodSync Feature Smoke Tests ===\n");

  const e1 = checkEligibility({ weightKg: 48 });
  assert("1 Eligibility — low weight deferred", e1.status === "deferred");

  const e2 = checkEligibility({ weightKg: 70 });
  assert("1 Eligibility — healthy weight", e2.status === "eligible");

  const centers = findNearestCenters("Oran");
  assert("2 Centers — Oran", centers.centers?.length > 0, `${centers.centers.length} centers`);

  const centers9 = findNearestCenters("Tizi Ouzou");
  assert("2 Centers — Tizi Ouzou", centers9.centers?.length > 0);

  const m = getDonationMilestones("DZ-001");
  assert("3 Milestones", m.earnedBadges?.length >= 3, m.earnedBadges.join(", "));

  const next = calculateNextDonationDate("2025-03-10");
  assert("4 Next donation — 56 day rule", next.minDaysBetween === 56);

  const inv = checkInventory("O-", "Alger");
  assert("5 Inventory O- Alger", inv.units >= 0, `units=${inv.units}`);

  const rem = scheduleReminder("DZ-001", "2025-03-10");
  assert("6 Reminder scheduled", rem.remindAt != null);

  const lb = getLeaderboard("national");
  assert("7 Leaderboard national", lb.leaders.length >= 3);

  const em = activateEmergency("shortage", "Constantine");
  assert("8 Emergency", em.protocol?.length >= 3);

  const tr = coordinateTransfer("O+", "Oran", "Alger");
  assert("9 Transfer", tr.status === "in_transit" || tr.status === "blocked");

  const ex = getExpiringUnits("Alger", 7);
  assert("10 Expiring units", Array.isArray(ex.units));

  const rare = contactRareBloodDonors("AB-");
  assert("11 Rare donors", rare.protocolActivated === true);

  const form = prescreeningForm();
  assert("12 Pre-screening form", form.steps?.length === 5);

  const ps = runPrescreening({
    feelsHealthy: true,
    highRiskMeds: false,
    malariaTravel: false,
    recentAlcohol: false,
    meetsWeight: true,
  });
  assert("12 Pre-screening pass", ps.status === "ready");

  const nearby = findNearbyInventory("O-", "Alger");
  assert("Nearby inventory", nearby.local != null);

  const passed = tests.filter((t) => t.ok).length;
  console.log(`\n=== ${passed}/${tests.length} passed ===\n`);
  if (passed !== tests.length) process.exit(1);
}

run();
