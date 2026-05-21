import { getEligibility } from "./eligibility.js";

export function mapDonorRow(row) {
  const { isEligible, daysUntilEligible } = getEligibility(row.last_donation);

  return {
    id: row.id,
    name: row.name,
    bloodType: row.blood_type,
    wilaya: row.wilaya,
    lastDonation: row.last_donation,
    totalDonations: row.total_donations,
    points: row.points,
    isEligible,
    daysUntilEligible,
    familyCircleActive: Boolean(row.family_circle_active),
  };
}

export function mapSosRow(row) {
  return {
    id: row.id,
    bloodType: row.blood_type,
    hospital: row.hospital,
    wilaya: row.wilaya,
    urgency: row.urgency,
    postedAt: row.posted_at,
    active: Boolean(row.active),
  };
}

export function mapWilayaRow(row) {
  return {
    name: row.name,
    nameAr: row.name_ar,
    status: row.status,
    shortage: row.shortage,
    hospitals: JSON.parse(row.hospitals),
  };
}

export function mapFamilyRow(row) {
  return {
    id: row.id,
    name: row.name,
    relationAr: row.relation_ar,
    relationFr: row.relation_fr,
    bloodType: row.blood_type,
    wilaya: row.wilaya,
    alertOrder: row.alert_order,
  };
}
