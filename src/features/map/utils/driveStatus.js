export function getDriveStatus(drive, now = new Date()) {
  const start = new Date(drive.start);
  const end = new Date(drive.end);
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "past";
}

export function formatDriveWindow(drive, lang = "ar") {
  const start = new Date(drive.start);
  const end = new Date(drive.end);
  const locale = lang === "fr" ? "fr-DZ" : "ar-DZ";
  const date = start.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  const t1 = start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const t2 = end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${t1} – ${t2}`;
}
