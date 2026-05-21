import { listActiveSosForDonors } from "./hospitalDb.js";

export async function getUrgentSos() {
  const all = await listActiveSosForDonors();
  const critical = all.filter((s) => s.urgency === "critical");
  const sorted = [...(critical.length ? critical : all)].sort(
    (a, b) => new Date(b.postedAt) - new Date(a.postedAt)
  );
  return sorted[0] || null;
}

export async function getAllSos() {
  return listActiveSosForDonors();
}
