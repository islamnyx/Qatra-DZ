/**
 * DamBot intent detection — 11 categories + app help + general info.
 * Pattern order: higher priority intents checked first via scored rules.
 */

export const BLOOD_RE = /\b(o\+|o-|a\+|a-|b\+|b-|ab\+|ab-)\b/i;
export const DATE_RE = /(\d{4}-\d{2}-\d{2})/;
export const WEIGHT_RE = /(\d+)\s*kg/i;
export const MONTHS_AGO_RE = /(\d+)\s*months?\s*ago/i;
export const MONTH_RE = /(\d+)\s*months?/i;

const RULES = [
  // App help (Category 12)
  {
    intent: "app_help",
    score: 100,
    test: (q) =>
      /how to use|use the app|using qatra|قطرة|تطبيق|guide app|configur|setup app|install app|how does qatra|comment utiliser|دليل التطبيق|configure the app|edge case|troubleshoot|مشكل في التطبيق/i.test(
        q
      ),
  },

  // Blood type statement (Category 5) — before inventory
  {
    intent: "blood_type",
    score: 95,
    test: (q) =>
      (/(^i have |^my blood type|^i'm |^i am |^blood type |^my type is |^i've got |^i carry |فصيلتي|دمي|groupe sanguin)/i.test(
        q
      ) ||
        /o\s*positive|o\s*negative|a\s*positive|b\s*positive|ab\s*negative/i.test(q)) &&
      !/inventory|stock|مخزون|check |how much|supply|shortage/i.test(q),
  },

  // Emergency (Category 7)
  {
    intent: "emergency",
    score: 94,
    test: (q) =>
      /emergency|urgent|critical need|طوارئ|urgence|disaster|earthquake|زلزال|shortage emergency|patient needs|activate rare/i.test(
        q
      ),
  },

  // Cross-region transfer (Category 9)
  {
    intent: "transfer",
    score: 93,
    test: (q) =>
      /transfer .* (to|from|→|إلى)|send .* blood to|move expiring|coordinate blood transfer|نقل .* إلى|transfert|from .+ to /i.test(
        q
      ),
  },

  // Reminder (Category 4 sub)
  {
    intent: "reminder",
    score: 92,
    test: (q) =>
      /schedule a reminder|remind me when|تذكير|رappel|schedule reminder/i.test(q) && !/leaderboard/i.test(q),
  },

  // Next donation (Category 4)
  {
    intent: "next_donation",
    score: 91,
    test: (q) =>
      DATE_RE.test(q) ||
      /when can i donate again|next donation|calculate my next|how long between|days until i can|am i eligible to donate now|متى يمكنني|prochain don|donner à nouveau|combien de jours/i.test(
        q
      ),
  },

  // Prescreening / screening process (Category 10)
  {
    intent: "prescreening",
    score: 90,
    test: (q) =>
      /prescreen|pre-screen|questionnaire|استبيان|screening process|what tests|hemoglobin|hémoglobine|prepare me for donation|فحص قبل|medical screening/i.test(
        q
      ),
  },

  // Milestones (Category 3)
  {
    intent: "milestones",
    score: 89,
    test: (q) =>
      /badge|milestone|achievement|donated \d+ times|donated \d+ml|1350ml|450ml|track my donation|lives have i saved|donor status|شارات|إنجاز|fois donné|jalon/i.test(
        q
      ),
  },

  // Leaderboard (Category 8)
  {
    intent: "leaderboard",
    score: 88,
    test: (q) =>
      /leaderboard|top donor|ranking|classement|متصدر|am i on the|best donors|top 10|who are the top/i.test(q),
  },

  // Expiring units (Category 6 sub)
  {
    intent: "expiring",
    score: 87,
    test: (q) =>
      /expiring|expire|منته|expirant|expiry/i.test(q) && /unit|blood|دم|وحدات/i.test(q),
  },

  // Inventory / shortage (Category 6)
  {
    intent: "inventory",
    score: 86,
    test: (q) =>
      /inventory|stock|مخزون|supply|shortage|most needed|blood types are low|which blood type|how much .* blood|check .* inventory|inventory in/i.test(
        q
      ) && (BLOOD_RE.test(q) || /blood type|types are low|most needed|inventory/i.test(q)),
  },
  {
    intent: "inventory_all",
    score: 85,
    test: (q) =>
      /what blood types|types are low|shortage alert|blood stock in|مخزون في/i.test(q) && !BLOOD_RE.test(q),
  },

  // Location (Category 2)
  {
    intent: "centers",
    score: 84,
    test: (q) =>
      /where can i donate|find nearest|donation center|mobile blood drive|nearest place|blood drive|locations in|مركز|أين أتبرع|centre de|lieu.*don/i.test(
        q
      ),
  },

  // Eligibility (Category 1)
  {
    intent: "eligibility",
    score: 83,
    test: (q) =>
      /can i donate|eligible|éligib|هل أستطيع|هل أنا مؤهل|requirements to donate|weigh enough|tattoo|piercing|medication|pregnant|surgery|anemia|blood pressure|flu|empty stomach|disqualify|how long after a tattoo|65 years/i.test(
        q
      ),
  },

  // General donation info (Category 11)
  {
    intent: "general_info",
    score: 82,
    test: (q) =>
      /i want to donate|tell me about blood|how does blood donation|why should i donate|is blood donation safe|how long does donation|what should i eat|what to bring|benefits of donating|how often can i donate|je veux donner|pourquoi donner/i.test(
        q
      ),
  },

  // Rare donors (from emergency overlap — lower if not emergency)
  {
    intent: "rare",
    score: 81,
    test: (q) => /rare blood|bombay|شبكة.*نادر|donor network/i.test(q),
  },
];

