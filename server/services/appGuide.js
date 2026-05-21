/** Qatra donor app — user guide for DamBot (AR / FR / EN). */

function L(lang, ar, fr, en) {
  if (lang === "fr") return fr;
  if (lang === "ar") return ar;
  return en;
}

const SECTIONS = {
  overview: (lang) =>
    L(
      lang,
      `📱 دليل تطبيق قطرة (Qatra)

🏠 الرئيسية: حلقة الأهلية (56 يوم)، نقاط، شارات، ونداء SOS عاجل — اضغط «استجب الآن» مع وقت وصولك.
🗺️ الخريطة: مراكز التبرع، الحملات الجوالة، مسار GPS، نداءات طوارئ على الخريطة.
💬 DamBot: أنا هنا — الأهلية، المراكز، المخزون، الشارات، كل شيء.
📰 الأخبار: حملات CRA وتسجيل الاهتمام.
👤 الملف: سجل التبرعات والشارات.
📘 جواز التبرع: QR للتحقق في المركز.
👨‍👩‍👧‍👦 خزنة العائلة: تنبيهات أقاربك حسب ترتيب الدم.

⚙️ الإعداد: زر اللغة (عربي/فرنسي) أعلى الشاشات. شارة «API» في الشريط = اتصال بالخادم؛ بدونها يعمل التطبيق بوضع تجريبي.`,
      `📱 Guide Qatra

🏠 Accueil : éligibilité (56 j), points, badges, SOS urgent.
🗺️ Carte : centres, collectes mobiles, GPS, urgences.
💬 DamBot : éligibilité, centres, stock, badges.
📰 Fil : campagnes CRA.
👤 Profil : historique et badges.
📘 Passeport : QR au centre.
👨‍👩‍👧‍👦 Famille : alertes aux proches.

⚙️ Langue AR/FR en haut. Badge « API » = serveur connecté.`,
      `📱 Qatra app guide — Home, Map, Chat, Feed, Profile, Passport, Family Vault. Language toggle AR/FR. API badge = live server.`
    ),

  home: (lang) =>
    L(
      lang,
      `🏠 الصفحة الرئيسية
• الحلقة الخضراء = مؤهل اليوم؛ البرتقالية = أيام متبقية (56 يوم CRA).
• «لماذا 56 يوم؟» يشرح فترة التعافي.
• بانر SOS: يعرض أقصى حاجة (فصيلة + مستشفى). «استجب» → اختر ETA → تأكيد (مرة واحدة لكل نداء).
• «شارك قطرة» ينسخ نص الطوارئ.
• بطاقات: الملف، الخريطة، جواز التبرع، خزنة العائلة.`,
      `🏠 Accueil — Anneau d'éligibilité, SOS (répondre une fois), partage, raccourcis profil/carte/passeport/famille.`,
      `🏠 Home — Eligibility ring, SOS respond once, share, quick links.`
    ),

  map: (lang) =>
    L(
      lang,
      `🗺️ الخريطة
• نقاط حمراء = مراكز (مفتوح/مقفل حسب أهليتك).
• زر موقعي: GPS — إن رُفض الموقع تُعرض الجزائر.
• اضغط مركزاً → ورقة تفاصيل + توجيه.
• حملات زرقاء = جارية أو قادمة؛ «سأحضر» للتسجيل.
• طوارئ برتقالية = «أستطيع المساعدة» (خصوصية: CRA يتوسط).
• QR: أقرب حملة تقبل الجواز الرقمي.`,
      `🗺️ Carte — Centres, drives, GPS, urgences, QR passeport.`,
      `🗺️ Map — Centers, drives, GPS, emergencies, QR hint.`
    ),

  passport: (lang) =>
    L(
      lang,
      `📘 جواز التبرع الرقمي
• QR يحتوي: هويتك، الفصيلة، آخر تبرع، الأهلية.
• اعرضه في مركز التبرع للتحقق السريع.
• لا يحل محل الفحص الطبي في الموقع.`,
      `📘 Passeport donneur — QR vérifié au centre, pas un examen médical.`,
      `📘 Donation passport — Show QR at center; not a medical clearance.`
    ),

  family: (lang) =>
    L(
      lang,
      `👨‍👩‍👧‍👦 خزنة دم العائلة
• قائمة أقارب + فصائلهم + ولاياتهم.
• تفعيل/إيقاف «دائرة التنبيه».
• عند نقص دم مطابق، يُبلّغ الأقارب حسب الترتيب (تجريبي: زر تنبيه تجريبي).`,
      `👨‍👩‍👧‍👦 Coffre familial — Alertes ordonnées par compatibilité.`,
      `👨‍👩‍👧‍👦 Family vault — Ordered alerts by blood match.`
    ),

  feed: (lang) =>
    L(
      lang,
      `📰 الأخبار والفعاليات
• حملات وطنية — «سجّل اهتمامك» يزيد العداد (يتطلب API).
• فعاليات ونجاحات CRA.`,
      `📰 Fil d'actualités — Campagnes, inscription intérêt.`,
      `📰 Feed — Campaigns and CRA news.`
    ),

  config: (lang) =>
    L(
      lang,
      `⚙️ الإعداد واستكشاف الأخطاء
• اللغة: زر AR/FR (يحفظ في الجلسة).
• API غير متصل: بيانات تجريبية من mockData — جرّب: cd server && npm start ثم أعد تحميل التطبيق.
• الهاتف على نفس Wi‑Fi: افتح رابط Network من terminal الـ frontend.
• .env.local: VITE_API_BASE للإنتاج؛ VITE_DATA_PROVIDER=firebase للفريق Firebase.
• لا تشارك مفتاح API أو Groq في Git.`,
      `⚙️ Config — Langue, API localhost:3001, .env.local, Wi‑Fi mobile.`,
      `⚙️ Config — Language, API on :3001, env vars, mobile testing.`
    ),

  edge: (lang) =>
    L(
      lang,
      `🔧 حالات خاصة
• غير مؤهل: الخريطة تُقفل المراكز مؤقتاً — الحلقة تُظهر الأيام المتبقية.
• استجبت لـ SOS مسبقاً: لا يمكن الاستجابة مرتين لنفس النداء.
• تبرع أول مرة: لا تاريخ آخر تبرع → الأهلية «نعم» مع فحص طبي في المركز.
• فصيلة نادرة (O-, AB-): أولوية في الطوارئ.
• BloodSync (مستشفى): لوحة Nexus على :5174 — تحليل نقل الدم والنقص (للطاقم).`,
      `🔧 Cas limites — Cooldown 56j, SOS unique, première visite, sang rare, BloodSync hôpital :5174.`,
      `🔧 Edge cases — 56-day cooldown, one SOS response, first visit, rare types, hospital panel :5174.`
    ),
};

