/**
 * Default data provider — talks to server/ (Node + SQLite).
 * Do not edit for map/chat features; use feature services instead.
 */
import { api } from "../../api/client.js";

export async function health() {
  return api.health();
}

export async function getDonor(id) {
  return api.getDonor(id);
}

export async function getPassport(id) {
  return api.getPassport(id);
}

export async function getFamily(id) {
  return api.getFamily(id);
}

export async function setFamilyCircle(active, id) {
  return api.setFamilyCircle(active, id);
}

export async function demoFamilyAlert(id) {
  return api.demoFamilyAlert(id);
}

export async function getUrgentSos(donorId) {
  return api.getUrgentSos(donorId);
}

export async function respondToSos(sosId, payload) {
  return api.respondToSos(sosId, payload);
}

export async function getWilayas() {
  return api.getWilayas();
}

export async function getFeed(donorId) {
  return api.getFeed(donorId);
}

export async function registerCampaign(feedId, donorId) {
  return api.registerCampaign(feedId, donorId);
}

export async function sendChat(message, lang, donorId, history = []) {
  return api.sendChat(message, lang, donorId, history);
}

export async function getChatPrompts(lang) {
  return api.getChatPrompts(lang);
}
