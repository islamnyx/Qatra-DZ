import { evaluateEligibility, MIN_WEIGHT_KG, MIN_AGE, MAX_AGE, TATTOO_WAIT_MONTHS } from "../services/eligibilityRules.js";
import { MIN_DAYS_BETWEEN_DONATIONS } from "./eligibility.js";
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
import {
  detectIntent,
  extractBloodType,
  extractWilayaFromText,
  parseEligibilityFromText,
  parseTransferRoute,
  DATE_RE,
  BLOOD_RE,
} from "../services/chatIntents.js";
import { getAppHelpReply, getGeneralInfoReply, getPrescreeningInfoReply } from "../services/appGuide.js";

export const quickPrompts = {
  ar: [
    "هل أنا مؤهل للتبرع؟",
    "أين أتبرع في الجزائر؟",
    "فصيلتي O-",
    "متى يمكنني التبرع مرة أخرى؟",
    "شاراتي وإنجازاتي",
    "مخزون O- في وهران",
    "لوحة المتصدرين",
    "طوارئ في قسنطينة",
    "كيف أستخدم تطبيق قطرة؟",
    "استبيان ما قبل التبرع",
  ],
  fr: [
    "Suis-je éligible ?",
    "Où donner à Alger ?",
    "Mon groupe O-",
    "Quand puis-je donner à nouveau ?",
    "Mes badges",
    "Stock O- à Oran",
    "Classement national",
    "Urgence à Constantine",
    "Comment utiliser l'app Qatra ?",
    "Questionnaire pré-don",
  ],
};

function pickLang(lang) {
  return lang === "fr" ? "fr" : lang === "en" ? "en" : "ar";
}

function t(lang, ar, fr, en = fr) {
  const l = pickLang(lang);
  if (l === "fr") return fr;
  if (l === "ar") return ar;
  return en;
}

