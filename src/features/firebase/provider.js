/**
 * Firebase data provider — same function names as restProvider.js
 *
 * Firebase teammate: implement adapters in ./adapters/ then wire them here.
 * Until implemented, calls fall back to REST so the app never breaks.
 */
import * as rest from "../../services/data/restProvider.js";
import * as adapters from "./adapters/index.js";

async function withFirebase(name, firebaseFn, restFn) {
  if (!adapters.isConfigured()) {
    return restFn();
  }
  try {
    const result = await firebaseFn();
    if (result !== undefined && result !== null) return result;
  } catch (err) {
    console.warn(`[Firebase] ${name} failed, using REST:`, err.message);
  }
  return restFn();
}

export async function health() {
  return withFirebase("health", () => adapters.health(), () => rest.health());
}

export async function getDonor(id) {
  return withFirebase("getDonor", () => adapters.getDonor(id), () => rest.getDonor(id));
}

export async function getPassport(id) {
  return withFirebase("getPassport", () => adapters.getPassport(id), () => rest.getPassport(id));
}

export async function getFamily(id) {
  return withFirebase("getFamily", () => adapters.getFamily(id), () => rest.getFamily(id));
}

export async function setFamilyCircle(active, id) {
  return withFirebase(
    "setFamilyCircle",
    () => adapters.setFamilyCircle(active, id),
    () => rest.setFamilyCircle(active, id)
  );
}

export async function demoFamilyAlert(id) {
  return withFirebase(
    "demoFamilyAlert",
    () => adapters.demoFamilyAlert(id),
    () => rest.demoFamilyAlert(id)
  );
}

export async function getUrgentSos(donorId) {
  return withFirebase(
    "getUrgentSos",
    () => adapters.getUrgentSos(donorId),
    () => rest.getUrgentSos(donorId)
  );
}

export async function respondToSos(sosId, payload) {
  return withFirebase(
    "respondToSos",
    () => adapters.respondToSos(sosId, payload),
    () => rest.respondToSos(sosId, payload)
  );
}

export async function getWilayas() {
  return withFirebase("getWilayas", () => adapters.getWilayas(), () => rest.getWilayas());
}

export async function getFeed(donorId) {
  return withFirebase("getFeed", () => adapters.getFeed(donorId), () => rest.getFeed(donorId));
}

export async function registerCampaign(feedId, donorId) {
  return withFirebase(
    "registerCampaign",
    () => adapters.registerCampaign(feedId, donorId),
    () => rest.registerCampaign(feedId, donorId)
  );
}

export async function sendChat(message, lang, donorId) {
  return withFirebase(
    "sendChat",
    () => adapters.sendChat(message, lang, donorId),
    () => rest.sendChat(message, lang, donorId)
  );
}

export async function getChatPrompts(lang) {
  return withFirebase(
    "getChatPrompts",
    () => adapters.getChatPrompts(lang),
    () => rest.getChatPrompts(lang)
  );
}
