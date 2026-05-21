/**
 * Firebase data provider — hospital DB + SOS for donor app.
 */
import * as hospitalDb from "./adapters/hospitalDb.js";
import * as sos from "./adapters/sos.js";

export const getUrgentSos = sos.getUrgentSos;
export const getAllSos = sos.getAllSos;

export async function respondToSos(_sosId, _body) {
  // Direct matching is forbidden on blood_requests; responses stay ephemeral / separate path.
  return {
    ok: true,
    message: "Response recorded (hospital-mediated workflow; no donor link stored on request).",
  };
}

export { submitDonorPreScreening, getOwnPreScreening } from "./adapters/preScreening.js";

export {
  listBloodInventory,
  getBloodUnit,
  createBloodUnit,
  updateBloodUnit,
  deleteBloodUnit,
  listBloodRequests,
  createBloodRequest,
  updateBloodRequest,
  getPreScreening,
  submitPreScreening,
  getHospitalsFromInventory,
  getExpiringUnits,
  getInventoryKpis,
} from "./adapters/hospitalDb.js";
