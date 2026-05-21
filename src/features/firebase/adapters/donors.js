/**
 * TODO (Firebase team): implement Firestore reads/writes for donors & family.
 *
 * Example getDonor:
 *   import { doc, getDoc } from "firebase/firestore";
 *   import { getFirestoreDb } from "../init.js";
 *   import { COLLECTIONS } from "../collections.js";
 *   const snap = await getDoc(doc(db, COLLECTIONS.donors, id));
 *   return mapDonorDoc(snap.data());
 */
import { COLLECTIONS } from "../collections.js";

export async function getDonor(_id) {
  void COLLECTIONS.donors;
  return undefined;
}

export async function getPassport(_id) {
  return undefined;
}

export async function getFamily(_id) {
  return undefined;
}

export async function setFamilyCircle(_active, _id) {
  return undefined;
}

export async function demoFamilyAlert(_id) {
  return undefined;
}
