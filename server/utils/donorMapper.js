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
    isRareDonor: Boolean(row.is_rare_donor),
  };
}

export function mapSosRow(row) {
  return {
    id: row.id,
    bloodType: row.blood_type,
    hospital: row.hospital,
    hospitalAr: row.hospital_ar || row.hospital,
    hospitalFr: row.hospital_fr || row.hospital,
    wilaya: row.wilaya,
    urgency: row.urgency,
    postedAt: row.posted_at,
    active: Boolean(row.active),
    lat: row.lat ?? null,
    lng: row.lng ?? null,
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
