import { getDb } from "../db/database.js";
import { mapDonorRow } from "./donorMapper.js";
import { evaluateEligibility } from "../services/eligibilityRules.js";
import {
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
  resolveWilaya,
} from "../services/bloodTools.js";

export const quickPrompts = {
  ar: [
    "هل أنا مؤهل للتبرع؟",
    "أقرب مركز تبرع في الجزائر",
    "مخزون O- في وهران",
    "متى يمكنني التبرع مرة أخرى؟",
    "شاراتي وإنجازاتي",
    "لوحة المتصدرين",
    "استبيان ما قبل التبرع",
    "تنبيه وحدات منتهية الصلاحية",
  ],
  fr: [
    "Suis-je éligible ?",
    "Centre le plus proche à Alger",
    "Stock O- à Oran",
    "Quand puis-je donner à nouveau ?",
    "Mes badges et jalons",
    "Classement des donneurs",
    "Questionnaire pré-don",
    "Alerte unités expirantes",
  ],
};

const BLOOD_RE = /\b(o\+|o-|a\+|a-|b\+|b-|ab\+|ab-)\b/i;
const DATE_RE = /(\d{4}-\d{2}-\d{2})/;
const WEIGHT_RE = /(\d+)\s*kg/i;
const MONTHS_RE = /(\d+)\s*month/i;

function pickLang(lang) {
  return lang === "fr" ? "fr" : "ar";
}

function t(lang, ar, fr, en) {
  const l = pickLang(lang);
  if (l === "fr") return fr;
  if (l === "ar") return ar;
  return en;
}

function extractWilaya(text) {
  const cities = [
    "algiers",
    "alger",
    "oran",
    "constantine",
    "blida",
    "annaba",
    "setif",
    "sétif",
    "tizi ouzou",
    "tizi",
    "bejaia",
    "béjaïa",
    "bejaïa",
  ];
  const lower = text.toLowerCase();
  for (const c of cities) {
    if (lower.includes(c)) return resolveWilaya(c);
  }
  return null;
}

function detectIntent(text) {
  const q = text.toLowerCase();

  if (/prescreen|pre-screen|questionnaire|استبيان|pré-don|pre-don/i.test(q)) return "prescreening";
  if (/expir|منته|expirant/i.test(q)) return "expiring";
  if (/rare|نادر|ab-|bombay/i.test(q) && /donor|متبرع|donneur|blood|دم/i.test(q)) return "rare";
  if (/transfer|نقل|transfert|cross.?region/i.test(q)) return "transfer";
  if (/emergency|طوارئ|urgence|disaster|زلزال|accident/i.test(q)) return "emergency";
  if (/leaderboard|متصدر|classement|ranking|top donor/i.test(q)) return "leaderboard";
  if (/remind|تذكير|rappel|schedule reminder/i.test(q)) return "reminder";
  if (/milestone|badge|شارة|إنجاز|jalon/i.test(q)) return "milestones";
  if (/next donation|متى.*تبرع|donner à nouveau|eligible date|56|90 day/i.test(q) || DATE_RE.test(q)) {
    if (/next|متى|again|nouveau|date/i.test(q) || DATE_RE.test(q)) return "next_donation";
  }
  if (/inventory|stock|مخزون|وحدات|units/i.test(q) && (BLOOD_RE.test(q) || /all|كل/i.test(q))) return "inventory";
  if (/nearby|قريب|proche|low stock/i.test(q)) return "nearby_inventory";
  if (/centre|center|مركز|drive|أين أتبرع|where.*donat|proche/i.test(q)) return "centers";
  if (/eligible|مؤهل|éligib|can i donate|هل أستطيع|tattoo|وشم|weight|وزن|kg|medication|دواء|pregnant|حامل/i.test(q)) {
    return "eligibility";
  }
  if (/inventory|stock|مخزون/i.test(q)) return "inventory_all";

  return "general";
}

