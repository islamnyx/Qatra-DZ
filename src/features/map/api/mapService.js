/**
 * Map team: change data HERE only. Do not import api/ or firebase/ in UI components.
 */
import { api } from "../../../api/client.js";
import { data } from "../../../services/data/index.js";
import { wilayaStatus as mockWilayas, sosRequests as mockSos } from "../../../mockData.js";
import {
  donationCenters,
  mobileDrives,
  emergencyAlerts,
} from "../mock/mapData.js";
import { sortByDistance } from "../utils/geo.js";

export async function fetchWilayas() {
  try {
    return await data.getWilayas();
  } catch {
    return mockWilayas;
  }
}

function mockPayload(lat, lng) {
  const emergencies =
    emergencyAlerts.length > 0
      ? emergencyAlerts
      : mockSos.slice(0, 2).map((r, i) => ({
          id: `SOS-MAP-${r.id}`,
          sosId: r.id,
          bloodType: r.bloodType,
          hospitalAr: r.hospital,
          hospitalFr: r.hospital,
          wilaya: r.wilaya,
          urgency: r.urgency,
          lat: 36.764 + i * 0.02,
          lng: 3.052 + i * 0.04,
          postedAt: r.postedAt,
        }));

  const centers =
    lat != null && lng != null
      ? sortByDistance(donationCenters, lat, lng)
      : donationCenters;

  const drives =
    lat != null && lng != null ? sortByDistance(mobileDrives, lat, lng) : mobileDrives;

  const alerts =
    lat != null && lng != null ? sortByDistance(emergencies, lat, lng) : emergencies;

  return { centers, drives, emergencies: alerts, source: "mock" };
}

/**
 * Donor map payload — centers, drives, emergencies sorted by distance when lat/lng provided.
 */
export async function fetchDonorMapData(lat, lng) {
  try {
    const q = new URLSearchParams();
    if (lat != null) q.set("lat", String(lat));
    if (lng != null) q.set("lng", String(lng));
    const payload = await api.getDonorMap(q.toString() ? `?${q}` : "");
    const centers = (payload.centers ?? []).filter((c) => c.lat != null && c.lng != null);
    const drives = (payload.drives ?? []).filter((d) => d.lat != null && d.lng != null);
    const emergencies = (payload.emergencies ?? []).filter(
      (e) => e.lat != null && e.lng != null
    );

    if (centers.length > 0 || drives.length > 0 || emergencies.length > 0) {
      return { centers, drives, emergencies, source: "api" };
    }
  } catch {
    /* fall through to mock */
  }

  return mockPayload(lat, lng);
}

export function getQrHighlightDrive(drives, lat, lng) {
  const qrDrives = drives.filter((d) => d.qrCheckIn);
  if (!qrDrives.length || lat == null) return null;
  return qrDrives[0];
}