function formatEligibility(result, lang, extra = "") {
  const statusLabel = t(
    lang,
    result.status === "eligible" ? "✅ مؤهل" : result.status === "needs_review" ? "⚠️ مراجعة طبية" : "❌ مؤجل",
    result.status === "eligible" ? "✅ Éligible" : result.status === "needs_review" ? "⚠️ Avis médical" : "❌ Reporté",
    result.status
  );
  let msg = extra ? extra + "\n" : "";
  msg += statusLabel + "\n";
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
  for (const c of data.centers.slice(0, 4)) {
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

function formatMostNeeded(wilaya, lang) {
  const inv = checkInventoryAll(wilaya);
  const sorted = [...(inv.inventory || [])].sort((a, b) => a.units - b.units);
  let msg = t(lang, `🩸 الأكثر حاجة في ${wilaya}:`, `🩸 Plus demandé à ${wilaya}:`, `🩸 Most needed in ${wilaya}:`) + "\n";
  for (const row of sorted.slice(0, 4)) {
    msg += `• ${row.bloodType}: ${row.units} (${row.status})\n`;
  }
  return msg.trim();
}

function handleEligibility(text, lang, donor) {
  const payload = parseEligibilityFromText(text);
  delete payload.lastDonation;

  if (payload._generalRequirements) {
    const intro = t(
      lang,
      `📋 متطلبات CRA: العمر ${MIN_AGE}-${MAX_AGE}، الوزن ≥${MIN_WEIGHT_KG} كغ، فترة ${TATTOO_WAIT_MONTHS} أشهر بعد الوشم/الثقب، ${MIN_DAYS_BETWEEN_DONATIONS} يوم بين التبرعات.\n`,
      `📋 CRA : ${MIN_AGE}-${MAX_AGE} ans, ≥${MIN_WEIGHT_KG} kg, ${TATTOO_WAIT_MONTHS} mois tatouage, ${MIN_DAYS_BETWEEN_DONATIONS} j entre dons.\n`,
      `📋 Requirements: age ${MIN_AGE}-${MAX_AGE}, ≥${MIN_WEIGHT_KG}kg, ${TATTOO_WAIT_MONTHS}mo tattoo wait, ${MIN_DAYS_BETWEEN_DONATIONS} days between donations.\n`
    );
    return intro + formatEligibility(evaluateEligibility({ weightKg: 55, age: 30 }), lang);
  }

  const specificKeys = Object.keys(payload).filter((k) => k !== "_generalRequirements");
  if (specificKeys.length > 0) {
    return formatEligibility(evaluateEligibility(payload), lang);
  }

  if (donor?.isEligible !== undefined) {
    const name = donor.name?.split(" ")[0] ?? "";
    if (donor.isEligible) {
      return t(
        lang,
        `✅ نعم ${name}! يمكنك التبرع اليوم.\n📅 آخر تبرع: ${donor.lastDonation}\n⚠️ الفحص الطبي في المركز مطلوب دائماً.`,
        `✅ Oui ${name}! Éligible aujourd'hui.\n📅 Dernier don: ${donor.lastDonation}\n⚠️ Examen médical sur place requis.`,
        `✅ Yes ${name}! Eligible today. Last donation: ${donor.lastDonation}. Medical check at center required.`
      );
    }
    return t(
      lang,
      `⏰ ليس بعد ${name} — متبقي ${donor.daysUntilEligible} يوم (قاعدة ${MIN_DAYS_BETWEEN_DONATIONS} يوم بين التبرعات).`,
      `⏰ Pas encore ${name} — ${donor.daysUntilEligible} j restants (${MIN_DAYS_BETWEEN_DONATIONS} j CRA).`,
      `⏰ Not yet — ${donor.daysUntilEligible} days left (${MIN_DAYS_BETWEEN_DONATIONS}-day rule).`
    );
  }

  return formatEligibility(evaluateEligibility({ weightKg: 55 }), lang);
}

function handleBloodType(text, lang, donor, wilaya) {
  const type = extractBloodType(text) || donor.bloodType;
  const inv = checkInventory(type, wilaya);
  const rare = type === "O-" || type === "AB-";
  return t(
    lang,
    `🩸 فصيلتك/المذكورة: ${type}${type === donor.bloodType ? " (مسجّلة في ملفك)" : ""}${rare ? " — نادرة ومطلوبة جداً!" : ""}\n${formatInventory(inv, lang)}\n💡 اسأل: «أين أتبرع في ${wilaya}» أو «هل أنا مؤهل»`,
    `🩸 Groupe : ${type}${rare ? " — rare, très demandé!" : ""}\n${formatInventory(inv, lang)}`,
    `🩸 Blood type ${type}\n${formatInventory(inv, lang)}`
  );
}

function handleMilestones(donor, lang, text) {
  const m = getDonationMilestones(donor.id);
  const countMatch = text.match(/(\d+)\s*times?/i);
  const volMatch = text.match(/(\d+)\s*ml/i);
  let extra = "";
  if (countMatch) {
    const n = parseInt(countMatch[1], 10);
    extra = t(lang, `📌 ذكرتَ ${n} تبرعات.`, `📌 Vous citez ${n} dons.`, `📌 You mentioned ${n} donations.`);
  }
  if (volMatch) {
    extra += t(lang, ` حجم ~${volMatch[1]}ml.`, ` Volume ~${volMatch[1]}ml.`, ` Volume ~${volMatch[1]}ml.`);
  }
  const badges = m.earnedBadges.join(", ") || t(lang, "لا شارات بعد", "Pas encore de badges", "No badges yet");
  const next = m.nextMilestone
    ? t(
        lang,
        `الهدف التالي: ${m.nextMilestone.name} (${m.nextMilestone.donationsNeeded} تبرعات)`,
        `Prochain: ${m.nextMilestone.name} (${m.nextMilestone.donationsNeeded})`,
        `Next: ${m.nextMilestone.name}`
      )
    : t(lang, "أعلى مستوى! 💎", "Niveau max! 💎", "Max level!");
  const status = t(
    lang,
    `حالة المتبرع: ${m.totalDonations} تبرعات مسجّلة`,
    `Statut : ${m.totalDonations} dons enregistrés`,
    `Status: ${m.totalDonations} recorded donations`
  );
  return `${extra}\n🏆 ${badges}\n${next}\n💪 ~${m.livesSavedEstimate} ${t(lang, "أرواح", "vies", "lives")}\n${status}`.trim();
}

function handleLeaderboard(text, lang, donor, wilaya) {
  const national = /national|algeria|algérie|وطني|top 10|top donor/i.test(text);
  const region = national ? "national" : wilaya;
  const lb = getLeaderboard(region);
  let msg = t(lang, `🏆 لوحة ${lb.region}:`, `🏆 Classement ${lb.region}:`, `🏆 Leaderboard:`) + "\n";
  let onBoard = false;
  for (const l of lb.leaders.slice(0, 10)) {
    msg += `${l.rank}. ${l.name} — ${l.totalDonations} ${t(lang, "تبرعات", "dons", "donations")}\n`;
    if (l.id === donor.id) onBoard = true;
  }
  if (/am i on/i.test(text)) {
    msg +=
      "\n" +
      (onBoard
        ? t(lang, `✅ نعم ${donor.name}! أنت في القائمة.`, `✅ Oui, vous êtes classé(e)!`, `✅ Yes, you're on the board!`)
        : t(lang, "لم أجدك في أعلى 10 — استمر بالتبرع!", "Pas dans le top 10 — continuez!", "Not in top 10 yet — keep donating!"));
  }
  return msg.trim();
}

function formatPrescreeningReply(result, lang) {
  const msg = lang === "fr" ? result.messageFr : result.messageAr;
  return (result.status === "ready" ? "✅ " : result.status === "needs_review" ? "⚠️ " : "❌ ") + msg;
}

export function getDamBotReply(text, lang = "ar", donor, options = {}) {
  if (!donor) {
    return lang === "fr" ? "DamBot indisponible." : "DamBot غير متاح.";
  }

  const intent = options.intent ?? detectIntent(text);
  const wilaya = options.wilaya ?? extractWilayaFromText(text, resolveWilaya) ?? donor.wilaya;
  const bloodMatch = text.match(BLOOD_RE);
  const bloodType =
    options.bloodType ?? extractBloodType(text) ?? (bloodMatch ? bloodMatch[0].toUpperCase() : donor.bloodType);

  try {
    switch (intent) {
      case "app_help":
        return getAppHelpReply(lang, text);

      case "general_info":
        return getGeneralInfoReply(lang, text);

      case "eligibility":
        return handleEligibility(text, lang, donor);

      case "blood_type":
        return handleBloodType(text, lang, donor, wilaya);

      case "centers":
        return formatCenters(findNearestCenters(wilaya), lang);

      case "milestones":
        return handleMilestones(donor, lang, text);

      case "next_donation": {
        const dm = text.match(DATE_RE);
        const last = dm ? dm[1] : donor.lastDonation;
        if (/how long between|combien.*entre|كم.*بين/i.test(text)) {
          return t(
            lang,
            `📅 ${MIN_DAYS_BETWEEN_DONATIONS} يوماً بين التبرعات (CRA).`,
            `📅 ${MIN_DAYS_BETWEEN_DONATIONS} jours entre les dons.`,
            `📅 ${MIN_DAYS_BETWEEN_DONATIONS} days between donations.`
          );
        }
        if (/eligible.*now|now|اليوم|aujourd/i.test(text) && !dm) {
          return donor.isEligible
            ? t(lang, "✅ نعم، يمكنك التبرع اليوم!", "✅ Oui, vous pouvez donner aujourd'hui!", "✅ Yes, eligible today!")
            : t(
                lang,
                `⏰ ليس بعد — ${donor.daysUntilEligible} يوم متبقي.`,
                `⏰ Pas encore — ${donor.daysUntilEligible} jours.`,
                `⏰ ${donor.daysUntilEligible} days left.`
              );
        }
        const calc = calculateNextDonationDate(last);
        if (!last) {
          return t(lang, "أعطِ تاريخ آخر تبرع بصيغة 2026-02-15", "Date du dernier don : AAAA-MM-JJ", "Use YYYY-MM-DD for last donation.");
        }
        if (calc.isEligible) {
          return t(lang, `✅ يمكنك التبرع الآن! آخر تبرع: ${last}`, `✅ Éligible! Dernier don: ${last}`, `✅ Eligible now. Last: ${last}`);
        }
        return t(
          lang,
          `⏰ التاريخ القادم: ${calc.nextEligibleDate} (${calc.daysUntilEligible} يوم) — ${calc.minDaysBetween} يوم CRA`,
          `⏰ Prochain: ${calc.nextEligibleDate} (${calc.daysUntilEligible} j)`,
          `⏰ Next: ${calc.nextEligibleDate} (${calc.daysUntilEligible} days)`
        );
      }

      case "reminder": {
        const dm = text.match(DATE_RE);
        const last = dm ? dm[1] : donor.lastDonation;
        if (!last) return t(lang, "أعطِ تاريخ آخر تبرع YYYY-MM-DD", "Date du dernier don requise", "Need last donation date.");
        const r = scheduleReminder(donor.id, last);
        return t(
          lang,
          `📅 تم جدولة تذكير في ${r.remindAt} (قبل 7 أيام من الأهلية)`,
          `📅 Rappel planifié le ${r.remindAt}`,
          `📅 Reminder set for ${r.remindAt}`
        );
      }

      case "inventory":
        if (/most needed|أكثر حاجة|plus demandé/i.test(text)) return formatMostNeeded(wilaya, lang);
        if (/shortage|نقص/i.test(text)) return formatMostNeeded(wilaya, lang) + "\n" + formatInventory(checkInventoryAll(wilaya), lang);
        return formatInventory(checkInventory(bloodType, wilaya), lang);

      case "inventory_all":
        if (/most needed|أكثر حاجة/i.test(text)) return formatMostNeeded(wilaya, lang);
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

      case "leaderboard":
        return handleLeaderboard(text, lang, donor, wilaya);

      case "emergency": {
        const type = /earthquake|زلزال/i.test(text) ? "earthquake" : /disaster/i.test(text) ? "disaster" : "shortage";
        const e = activateEmergency(type, wilaya);
        const rare = /rare|نادر/i.test(text);
        let msg = t(
          lang,
          `🚨 طوارئ — ${e.location}\n• ${e.protocol.join("\n• ")}\n🩸 أولوية: ${e.priorityTypes.join(", ")}`,
          `🚨 Urgence — ${e.location}\n• ${e.protocol.join("\n• ")}`,
          `🚨 Emergency — ${e.location}`
        );
        if (rare) {
          const r = contactRareBloodDonors(bloodType);
          msg += `\n${t(lang, `شبكة الدم النادر: ${r.matchedDonors} متبرع`, `Réseau rare: ${r.matchedDonors} donneurs`, `Rare network: ${r.matchedDonors}`)}`;
        }
        return msg;
      }

      case "transfer": {
        const route = parseTransferRoute(text, resolveWilaya, wilaya);
        const tr = coordinateTransfer(bloodType, route.from, route.to);
        return tr.message || `${tr.status}: ${route.from} → ${route.to}`;
      }

      case "expiring": {
        const ex = getExpiringUnits(wilaya, 7);
        if (!ex.units?.length) return t(lang, "✅ لا وحدات تنتهي قريباً", "✅ Aucune unité expirante", "✅ No expiring units");
        let msg = t(lang, `⚠️ وحدات تنتهي — ${ex.wilaya}:`, `⚠️ Expiration — ${ex.wilaya}:`, `⚠️ Expiring:`) + "\n";
        for (const u of ex.units) {
          const hrs = Math.round(u.expires_in_days * 24);
          msg += `• ${u.blood_type} @ ${u.hospital}: ${u.units}u (~${hrs}h)\n`;
        }
        msg += "\n" + t(lang, ex.recommendation, ex.recommendation, ex.recommendation);
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

      case "prescreening":
        if (/what tests|screening process|hemoglobin|فحص|tests are/i.test(text)) {
          return getPrescreeningInfoReply(lang);
        }
        if (/check if i'm eligible|eligible to donate/i.test(text)) {
          return handleEligibility(text, lang, donor);
        }
        const form = prescreeningForm();
        return (
          t(lang, form.disclaimerAr, form.disclaimerFr, form.disclaimer) +
          "\n\n" +
          form.steps.map((s, i) => `${i + 1}. ${lang === "fr" ? s.questionFr : s.questionAr}`).join("\n") +
          "\n\n" +
          t(
            lang,
            "للتقييم الكامل أرسل إجاباتك أو اسأل في المركز.",
            "Répondez aux questions ou passez au centre.",
            "Answer at center or via API prescreening."
          )
        );

      default:
        break;
    }
  } catch (err) {
    console.error("DamBot error:", err);
  }

  return t(
    lang,
    `أنا DamBot 🩸 يمكنني مساعدتك في:
1 الأهلية 2 المراكز 3 الشارات 4 موعد التبرع القادم 5 المخزون 6 الطوارئ 7 المتصدرين 8 النقل بين الولايات 9 الاستبيان 10 معلومات التبرع 11 دليل تطبيق قطرة
جرب: «هل أنا مؤهل؟» أو «كيف أستخدم التطبيق؟»`,
    `Je suis DamBot 🩸 : éligibilité, centres, badges, dates, stock, urgences, classement, transferts, questionnaire, guide Qatra.`,
    `I'm DamBot 🩸 — eligibility, centers, badges, next date, inventory, SOS, leaderboard, transfers, screening, app guide. Try: "Can I donate?" or "How to use the app?"`
  );
}
