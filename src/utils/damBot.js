import { donor } from "../mockData";

export function getDamBotReply(text, lang = "ar") {
  const q = text.trim().toLowerCase();

  const eligibleAr = donor.isEligible
    ? `نعم ${donor.name.split(" ")[0]}! أنت مؤهل للتبرع اليوم. آخر تبرع: ${donor.lastDonation}.`
    : `ليس بعد. متبقي ${donor.daysUntilEligible} يوم حتى تكون مؤهلاً.`;

  const eligibleFr = donor.isEligible
    ? `Oui ! Vous êtes éligible aujourd'hui. Dernier don : ${donor.lastDonation}.`
    : `Pas encore. Encore ${donor.daysUntilEligible} jours avant l'éligibilité.`;

  if (q.includes("مؤهل") || q.includes("eligible") || q.includes("éligib"))
    return lang === "fr" ? eligibleFr : eligibleAr;

  if (q.includes("مركز") || q.includes("أقرب") || q.includes("centre") || q.includes("proche"))
    return lang === "fr"
      ? "Centre le plus proche : Transfusion Alger Centre — 2.4 km."
      : "أقرب مركز: Centre de transfusion Alger Centre — 2.4 كم.";

  if (q.includes("فصيلة") || q.includes("دمي") || q.includes("groupe") || q.includes("sang"))
    return lang === "fr"
      ? `Votre groupe sanguin est ${donor.bloodType} — type rare, très demandé.`
      : `فصيلتك ${donor.bloodType} — نادرة ومطلوبة جداً.`;

  if (q.includes("56") || q.includes("لماذا") || q.includes("pourquoi"))
    return lang === "fr"
      ? "56 jours = délai de récupération recommandé par le CRA."
      : "56 يوماً = فترة التعافي الموصى بها من الهلال الأحمر الجزائري.";

  return lang === "fr"
    ? "Je suis DamBot. Posez-moi : éligibilité, centre proche, ou groupe sanguin."
    : "أنا DamBot. اسألني عن: الأهلية، أقرب مركز، أو فصيلة دمك.";
}

export const quickPrompts = {
  ar: ["هل أنا مؤهل؟", "أقرب مركز تبرع", "ما فصيلة دمي؟"],
  fr: ["Suis-je éligible ?", "Centre le plus proche", "Mon groupe sanguin ?"],
};
