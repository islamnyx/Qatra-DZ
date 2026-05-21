/**
 * Multi-turn DamBot conversation: context from history + dynamic follow-ups.
 */
import { detectIntent, extractBloodType, extractWilayaFromText, BLOOD_RE, DATE_RE } from "./chatIntents.js";
import { getDamBotReply } from "../utils/damBot.js";
import { resolveWilaya } from "./bloodTools.js";

const MAX_HISTORY = 12;

function pickLang(lang) {
  return lang === "fr" ? "fr" : lang === "en" ? "en" : "ar";
}

/** Build session context from recent messages */
export function buildContextFromHistory(history = [], donor) {
  const ctx = {
    lastIntent: null,
    lastWilaya: donor?.wilaya ?? "Alger",
    lastBloodType: donor?.bloodType ?? "O+",
    lastUserMessage: "",
    turnCount: 0,
  };

  const recent = history.slice(-MAX_HISTORY);
  for (const msg of recent) {
    if (msg.role === "user") {
      ctx.turnCount++;
      ctx.lastUserMessage = msg.content || msg.text || "";
      const w = extractWilayaFromText(ctx.lastUserMessage, resolveWilaya);
      if (w) ctx.lastWilaya = w;
      const bt = extractBloodType(ctx.lastUserMessage);
      if (bt) ctx.lastBloodType = bt;
    }
    if (msg.role === "assistant" || msg.role === "bot") {
      const meta = msg.intent;
      if (meta) ctx.lastIntent = meta;
    }
  }

  return ctx;
}

