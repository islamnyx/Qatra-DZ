export function parseHoursJson(raw) {
  if (!raw) return { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] };
  try {
    const h = JSON.parse(raw);
    if (h?.open && h?.close) return h;
  } catch {
    /* use default */
  }
  return { open: "08:00", close: "16:00", days: [1, 2, 3, 4, 5, 6] };
}

export function mapCenterRow(row) {
  const hours = parseHoursJson(row.hours_json);
  const phone = row.phone?.startsWith("+") ? row.phone : row.phone ? `+213${row.phone.replace(/\D/g, "").slice(-9)}` : null;

  return {
    id: row.slug || `center-${row.id}`,
    nameAr: row.name_ar || row.name,
    nameFr: row.name_fr || row.name,
    lat: row.lat,
    lng: row.lng,
    phone: phone || "+21321234567",
    hours,
    wilaya: row.wilaya,
    address: row.address,
    mobileDrive: row.mobile_drive,
  };
}

export function mapDriveRow(row) {
  let bloodTypes = [];
  try {
    bloodTypes = JSON.parse(row.blood_types);
  } catch {
    bloodTypes = [];
  }

  return {
    id: row.id,
    nameAr: row.name_ar,
    nameFr: row.name_fr,
    lat: row.lat,
    lng: row.lng,
    start: row.start_at,
    end: row.end_at,
    bloodTypesNeeded: bloodTypes,
    volunteerCount: row.volunteer_count ?? 0,
    qrCheckIn: Boolean(row.qr_check_in),
    wilaya: row.wilaya,
  };
}

export function mapEmergencyRow(row) {
  return {
    id: `SOS-MAP-${row.id}`,
    sosId: row.id,
    bloodType: row.blood_type,
    hospitalAr: row.hospital_ar || row.hospital,
    hospitalFr: row.hospital_fr || row.hospital,
    wilaya: row.wilaya,
    urgency: row.urgency,
    lat: row.lat,
    lng: row.lng,
    postedAt: row.posted_at,
  };
}