export function detectIntent(text) {
  const q = text.trim().toLowerCase();
  let best = { intent: "general", score: 0 };

  for (const rule of RULES) {
    if (rule.test(q) && rule.score > best.score) {
      best = { intent: rule.intent, score: rule.score };
    }
  }

  return best.intent;
}

/** Normalize natural language blood type */
export function extractBloodType(text) {
  const fromRegex = text.match(BLOOD_RE);
  if (fromRegex) return fromRegex[0].toUpperCase();

  const map = [
    [/o\s*positive|o\s*pos\b/i, "O+"],
    [/o\s*negative|o\s*neg\b/i, "O-"],
    [/a\s*positive/i, "A+"],
    [/a\s*negative/i, "A-"],
    [/b\s*positive/i, "B+"],
    [/b\s*negative/i, "B-"],
    [/ab\s*positive/i, "AB+"],
    [/ab\s*negative/i, "AB-"],
  ];
  for (const [re, type] of map) {
    if (re.test(text)) return type;
  }
  return null;
}

export function extractWilayaFromText(text, resolveWilaya) {
  const cities = [
    ["algiers", "alger", "الجزائر", "جزائر", "alger centre"],
    ["oran", "وهران", "wahran"],
    ["constantine", "قسنطينة", "constantine"],
    ["blida", "البليدة", "بليدة"],
    ["annaba", "عنابة", "annaba"],
    ["setif", "sétif", "سطيف", "setif"],
    ["tizi ouzou", "tizi", "تيزي وزو", "تيزي"],
    ["bejaia", "béjaïa", "bejaïa", "بجاية", "بجاïa"],
    ["mostaganem", "مستغانم"],
    ["mila", "ميلة"],
    ["skikda", "سكيكدة"],
  ];
  const lower = text.toLowerCase();
  for (const aliases of cities) {
    for (const c of aliases) {
      if (text.includes(c) || lower.includes(c.toLowerCase())) {
        return resolveWilaya(aliases[0]);
      }
    }
  }
  return null;
}

export function parseTransferRoute(text, resolveWilaya, defaultFrom) {
  const lower = text.toLowerCase();
  const fromMatch = lower.match(/from\s+([a-zéèêàâùûôîïç\s]+?)\s+to/i);
  const toMatch = lower.match(/to\s+([a-zéèêàâùûôîïç\s]+?)(?:\s+hospital|$)/i);
  if (fromMatch && toMatch) {
    return {
      from: resolveWilaya(fromMatch[1].trim()),
      to: resolveWilaya(toMatch[1].trim()),
    };
  }
  const parts = text.split(/→|إلى|to/i);
  if (parts.length >= 2) {
    return {
      from: extractWilayaFromText(parts[0], resolveWilaya) || defaultFrom,
      to: extractWilayaFromText(parts[1], resolveWilaya) || "Alger",
    };
  }
  return { from: defaultFrom, to: "Alger" };
}

export function parseEligibilityFromText(text) {
  const payload = {};
  const lower = text.toLowerCase();

  const wm = text.match(WEIGHT_RE);
  if (wm) payload.weightKg = parseInt(wm[1], 10);

  const monthsAgo = text.match(MONTHS_AGO_RE);
  const months = text.match(MONTH_RE);
  const monthVal = monthsAgo ? parseInt(monthsAgo[1], 10) : months ? parseInt(months[1], 10) : null;

  if (monthVal != null) {
    if (/tattoo|وشم/i.test(lower)) payload.tattooMonthsAgo = monthVal;
    if (/pierc|ثقب/i.test(lower)) payload.piercingMonthsAgo = monthVal;
    if (!payload.tattooMonthsAgo && !payload.piercingMonthsAgo) payload.tattooMonthsAgo = monthVal;
  }

  if (/tattoo|وشم/i.test(lower) && monthVal == null) payload.tattooMonthsAgo = 3;
  if (/pierc|ثقب/i.test(lower) && monthVal == null) payload.piercingMonthsAgo = 4;

  if (/pregnant|pregnancy|حامل|enceinte|grossesse/i.test(lower)) payload.pregnant = true;
  if (/medication|medicine|دواء|médicament|antibiotic|blood thinner|chemotherapy/i.test(lower))
    payload.onMedication = true;
  if (/high blood pressure|hypertension|ضغط الدم/i.test(lower)) payload.onMedication = true;
  if (/anemia|فقر الدم|anémie/i.test(lower)) payload.recentIllness = true;
  if (/flu|cold|fever|سعال|حمى|grippe|infection/i.test(lower)) payload.recentIllness = true;
  if (/surgery|عملية|chirurgie/i.test(lower)) payload.recentSurgery = true;
  if (/empty stomach|صائم|jeûne|fasting/i.test(lower)) payload.recentIllness = true;

  const agePatterns = [
    /(?:i'm|i am|age)\s*(\d{2})/i,
    /(\d{2})\s*years?\s*old/i,
  ];
  for (const re of agePatterns) {
    const m = text.match(re);
    if (m) {
      payload.age = parseInt(m[1], 10);
      break;
    }
  }
  if (/65|sixty[- ]?five/i.test(lower) && !payload.age) payload.age = 65;

  if (/requirement|معايير|conditions/i.test(lower) && Object.keys(payload).length === 0) {
    payload._generalRequirements = true;
  }

  return payload;
}
