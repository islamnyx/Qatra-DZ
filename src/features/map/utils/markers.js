import L from "leaflet";

export function centerIcon(locked) {
  return L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin-center${locked ? " locked" : ""}"><span class="map-pin-inner">🩸</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export function driveIcon(status, qrHighlight) {
  const emoji = status === "live" ? "🚐" : "⛺";
  return L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin-drive ${status}${qrHighlight ? " map-pin-qr-hint" : ""}"><span class="map-pin-inner">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function emergencyIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin-emergency"><span class="map-pin-inner">⚠</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="map-pin-user"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