function parseEligibilityFromText(text) {
  const payload = {};
  const wm = text.match(WEIGHT_RE);
  if (wm) payload.weightKg = parseInt(wm[1], 10);
  const mm = text.match(MONTHS_RE);
  if (mm && /tattoo|pierc|وشم|ثقب/i.test(text)) payload.tattooMonthsAgo = parseInt(mm[1], 10);
  if (/pregnant|حامل|enceinte/i.test(text)) payload.pregnant = true;
  if (/medication|medicine|دواء|médicament/i.test(text)) payload.onMedication = true;
  if (/illness|مرض|maladie/i.test(text)) payload.recentIllness = true;
  if (/surgery|عملية|chirurgie/i.test(text)) payload.recentSurgery = true;
  const ageM = text.match(/\bage\s*(\d+)/i);
  if (ageM) payload.age = parseInt(ageM[1], 10);
  return payload;
}

function formatEligibility(result, lang) {
  const statusLabel = t(
    lang,
    result.status === "eligible" ? "✅ مؤهل" : result.status === "needs_review" ? "⚠️ مراجعة طبية" : "❌ مؤجل",
    result.status === "eligible" ? "✅ Éligible" : result.status === "needs_review" ? "⚠️ Avis médical" : "❌ Reporté",
    result.status
  );
  let msg = statusLabel + "\n";
  for (const r of result.reasons) {
    msg += "• " + (lang === "fr" ? r.messageFr : r.messageAr) + "\n";
  }
  for (const w of result.warnings) {
    msg += "• " + (lang === "fr" ? w.messageFr : w.messageAr) + "\n";
  }
  msg += t(lang, result.nextStep, result.nextStep, result.nextStep);
  return msg.trim();
}

function formatCenters(data, lang) {
  if (!data.centers?.length) {
    return t(lang, data.note ?? "لم يُعثر على مراكز.", data.note ?? "Aucun centre.", data.note ?? "No centers.");
  }
  let msg = t(lang, `🏥 مراكز التبرع — ${data.wilaya}:`, `🏥 Centres — ${data.wilaya}:`, `🏥 Centers — ${data.wilaya}:`) + "\n";
  for (const c of data.centers.slice(0, 3)) {
    msg += `\n📍 ${c.name}\n🕒 ${c.hours}\n☎️ ${c.phone || "3030"}`;
    if (c.mobileDrive) msg += `\n🚐 ${c.mobileDrive}`;
  }
  return msg.trim();
}

function formatInventory(inv, lang) {
  if (inv.inventory) {
    let msg = t(lang, `📊 مخزون ${inv.wilaya}:`, `📊 Stock ${inv.wilaya}:`, `📊 Inventory ${inv.wilaya}:`) + "\n";
    for (const row of inv.inventory) {
      msg += `${row.bloodType}: ${row.units} (${row.status})\n`;
    }
    return msg.trim();
  }
  return t(
    lang,
    `📊 ${inv.bloodType} في ${inv.wilaya}: ${inv.units} وحدة — ${inv.status}`,
    `📊 ${inv.bloodType} à ${inv.wilaya}: ${inv.units} unités — ${inv.status}`,
    `📊 ${inv.bloodType} in ${inv.wilaya}: ${inv.units} units — ${inv.status}`
  );
}