export function detectAppHelpTopic(text) {
  const q = text.toLowerCase();
  if (/map|خريطة|carte|gps|location/i.test(q)) return "map";
  if (/passport|جواز|passeport|qr/i.test(q)) return "passport";
  if (/family|عائلة|famille|vault|خزنة/i.test(q)) return "family";
  if (/feed|أخبار|news|campagn/i.test(q)) return "feed";
  if (/home|رئيسية|accueil|sos|استجب/i.test(q)) return "home";
  if (/config|setup|install|env|api|offline|إعداد|تثبيت|wifi/i.test(q)) return "config";
  if (/edge|troubleshoot|مشكل|error|خطأ|bug/i.test(q)) return "edge";
  return "overview";
}

export function getAppHelpReply(lang, text) {
  const topic = detectAppHelpTopic(text);
  const body = SECTIONS[topic]?.(lang) ?? SECTIONS.overview(lang);
  return body;
}

export function getGeneralInfoReply(lang, text) {
  const q = text.toLowerCase();

  if (/safe|آمن|sécuris|danger|sterile/i.test(q)) {
    return L(
      lang,
      "✅ التبرع آمن: إبرة معقمة لمرة واحدة، فريق طبي مدرب. آثار خفيفة: دوخة بسيطة — تناول سائل وسكر بعد التبرع.",
      "✅ Don sécurisé : matériel stérile à usage unique, équipe qualifiée.",
      "✅ Donation is safe: sterile single-use equipment."
    );
  }
  if (/how long|combien de temps|مدة|take|يستغرق/i.test(q)) {
    return L(
      lang,
      "⏱️ التبرع الكامل ~45–60 دقيقة (استقبال + فحص + سحب ~10–15 دقيقة).",
      "⏱️ ~45–60 min au total ; prélèvement ~10–15 min.",
      "⏱️ Full visit ~45–60 min; draw ~10–15 min."
    );
  }
  if (/eat|food|طعام|manger|fasting|صائم|stomach/i.test(q)) {
    return L(
      lang,
      "🍽️ قبل التبرع: وجبة خفيفة + ترطيب. تجنب الصيام الكامل. بعد التبرع: سائل + وجبة خفيفة.",
      "🍽️ Mangez léger et hydratez-vous avant ; évitez le jeûne strict.",
      "🍽️ Light meal + hydration before; avoid fasting."
    );
  }
  if (/bring|ماذا أحضر|apporter|documents/i.test(q)) {
    return L(
      lang,
      "🪪 أحضر: بطاقة هوية، جواز قطرة (QR)، قائمة أدوية إن وُجدت. احصل على نوم كافٍ.",
      "🪪 Pièce d'identité, passeport Qatra, liste médicaments.",
      "🪪 ID, Qatra passport QR, medication list."
    );
  }
  if (/benefit|فائدة|pourquoi|why donate|لماذا أتبرع/i.test(q)) {
    return L(
      lang,
      "❤️ تبرع واحد قد ينقذ حتى 3 أرواح. فحص مجاني، تعزيز المجتمع، أولوية في الطوارئ للمتبرعين المنتظمين.",
      "❤️ Un don peut sauver 3 vies ; dépistage gratuit inclus.",
      "❤️ One donation can save up to 3 lives."
    );
  }
  if (/how often|كم مرة|fréquence|interval|between donation/i.test(q)) {
    return L(
      lang,
      "📅 الهلال الأحمر الجزائري: 56 يوماً بين التبرعات للرجال والنساء (قاعدة التطبيق).",
      "📅 56 jours entre deux dons (règle CRA dans Qatra).",
      "📅 56 days between donations (CRA rule in Qatra)."
    );
  }
  if (/requirement|متطلب|condition|qualify|معايير/i.test(q)) {
    return L(
      lang,
      "📋 متطلبات أساسية: 18–65 سنة، ≥50 كغ، صحة جيدة، بدون حمل، بدون وشم/ثقب <6 أشهر، موافقة الفحص الطبي.",
      "📋 18–65 ans, ≥50 kg, bonne santé, pas de grossesse, tatouage/piercing >6 mois.",
      "📋 Age 18–65, ≥50kg, good health, no pregnancy, tattoo/piercing 6+ months ago."
    );
  }
  if (/how does|كيف يعمل|comment ça|process|works/i.test(q)) {
    return L(
      lang,
      "1️⃣ تسجيل 2️⃣ استبيان صحة 3️⃣ فحص طبي 4️⃣ سحب ~450مل 5️⃣ راحة + وجبة خفيفة 6️⃣ تحديث جواز قطرة.",
      "1️⃣ Accueil 2️⃣ Questionnaire 3️⃣ Examen 4️⃣ Prélèvement 5️⃣ Repos 6️⃣ Mise à jour passeport.",
      "1️⃣ Register 2️⃣ Health form 3️⃣ Medical check 4️⃣ Draw 5️⃣ Rest 6️⃣ Update passport."
    );
  }

  return L(
    lang,
    "🩸 التبرع بالدم عبر الهلال الأحمر الجزائري آمن ومجاني. اسألني عن: الأهلية، المراكز، الوقت بين التبرعات، أو «كيف أستخدم التطبيق».",
    "🩸 Don de sang via la CRA. Demandez : éligibilité, centres, délai 56j, ou guide app.",
    "🩸 Blood donation via Algerian Red Crescent. Ask eligibility, centers, 56-day rule, or app guide."
  );
}

export function getPrescreeningInfoReply(lang) {
  return L(
    lang,
    `🩺 الاستبيان والفحص قبل التبرع:
• في التطبيق: اسأل «استبيان ما قبل التبرع» — 5 أسئلة (صحة، أدوية، سفر، كحول، وزن).
• في المركز: الهيموغلوبين، ضغط، نبض، حرارة، مقابلة طبية.
• POST /api/blood/prescreening للإجابات التفصيلية.
⚠️ ليس تشخيصاً — القرار النهائي للطبيب في المركز.`,
    `🩺 Pré-dépistage : questionnaire DamBot + examen sur place (hémoglobine, tension…).`,
    `🩺 Pre-screening: DamBot questionnaire + on-site hemoglobin, BP, interview.`
  );
}
