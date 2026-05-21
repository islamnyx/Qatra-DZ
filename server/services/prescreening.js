/** Medical pre-screening questionnaire (simulation — not a diagnosis). */

export const PRESCREENING_STEPS = [
  {
    id: "general",
    question: "Do you feel healthy today (no fever, cough, or active infection)?",
    questionAr: "هل تشعر بصحة جيدة اليوم (بدون حمى أو سعال أو عدوى نشطة)؟",
    questionFr: "Vous sentez-vous en bonne santé aujourd'hui (pas de fièvre, toux ou infection active) ?",
    field: "feelsHealthy",
    required: true,
  },
  {
    id: "medications",
    question: "Are you currently taking antibiotics, blood thinners, or chemotherapy?",
    questionAr: "هل تتناول حالياً مضادات حيوية أو مميعات دم أو علاجاً كيميائياً؟",
    questionFr: "Prenez-vous actuellement des antibiotiques, anticoagulants ou chimiothérapie ?",
    field: "highRiskMeds",
    required: true,
  },
  {
    id: "travel",
    question: "Have you traveled to a malaria-risk area in the last 12 months?",
    questionAr: "هل سافرت إلى منطقة خطر ملاريا خلال الـ 12 شهراً الماضية؟",
    questionFr: "Avez-vous voyagé dans une zone à risque de paludisme ces 12 derniers mois ?",
    field: "malariaTravel",
    required: true,
  },
  {
    id: "lifestyle",
    question: "Have you consumed alcohol in the last 24 hours?",
    questionAr: "هل استهلكت الكحول خلال الـ 24 ساعة الماضية؟",
    questionFr: "Avez-vous consommé de l'alcool dans les dernières 24 heures ?",
    field: "recentAlcohol",
    required: true,
  },
  {
    id: "weight",
    question: "Is your weight at least 50 kg?",
    questionAr: "هل وزنك 50 كغ على الأقل؟",
    questionFr: "Votre poids est-il d'au moins 50 kg ?",
    field: "meetsWeight",
    required: true,
  },
];

export function getPrescreeningForm() {
  return {
    disclaimer:
      "This questionnaire prepares you for on-site CRA screening. It is not a medical diagnosis.",
    disclaimerAr: "هذا الاستبيان يحضّرك للفحص في مركز الهلال الأحمر — ليس تشخيصاً طبياً.",
    disclaimerFr:
      "Ce questionnaire prépare le dépistage sur place — ce n'est pas un diagnostic médical.",
    steps: PRESCREENING_STEPS,
  };
}

/**
 * @param {Record<string, boolean>} answers — true = yes to risk question
 */
export function evaluatePrescreening(answers = {}) {
  const flags = [];

  if (answers.feelsHealthy === false) flags.push("ACTIVE_ILLNESS");
  if (answers.highRiskMeds === true) flags.push("MEDICATION_REVIEW");
  if (answers.malariaTravel === true) flags.push("MALARIA_DEFERRAL");
  if (answers.recentAlcohol === true) flags.push("ALCOHOL_24H");
  if (answers.meetsWeight === false) flags.push("WEIGHT_LOW");

  let status = "ready";
  if (flags.includes("WEIGHT_LOW") || flags.includes("ACTIVE_ILLNESS")) status = "deferred";
  else if (flags.length > 0) status = "needs_review";

  return {
    status,
    flags,
    message:
      status === "ready"
        ? "Pre-screening passed. Proceed to your nearest center for final medical approval."
        : status === "needs_review"
          ? "Some answers require CRA medical review before donation."
          : "You may be temporarily deferred. Contact your nearest transfusion center.",
    messageAr:
      status === "ready"
        ? "اجتزت الاستبيان. توجه لأقرب مركز للموافقة الطبية النهائية."
        : status === "needs_review"
          ? "بعض الإجابات تتطلب مراجعة طبية من الهلال الأحمر."
          : "قد يكون هناك تأجيل مؤقت. تواصل مع أقرب مركز نقل دم.",
    messageFr:
      status === "ready"
        ? "Pré-dépistage OK. Rendez-vous au centre pour validation médicale finale."
        : status === "needs_review"
          ? "Certaines réponses nécessitent un avis médical CRA."
          : "Report possible. Contactez votre centre de transfusion.",
  };
}
