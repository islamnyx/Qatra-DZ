import L from "leaflet";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Stacked Arabic + English text painted on the map (no tooltip box). */
export function wilayaLabelIcon(nameAr, nameEn, status, zoom) {
  const critical = status === "critical";
  const arSize = zoom <= 7 ? "12px" : "10px";
  const enSize = zoom <= 7 ? "9px" : "8px";
  const statusClass = critical ? "critical" : "ok";
  return L.divIcon({
    className: "donor-wilaya-label",
    html: `<div class="wilaya-label-stack ${statusClass}">
      <span class="wilaya-ar" dir="rtl" style="font-size:${arSize}">${escapeHtml(nameAr)}</span>
      <span class="wilaya-en" style="font-size:${enSize}">${escapeHtml(nameEn)}</span>
    </div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

export function wilayaLabelsVisible(zoom) {
  return zoom >= 5 && zoom <= 11;
}
