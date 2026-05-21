/** CRA-aligned donor eligibility rules (deterministic, testable). */

export const MIN_WEIGHT_KG = 50;
export const MIN_AGE = 18;
export const MAX_AGE = 65;
export const TATTOO_WAIT_MONTHS = 6;
export const PREGNANCY_DEFERRAL_MONTHS = 6;

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export function normalizeBloodType(type) {
  if (!type) return null;
  const t = String(type).toUpperCase().replace(/\s/g, "");
  const map = {
    "O-": "O-",
    "O+": "O+",
    "A-": "A-",
    "A+": "A+",
    "B-": "B-",
    "B+": "B+",
    "AB-": "AB-",
    "AB+": "AB+",
  };
  return map[t] ?? (BLOOD_TYPES.includes(t) ? t : null);
}

/**
 * @param {{
 *   weightKg?: number,
 *   age?: number,
 *   pregnant?: boolean,
 *   tattooMonthsAgo?: number,
 *   piercingMonthsAgo?: number,
 *   onMedication?: boolean,
 *   recentIllness?: boolean,
 *   recentSurgery?: boolean,
 *   lastDonation?: string | null,
 * }} input
 */
export function evaluateEligibility(input = {}) {
  const reasons = [];
  const warnings = [];

  if (input.weightKg != null) {
    if (input.weightKg < MIN_WEIGHT_KG) {
      reasons.push({
        code: "WEIGHT_LOW",
        message: `Minimum weight is ${MIN_WEIGHT_KG}kg (provided: ${input.weightKg}kg).`,
        messageAr: `الحد الأدنى للوزن ${MIN_WEIGHT_KG} كغ (وزنك: ${input.weightKg} كغ).`,
        messageFr: `Poids minimum ${MIN_WEIGHT_KG} kg (fourni : ${input.weightKg} kg).`,
      });
    }
  }

  if (input.age != null) {
    if (input.age < MIN_AGE) {
      reasons.push({
        code: "AGE_LOW",
        message: `Minimum age is ${MIN_AGE}.`,
        messageAr: `الحد الأدنى للعمر ${MIN_AGE} سنة.`,
        messageFr: `Âge minimum : ${MIN_AGE} ans.`,
      });
    } else if (input.age > MAX_AGE) {
      reasons.push({
        code: "AGE_HIGH",
        message: `Maximum age for donation is ${MAX_AGE} (medical review may apply).`,
        messageAr: `الحد الأقصى للعمر ${MAX_AGE} سنة (مراجعة طبية قد تُطبق).`,
        messageFr: `Âge maximum : ${MAX_AGE} ans (avis médical possible).`,
      });
    }
  }

  if (input.pregnant) {
    reasons.push({
      code: "PREGNANCY",
      message: "Deferred during pregnancy and for 6–9 months after delivery.",
      messageAr: "تأجيل أثناء الحمل ولمدة 6–9 أشهر بعد الولادة.",
      messageFr: "Report pendant la grossesse et 6–9 mois après l'accouchement.",
    });
  }

  const tattooMonths = input.tattooMonthsAgo ?? input.piercingMonthsAgo;
  if (tattooMonths != null && tattooMonths < TATTOO_WAIT_MONTHS) {
    const left = TATTOO_WAIT_MONTHS - tattooMonths;
    reasons.push({
      code: "TATTOO_PIERCING",
      message: `Tattoo/piercing requires ${TATTOO_WAIT_MONTHS}-month wait (${left} month(s) remaining).`,
      messageAr: `الوشم/الثقب يتطلب انتظار ${TATTOO_WAIT_MONTHS} أشهر (متبقي ${left} شهر).`,
      messageFr: `Tatouage/piercing : attente ${TATTOO_WAIT_MONTHS} mois (${left} mois restants).`,
    });
  }

  if (input.onMedication) {
    warnings.push({
      code: "MEDICATION_REVIEW",
      message: "Certain medications require a waiting period — medical review required.",
      messageAr: "بعض الأدوية تتطلب فترة انتظار — مراجعة طبية مطلوبة.",
      messageFr: "Certains médicaments imposent un délai — avis médical requis.",
    });
  }

  if (input.recentIllness) {
    warnings.push({
      code: "RECENT_ILLNESS",
      message: "Recent illness may require temporary deferral until fully recovered.",
      messageAr: "المرض الأخير قد يتطلب تأجيلاً مؤقتاً حتى الشفاء التام.",
      messageFr: "Maladie récente : report possible jusqu'à rétablissement complet.",
    });
  }

  if (input.recentSurgery) {
    warnings.push({
      code: "RECENT_SURGERY",
      message: "Recent surgery may require temporary deferral — consult medical staff.",
      messageAr: "العملية الجراحية الأخيرة قد تتطلب تأجيلاً — استشر الفريق الطبي.",
      messageFr: "Chirurgie récente : report possible — consultez l'équipe médicale.",
    });
  }

  let status = "eligible";
  if (reasons.length > 0) status = "deferred";
  else if (warnings.length > 0) status = "needs_review";

  return {
    status,
    eligible: status === "eligible",
    reasons,
    warnings,
    nextStep:
      status === "eligible"
        ? "Complete on-site medical screening at your nearest CRA center."
        : status === "needs_review"
          ? "Book a pre-donation review with CRA medical staff."
          : "Resolve deferral criteria before your next visit.",
  };
}
