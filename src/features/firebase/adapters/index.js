/**
 * Firebase adapters — implement one file at a time.
 * Return `undefined` to let provider.js fall back to REST.
 */
import { isFirebaseConfigured } from "../init.js";

export function isConfigured() {
  return isFirebaseConfigured();
}

export { health } from "./health.js";
export { getDonor, getPassport, getFamily, setFamilyCircle, demoFamilyAlert } from "./donors.js";
export { getUrgentSos, respondToSos } from "./sos.js";
export { getWilayas } from "./wilayas.js";
export { getFeed, registerCampaign } from "./feed.js";
export { sendChat, getChatPrompts } from "./chat.js";
