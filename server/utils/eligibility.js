export const MIN_DAYS_BETWEEN_DONATIONS = 56;

export function getEligibility(lastDonation) {
  if (!lastDonation) {
    return { isEligible: true, daysUntilEligible: 0 };
  }

  const last = new Date(lastDonation);
  const today = new Date();
  const diffMs = today - last;
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysUntilEligible = Math.max(0, MIN_DAYS_BETWEEN_DONATIONS - daysSince);

  return {
    isEligible: daysUntilEligible === 0,
    daysUntilEligible,
  };
}
