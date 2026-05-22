/**
 * Real WGS84 coordinates for SOS / emergency map pins (OSM + public hospital listings).
 * Key by sosId or exact hospital name from API/mock.
 */
export const HOSPITAL_COORDINATES = {
  "SOS-001": { lat: 36.7622, lng: 3.0534, nameAr: "مستشفى مصطفى باشا", nameFr: "CHU Mustapha Pacha" },
  "CHU Mustapha Pacha": { lat: 36.7622, lng: 3.0534 },
  "SOS-002": { lat: 36.7949, lng: 3.0492, nameAr: "مستشفى باب الوادي", nameFr: "CHU Mohamed Lamine Debaghine" },
  "EHSU Bab El Oued": { lat: 36.7949, lng: 3.0492 },
  "CHU Mohamed Lamine Debaghine": { lat: 36.7949, lng: 3.0492 },
  "SOS-003": { lat: 36.2864, lng: 6.6183, nameAr: "مستشفى قسنطينة", nameFr: "CHU Constantine" },
  "CHU Constantine": { lat: 36.2864, lng: 6.6183 },
};

export function resolveHospitalCoords(sosId, hospitalName) {
  return (
    HOSPITAL_COORDINATES[sosId] ??
    HOSPITAL_COORDINATES[hospitalName] ??
    null
  );
}
