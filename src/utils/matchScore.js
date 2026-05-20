import { donor } from "../mockData";

export function calculateMatchScore(request) {
  if (!request) return 0;
  let score = 40;
  if (request.bloodType === donor.bloodType) score += 35;
  else if (request.bloodType.replace("-", "+") === donor.bloodType.replace("-", "+"))
    score += 20;
  if (request.wilaya === donor.wilaya) score += 20;
  if (donor.isEligible) score += 15;
  else score -= 30;
  if (request.urgency === "critical") score += 5;
  return Math.min(Math.max(Math.round(score), 0), 99);
}