/** Expand short / follow-up user messages using conversation context */
export function expandMessageWithContext(text, ctx, lang = "ar") {
  const raw = text.trim();
  const q = raw.toLowerCase();
  const L = (ar, fr, en) => (lang === "fr" ? fr : lang === "en" ? en : ar);

  if (/^(yes|yeah|yep|sure|please|ok|okay|oui|d'accord|نعم|أجل|حسنا|موافق|من فضلك)$/i.test(q)) {
    if (ctx.lastIntent === "eligibility") {
      return L("Where can I donate near me?", "Où donner près de chez moi ?", "Where can I donate?");
    }
    if (ctx.lastIntent === "centers") {
      return L("Am I eligible to donate?", "Suis-je éligible ?", "Am I eligible?");
    }
    if (ctx.lastIntent === "inventory") {
      return L(
        `Find nearest center in ${ctx.lastWilaya}`,
        `Centre le plus proche à ${ctx.lastWilaya}`,
        `Centers in ${ctx.lastWilaya}`
      );
    }
    return L("Tell me more", "En savoir plus", "Tell me more");
  }

  if (/^(no|nope|non|لا|لأ)$/i.test(q)) {
    return L("What else can you help with?", "Autre chose ?", "What else?");
  }

  if (/^(thanks|thank you|thx|شكرا|شكراً|merci)$/i.test(q)) {
    return "__thanks__";
  }

  const wilayaInMsg = extractWilayaFromText(raw, resolveWilaya);
  const placeRef = /هناك|هنا|there|here|là|ici|same place/i.test(q);
  const wCtx = wilayaInMsg || ctx.lastWilaya;

  if (/مخزون|stock|inventory|supply/i.test(q) && (BLOOD_RE.test(raw) || ctx.lastBloodType)) {
    const bt = extractBloodType(raw) || ctx.lastBloodType;
    return `Check ${bt} inventory in ${wCtx}`;
  }

  if (placeRef && q.length < 40) {
    if (BLOOD_RE.test(raw) || /مخزون|stock/i.test(q)) {
      const bt = extractBloodType(raw) || ctx.lastBloodType;
      return `Check ${bt} inventory in ${ctx.lastWilaya}`;
    }
    if (ctx.lastIntent === "centers") {
      return `Where can I donate in ${ctx.lastWilaya}?`;
    }
  }

  const isShortFollowUp =
    raw.length < 55 &&
    (/what about|how about|and |also |et |aussi |و |أما |في |there|that city|same for|pareil/i.test(q) ||
      wilayaInMsg);

  if (isShortFollowUp) {
    const w = wilayaInMsg || ctx.lastWilaya;
    if (ctx.lastIntent === "inventory" || (BLOOD_RE.test(raw) && /stock|inventory|مخزون/i.test(q))) {
      const bt = extractBloodType(raw) || ctx.lastBloodType;
      return `Check ${bt} inventory in ${w}`;
    }
    if (ctx.lastIntent === "emergency") {
      return `Emergency blood need in ${w}`;
    }
    if (ctx.lastIntent === "expiring") {
      return `Show expiring blood units in ${w}`;
    }
    if (ctx.lastIntent === "centers" || /centre|center|مركز|donate|donner|أتبرع|تبرع/i.test(q)) {
      return `Where can I donate in ${w}?`;
    }
    if (wilayaInMsg && (ctx.lastIntent === "eligibility" || ctx.lastIntent === "greeting" || ctx.lastIntent === "general")) {
      return `Where can I donate in ${w}?`;
    }
    return L(`Tell me about ${w}`, `Parlez-moi de ${w}`, `About ${w}`);
  }

  if (/^(tell me more|more info|continue|go on|واصل|المزيد|plus de détails|en savoir plus)$/i.test(q)) {
    const intent = ctx.lastIntent || "general";
    const expansions = {
      eligibility: L("What are the requirements to donate?", "Quelles sont les conditions ?", "Requirements?"),
      centers: L(`Where can I donate in ${ctx.lastWilaya}?`, `Où donner à ${ctx.lastWilaya} ?`, `Centers in ${ctx.lastWilaya}?`),
      inventory: L(`Check inventory in ${ctx.lastWilaya}`, `Stock à ${ctx.lastWilaya}`, `Inventory ${ctx.lastWilaya}`),
      milestones: L("What badges can I earn?", "Quels badges ?", "My badges?"),
      next_donation: L("When can I donate again?", "Quand donner à nouveau ?", "Next donation date?"),
      app_help: L("How do I use the Qatra app?", "Comment utiliser Qatra ?", "How to use the app?"),
      general: L("How does blood donation work?", "Comment fonctionne le don ?", "How does donation work?"),
    };
    return expansions[intent] || expansions.general;
  }

  if (/^(hi|hello|hey|salut|bonjour|مرحبا|السلام|أهلا)$/i.test(q)) {
    return "__greeting__";
  }

  return raw;
}

function detectIntentWithContext(text, ctx) {
  if (text === "__thanks__") return "thanks";
  if (text === "__greeting__") return "greeting";
  const intent = detectIntent(text);
  if (intent !== "general") return intent;
  if (ctx.lastIntent && text.length < 40) return ctx.lastIntent;
  return intent;
}

function thanksReply(lang, donor) {
  const name = donor?.name?.split(" ")[0] ?? "";
  if (lang === "fr") {
    return `Avec plaisir${name ? `, ${name}` : ""} ! 🩸 Je reste là si vous avez d'autres questions.`;
  }
  if (lang === "en") {
    return `You're welcome${name ? `, ${name}` : ""}! 🩸 I'm here whenever you need help.`;
  }
  return `العفو${name ? ` يا ${name}` : ""}! 🩸 أنا هنا لأي سؤال آخر.`;
}

function greetingReply(lang, donor) {
  const name = donor?.name?.split(" ")[0] ?? "";
  if (lang === "fr") {
    return `Bonjour${name ? ` ${name}` : ""} ! 🩸 Je suis DamBot — posez-moi une question en français ou en arabe, ou tapez librement.`;
  }
  if (lang === "en") {
    return `Hello${name ? ` ${name}` : ""}! 🩸 I'm DamBot — ask me anything about donation or the Qatra app.`;
  }
  return `مرحباً${name ? ` ${name}` : ""}! 🩸 أنا DamBot — اكتب سؤالك بحرية (أهلية، مراكز، مخزون، التطبيق…).`;
}

/** Dynamic follow-up chips based on last intent — not static FAQ list */
export function getFollowUpSuggestions(intent, lang, donor, ctx) {
  const w = ctx.lastWilaya || donor.wilaya;
  const bt = ctx.lastBloodType || donor.bloodType;

  const pools = {
    eligibility: {
      ar: [`أين أتبرع في ${w}؟`, "متى موعدي القادم؟", "ما متطلبات التبرع؟"],
      fr: [`Où donner à ${w} ?`, "Prochain don ?", "Conditions ?"],
      en: [`Where to donate in ${w}?`, "Next donation date?", "Requirements?"],
    },
    centers: {
      ar: ["هل أنا مؤهل؟", `مخزون ${bt} في ${w}`, "كيف أستخدم التطبيق؟"],
      fr: ["Suis-je éligible ?", `Stock ${bt} à ${w}`, "Guide app Qatra"],
      en: ["Am I eligible?", `${bt} stock in ${w}`, "How to use the app?"],
    },
    inventory: {
      ar: [`أقرب مركز في ${w}`, "أي فصيلة الأكثر نقصاً؟", "حالة طوارئ؟"],
      fr: [`Centre à ${w}`, "Type le plus demandé ?", "Urgence ?"],
      en: [`Nearest center in ${w}`, "Most needed type?", "Emergency?"],
    },
    milestones: {
      ar: ["متى أتبرع مرة أخرى؟", "لوحة المتصدرين", "شارات أخرى؟"],
      fr: ["Prochain don ?", "Classement", "Autres badges ?"],
      en: ["Next donation?", "Leaderboard", "More badges?"],
    },
    next_donation: {
      ar: ["جدول تذكير", `مراكز في ${w}`, "هل أنا مؤهل اليوم؟"],
      fr: ["Rappel", `Centres ${w}`, "Éligible aujourd'hui ?"],
      en: ["Set reminder", `Centers in ${w}`, "Eligible today?"],
    },
    blood_type: {
      ar: [`مخزون ${bt} في ${w}`, "هل أنا مؤهل؟", "نداء طوارئ؟"],
      fr: [`Stock ${bt}`, "Éligibilité", "Urgence ?"],
      en: [`${bt} inventory`, "Eligibility", "Emergency?"],
    },
    leaderboard: {
      ar: ["شاراتي", `مخزون في ${w}`, "كيف أتبرع؟"],
      fr: ["Mes badges", `Stock ${w}`, "Comment donner ?"],
      en: ["My badges", `Stock in ${w}`, "How to donate?"],
    },
    emergency: {
      ar: [`مخزون ${bt} في ${w}`, "شبكة الدم النادر", "أقرب مركز"],
      fr: [`Stock ${bt}`, "Sang rare", "Centre proche"],
      en: [`${bt} stock`, "Rare donors", "Nearest center"],
    },
    prescreening: {
      ar: ["هل أنا مؤهل؟", `أين أتبرع في ${w}؟`, "ماذا أحضر للمركز؟"],
      fr: ["Éligible ?", `Centre ${w}`, "Quoi apporter ?"],
      en: ["Eligible?", `Center in ${w}`, "What to bring?"],
    },
    app_help: {
      ar: ["افتح الخريطة", "جواز التبرع", "هل أنا مؤهل؟"],
      fr: ["Carte", "Passeport donneur", "Éligibilité"],
      en: ["Map feature", "Donation passport", "Eligibility"],
    },
    general_info: {
      ar: ["هل أنا مؤهل؟", `أين أتبرع في ${w}؟`, "كيف أستخدم قطرة؟"],
      fr: ["Éligible ?", `Donner à ${w}`, "App Qatra"],
      en: ["Am I eligible?", `Donate in ${w}`, "Qatra app guide"],
    },
    thanks: {
      ar: ["هل أنا مؤهل؟", `مراكز في ${w}`, "شاراتي"],
      fr: ["Éligible ?", `Centres ${w}`, "Badges"],
      en: ["Eligible?", `Centers ${w}`, "My badges"],
    },
    greeting: {
      ar: ["هل أنا مؤهل للتبرع؟", `أين أتبرع في ${w}؟`, "كيف أستخدم التطبيق؟"],
      fr: ["Suis-je éligible ?", `Où donner à ${w} ?`, "Guide Qatra"],
      en: ["Can I donate?", `Where to donate in ${w}?`, "How to use the app?"],
    },
    general: {
      ar: ["هل أنا مؤهل؟", `أين أتبرع في ${w}؟`, "مخزون الدم"],
      fr: ["Éligible ?", `Centre ${w}`, "Stock sang"],
      en: ["Eligible?", `Centers ${w}`, "Blood stock"],
    },
  };

  const pool = pools[intent] || pools.general;
  const langKey = pickLang(lang);
  return (pool[langKey] || pool.ar).slice(0, 3);
}

function conversationalWrap(reply, intent, lang, ctx, isFirstTurn) {
  if (!reply || intent === "thanks" || intent === "greeting") return reply;

  const bridges = {
    ar: {
      eligibility: "",
      centers: "",
      inventory: "",
      followUp: ctx.turnCount > 1 ? "\n\n💬 اسألني متابعة أو غيّر الولاية/الفصيلة في رسالتك." : "",
    },
    fr: {
      followUp: ctx.turnCount > 1 ? "\n\n💬 Posez une autre question ou précisez wilaya/groupe." : "",
    },
  };

  const extra = pickLang(lang) === "ar" ? bridges.ar.followUp : bridges.fr?.followUp || "";
  if (isFirstTurn && intent === "general") return reply;
  return reply + (extra || "");
}

/**
 * One conversational turn with history.
 * @param {{ message: string, lang: string, donor: object, history?: Array<{role:string, content?:string, text?:string, intent?:string}> }} params
 */
export function runChatTurn({ message, lang = "ar", donor, history = [] }) {
  const ctx = buildContextFromHistory(history, donor);
  const expanded = expandMessageWithContext(message, ctx, lang);

  let reply;
  let intent;

  if (expanded === "__thanks__") {
    intent = "thanks";
    reply = thanksReply(lang, donor);
  } else if (expanded === "__greeting__") {
    intent = "greeting";
    reply = greetingReply(lang, donor);
  } else {
    intent = detectIntentWithContext(expanded, ctx);
    const wilaya = extractWilayaFromText(expanded, resolveWilaya) || ctx.lastWilaya;
    const bloodType = extractBloodType(expanded) || ctx.lastBloodType;

    reply = getDamBotReply(expanded, lang, donor, { intent, wilaya, bloodType });
    ctx.lastWilaya = wilaya;
    ctx.lastBloodType = bloodType;
    ctx.lastIntent = intent;
    reply = conversationalWrap(reply, intent, lang, ctx, ctx.turnCount <= 1);
  }

  const suggestions = getFollowUpSuggestions(intent, lang, donor, ctx);

  return {
    reply,
    intent,
    suggestions,
    context: { wilaya: ctx.lastWilaya, bloodType: ctx.lastBloodType },
  };
}

export function getWelcomeMessage(lang, donor) {
  const name = donor?.name?.split(" ")[0] ?? "";
  if (lang === "fr") {
    return {
      text: `Bonjour${name ? ` ${name}` : ""} ! 🩸 Je suis DamBot. Posez votre question librement — je me souviens de notre conversation.`,
      suggestions: ["Suis-je éligible ?", "Où donner aujourd'hui ?", "Comment utiliser l'app ?"],
    };
  }
  if (lang === "en") {
    return {
      text: `Hi${name ? ` ${name}` : ""}! 🩸 I'm DamBot. Type anything — I'll remember context from our chat.`,
      suggestions: ["Can I donate?", "Nearest center", "How to use Qatra?"],
    };
  }
  return {
    text: `مرحباً${name ? ` ${name}` : ""}! 🩸 أنا DamBot. اكتب سؤالك بحرية — أتذكر سياق محادثتنا.`,
    suggestions: ["هل أنا مؤهل؟", "أين أتبرع اليوم؟", "كيف أستخدم التطبيق؟"],
  };
}
