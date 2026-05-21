import { mockApi } from "../../../api/mockApi.js";
import {
  WILAYA_REGIONS,
  mobileDrives,
  completedDrives,
  donorDensityZones,
  rareBloodClusters,
  BLOOD_TYPES_FILTER,
} from "../../../mock/mapOpsData.js";
import { hospitals, transfers, expiringUnits } from "../../../mock/data.js";
import { buildWilayaHeatmap } from "../utils/heatmap.js";
import { haversineKm } from "../utils/geo.js";

export { BLOOD_TYPES_FILTER };

export async function loadControlMapData(bloodType = "O-") {
  const [hospitalList, recommendations, expiring] = await Promise.all([
    mockApi.getHospitals(),
    mockApi.getRecommendations(),
    mockApi.getExpiring(120),
  ]);

  const heatmap = buildWilayaHeatmap(hospitalList, WILAYA_REGIONS, bloodType);

  const hospitalByName = Object.fromEntries(hospitalList.map((h) => [h.name, h]));

  const transferRoutes = transfers
    .filter((t) => t.status !== "Rejected")
    .map((t) => {
      const from = hospitalByName[t.from];
      const to = hospitalByName[t.to];
      if (!from || !to) return null;
      return { ...t, fromCoords: from.coordinates, toCoords: to.coordinates };
    })
    .filter(Boolean);

  const expiryByHospital = {};
  for (const e of expiring) {
    if (!expiryByHospital[e.hospital]) {
      expiryByHospital[e.hospital] = { units: 0, items: [], minHours: 999 };
    }
    expiryByHospital[e.hospital].units += e.units;
    expiryByHospital[e.hospital].items.push(e);
    expiryByHospital[e.hospital].minHours = Math.min(
      expiryByHospital[e.hospital].minHours,
      e.hoursRemaining
    );
  }

  const expiryMarkers = hospitalList
    .filter((h) => expiryByHospital[h.name])
    .map((h) => {
      const bucket = expiryByHospital[h.name];
      const items = bucket.items.map((item) => {
        const target = hospitalByName[item.suggestedTo];
        const distanceKm =
          target != null
            ? haversineKm(
                h.coordinates[0],
                h.coordinates[1],
                target.coordinates[0],
                target.coordinates[1]
              )
            : null;
        return { ...item, distanceKm: distanceKm != null ? distanceKm.toFixed(1) : null };
      });
      return {
        hospital: h,
        ...bucket,
        items,
        daysUntilExpiry: Math.ceil(bucket.minHours / 24),
      };
    });

  return {
    hospitals: hospitalList,
    heatmap,
    drives: [...mobileDrives],
    completedDrives,
    donorDensityZones,
    rareBloodClusters,
    transferRoutes,
    recommendations,
    expiring,
    expiryMarkers,
  };
}

export async function broadcastRegionalAlert(payload) {
  return mockApi.broadcastAlert(payload);
}

export async function deployDrive(drive) {
  return mockApi.createDrive(drive);
}

export async function sendTransferRequest(payload) {
  return mockApi.requestTransfer(payload);
}
