import L from "leaflet";

export function hospitalIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-hospital">🏥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function bankIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-bank">🩸</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function driveIcon(status) {
  const cls = status === "live" ? "live" : status === "planned" ? "planned" : "done";
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-drive ${cls}">🚐</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export function expiryIcon(count) {
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-expiry"><span>⚠</span><small>${count}</small></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function rareIcon(count) {
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-rare">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function performanceIcon(performance) {
  return L.divIcon({
    className: "",
    html: `<div class="ops-pin ops-pin-perf ${performance}">✓</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}