export function getDamBotReply(text, lang = "ar", donor) {
  if (!donor) {
    return lang === "fr" ? "DamBot indisponible." : "DamBot غير متاح.";
  }

  const intent = detectIntent(text);
  const wilaya = extractWilaya(text) || donor.wilaya;
  const bloodMatch = text.match(BLOOD_RE);
  const bloodType = bloodMatch ? bloodMatch[0].toUpperCase() : donor.bloodType;

  try {
    switch (intent) {
      case "eligibility": {
        const payload = parseEligibilityFromText(text);
        if (!payload.weightKg && donor) payload.lastDonation = donor.lastDonation;
        const result = evaluateEligibility(payload);
        if (Object.keys(payload).length <= 1 && donor.isEligible !== undefined) {
          const prefix = donor.isEligible
            ? t(lang, `نعم ${donor.name.split(" ")[0]}! أنت مؤهل اليوم.`, `Oui ${donor.name.split(" ")[0]}! Éligible aujourd'hui.`, `Yes, eligible today.`)
            : t(lang, `ليس بعد — ${donor.daysUntilEligible} يوم متبقي.`, `Pas encore — ${donor.daysUntilEligible} jours.`, `Not yet — ${donor.daysUntilEligible} days.`);
          if (Object.keys(payload).length <= 1) return prefix + "\n" + formatEligibility(result, lang);
        }
        return formatEligibility(result, lang);
      }

      case "centers":
        return formatCenters(findNearestCenters(wilaya), lang);

      case "milestones": {
        const m = getDonationMilestones(donor.id);
        const badges = m.earnedBadges.join(", ") || t(lang, "لا شارات بعد", "Pas encore de badges", "No badges yet");
        const next = m.nextMilestone
          ? t(lang, `الهدف التالي: ${m.nextMilestone.name} (${m.nextMilestone.donationsNeeded} تبرعات)`, `Prochain: ${m.nextMilestone.name}`, `Next: ${m.nextMilestone.name}`)
          : t(lang, "أعلى مستوى! 💎", "Niveau max! 💎", "Max level!");
        return t(
          lang,
          `🏆 ${m.totalDonations} تبرعات — ${badges}\n${next}\n💪 ~${m.livesSavedEstimate} lives saved`,
          `🏆 ${m.totalDonations} dons — ${badges}\n${next}`,
          `🏆 ${m.totalDonations} donations — ${badges}\n${next}`
        );
      }

      case "next_donation": {
        const dm = text.match(DATE_RE);
        const last = dm ? dm[1] : donor.lastDonation;
        const calc = calculateNextDonationDate(last);
        if (calc.isEligible) {
          return t(lang, `✅ يمكنك التبرع الآن! آخر تبرع: ${last}`, `✅ Vous pouvez donner! Dernier don: ${last}`, `✅ Eligible now. Last: ${last}`);
        }
        return t(
          lang,
          `⏰ التاريخ القادم: ${calc.nextEligibleDate} (${calc.daysUntilEligible} يوم) — قاعدة ${calc.minDaysBetween} يوم CRA`,
          `⏰ Prochain don: ${calc.nextEligibleDate} (${calc.daysUntilEligible} j) — ${calc.minDaysBetween} j CRA`,
          `⏰ Next: ${calc.nextEligibleDate} (${calc.daysUntilEligible} days)`
        );
      }

      case "reminder": {
        const dm = text.match(DATE_RE);
        const last = dm ? dm[1] : donor.lastDonation;
        if (!last) return t(lang, "أعطِ تاريخ آخر تبرع YYYY-MM-DD", "Date du dernier don requise", "Provide last donation date");
        const r = scheduleReminder(donor.id, last);
        return t(lang, `📅 تذكير في ${r.remindAt}`, `📅 Rappel le ${r.remindAt}`, `📅 Reminder ${r.remindAt}`);
      }

      case "inventory":
        return formatInventory(checkInventory(bloodType, wilaya), lang);

      case "inventory_all":
        return formatInventory(checkInventoryAll(wilaya), lang);

      case "nearby_inventory": {
        const data = findNearbyInventory(bloodType, wilaya);
        let msg = formatInventory(data.local, lang) + "\n";
        if (data.nearby?.length) {
          msg += t(lang, "🔍 مخزون قريب:", "🔍 Stock proche:", "🔍 Nearby:") + "\n";
          for (const n of data.nearby) msg += `${n.wilaya}: ${n.units}\n`;
        }
        return msg.trim();
      }

      case "leaderboard": {
        const region = wilaya !== donor.wilaya || /national|وطني|national/i.test(text) ? "national" : wilaya;
        const lb = getLeaderboard(/national|وطني/i.test(text) ? "national" : region);
        let msg = t(lang, `🏆 لوحة ${lb.region}:`, `🏆 Classement ${lb.region}:`, `🏆 Leaderboard:`) + "\n";
        for (const l of lb.leaders.slice(0, 5)) {
          msg += `${l.rank}. ${l.name} — ${l.totalDonations} ${t(lang, "تبرعات", "dons", "donations")}\n`;
        }
        return msg.trim();
      }

      case "emergency": {
        const e = activateEmergency(/earthquake|زلزال|séisme/i.test(text) ? "earthquake" : "shortage", wilaya);
        return t(
          lang,
          `🚨 بروتوكول طوارئ — ${e.location}\n• ${e.protocol.join("\n• ")}\n🩸 أولوية: ${e.priorityTypes.join(", ")}`,
          `🚨 Urgence — ${e.location}\n• ${e.protocol.join("\n• ")}`,
          `🚨 Emergency — ${e.location}`
        );
      }

      case "transfer": {
        const to = extractWilaya(text.split(/to|→|إلى|vers/i)[1] || "") || "Alger";
        const from = wilaya;
        const tr = coordinateTransfer(bloodType, from, to);
        return tr.message || tr.status;
      }

      case "expiring": {
        const ex = getExpiringUnits(wilaya, 7);
        if (!ex.units.length) return t(lang, "✅ لا وحدات تنتهي قريباً", "✅ Aucune unité expirante", "✅ No expiring units");
        let msg = t(lang, `⚠️ وحدات تنتهي — ${ex.wilaya}:`, `⚠️ Expiration — ${ex.wilaya}:`, `⚠️ Expiring:`) + "\n";
        for (const u of ex.units) msg += `${u.blood_type} @ ${u.hospital}: ${u.units}u (${u.expires_in_days}d)\n`;
        return msg.trim();
      }

      case "rare": {
        const r = contactRareBloodDonors(bloodType);
        return t(
          lang,
          `🚨 شبكة الدم النادر — ${r.bloodType}\n👥 ${r.matchedDonors} متبرع\n⏱️ ${r.estimatedResponseMinutes} دقيقة`,
          `🚨 Réseau sang rare — ${r.bloodType}\n👥 ${r.matchedDonors} donneurs`,
          `🚨 Rare blood — ${r.matchedDonors} donors`
        );
      }

      case "prescreening": {
        if (/answer|feelsHealthy|step|خطوة/i.test(text)) {
          return formatPrescreeningReply(runPrescreening({}), lang);
        }
        const form = prescreeningForm();
        return (
          t(lang, form.disclaimerAr, form.disclaimerFr, form.disclaimer) +
          "\n" +
          t(lang, "اسأل: استبيان + أجب على الأسئلة عبر API", "Utilisez POST /api/blood/prescreening", "Use POST /api/blood/prescreening with answers")
        );
      }

      default:
        break;
    }
  } catch (err) {
    console.error("DamBot tool error:", err);
  }

  if (donor.isEligible !== undefined && /مؤهل|eligible|éligib/i.test(text)) {
    return donor.isEligible
      ? t(lang, `نعم! مؤهل اليوم. آخر تبرع: ${donor.lastDonation}`, `Oui! Éligible. Dernier: ${donor.lastDonation}`, `Eligible. Last: ${donor.lastDonation}`)
      : t(lang, `متبقي ${donor.daysUntilEligible} يوم.`, `Encore ${donor.daysUntilEligible} jours.`, `${donor.daysUntilEligible} days left.`);
  }

  return t(
    lang,
    "أنا DamBot 🩸 اسأل عن: الأهلية، المراكز، المخزون، الشارات، التذكير، الطوارئ، الاستبيان.",
    "Je suis DamBot 🩸 Éligibilité, centres, stock, badges, rappels, urgences, questionnaire.",
    "I'm DamBot 🩸 Ask about eligibility, centers, inventory, badges, reminders, emergencies, prescreening."
  );
}

function formatPrescreeningReply(result, lang) {
  const msg = lang === "fr" ? result.messageFr : result.messageAr;
  return (result.status === "ready" ? "✅ " : result.status === "needs_review" ? "⚠️ " : "❌ ") + msg;
}
