import { getFirebaseAuth } from "../init.js";
import { getPrescreeningKey } from "../config.js";
import { encryptMedicalAnswers } from "@shared/hospital-db/encryption.js";
import { submitPreScreening, getPreScreening } from "./hospitalDb.js";

/** Donor submits encrypted pre-screening (doc id = Auth UID). */
export async function submitDonorPreScreening(answers) {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in as donor");
  const secret = getPrescreeningKey();
  const payload = await encryptMedicalAnswers(answers, secret);
  return submitPreScreening(uid, payload);
}

export async function getOwnPreScreening() {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) return null;
  return getPreScreening(uid);
}
