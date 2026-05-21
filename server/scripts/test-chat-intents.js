/**
 * Validates DamBot intent routing for user phrase samples.
 * Run: node scripts/test-chat-intents.js
 */
import { detectIntent } from "../services/chatIntents.js";
import { getDb } from "../db/database.js";
import { getDamBotReply } from "../utils/damBot.js";
import { mapDonorRow } from "../utils/donorMapper.js";

const SAMPLES = [
  ["Can I donate if I weigh 48kg?", "eligibility"],
  ["Where can I donate in Algiers?", "centers"],
  ["I donated 3 times, what badges do I have?", "milestones"],
  ["When can I donate again?", "next_donation"],
  ["My last donation was 2026-02-15", "next_donation"],
  ["I have O+ blood", "blood_type"],
  ["Check O- inventory in Oran", "inventory"],
  ["Emergency! Need O- blood in Oran", "emergency"],
  ["Show me the national donor leaderboard", "leaderboard"],
  ["Transfer O- blood from Oran to Alger", "transfer"],
  ["Medical screening for blood donation", "prescreening"],
  ["How to use the Qatra app?", "app_help"],
  ["Why should I donate blood?", "general_info"],
  ["Schedule a reminder for my next donation", "reminder"],
  ["Show expiring blood units in Oran", "expiring"],
];

getDb();
const row = getDb().prepare("SELECT * FROM donors WHERE id = ?").get("DZ-001");
const donor = mapDonorRow(row);

let pass = 0;
for (const [phrase, expected] of SAMPLES) {
  const got = detectIntent(phrase);
  const ok = got === expected;
  console.log(`${ok ? "✅" : "❌"} "${phrase.slice(0, 40)}..." → ${got} (expected ${expected})`);
  if (ok) pass++;
  const reply = getDamBotReply(phrase, "en", donor);
  if (!reply || reply.length < 10) console.log("   ⚠️ empty reply");
}

console.log(`\n${pass}/${SAMPLES.length} intent matches\n`);
process.exit(pass === SAMPLES.length ? 0 : 1);
