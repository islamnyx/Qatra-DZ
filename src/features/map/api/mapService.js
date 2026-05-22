/**
 * Map team: change data HERE only. Do not import api/ or firebase/ in UI components.
 */
import { data } from "../../../services/data/index.js";
import { wilayaStatus as mockWilayas, sosRequests as mockSos } from "../../../mockData.js";
import {
  donationCenters,
  mobileDrives,
  emergencyAlerts,
} from "../mock/mapData.js";
import { sortByDistance } from "../utils/geo.js";
import { mergeWilayaStatus } from "../data/mergeWilayaStatus.js";
import { resolveHospitalCoords } from "../data/hospitalCoordinates.js";
import { loadWorldCountriesGeo } from "../utils/geoCache.js";

loadWorldCountriesGeo();

export async function fetchWilayas() {
  const payload = await fetchMapRegions();
  return payload.wilayas;
}

/** All 69 DZ wilayas + neighboring country regions for low-zoom context */
export async function fetchMapRegions() {
  let apiList;
  try {
    apiList = await data.getWilayas();
  } catch {
    apiList = mockWilayas;
  }
  return {
    wilayas: mergeWilayaStatus(apiList),
  };
}

/**
 * Donor map payload — centers, drives, emergencies sorted by distance when lat/lng provided.
 */
export async function fetchDonorMapData(lat, lng) {
  const emergencies =
    emergencyAlerts.length > 0
      ? emergencyAlerts
      : mockSos.slice(0, 2).map((r) => {
          const coords = resolveHospitalCoords(r.id, r.hospital);
          const fallback = { lat: 36.7538, lng: 3.0588 };
          return {
            id: `SOS-MAP-${r.id}`,
            sosId: r.id,
            bloodType: r.bloodType,
            hospitalAr: coords?.nameAr ?? r.hospital,
            hospitalFr: coords?.nameFr ?? r.hospital,
            wilaya: r.wilaya,
            urgency: r.urgency,
            lat: coords?.lat ?? fallback.lat,
            lng: coords?.lng ?? fallback.lng,
            postedAt: r.postedAt,
          };
        });

  const centers = lat != null && lng != null
    ? sortByDistance(donationCenters, lat, lng)
    : donationCenters;

  const drives = lat != null && lng != null
    ? sortByDistance(mobileDrives, lat, lng)
    : mobileDrives;

  const alerts = lat != null && lng != null
    ? sortByDistance(emergencies, lat, lng)
    : emergencies;

  return { centers, drives, emergencies: alerts };
}

export function getQrHighlightDrive(drives, lat, lng) {
  const qrDrives = drives.filter((d) => d.qrCheckIn);
  if (!qrDrives.length || lat == null) return null;
  return qrDrives[0];
}
