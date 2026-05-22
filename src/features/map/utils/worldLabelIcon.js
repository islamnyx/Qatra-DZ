import L from "leaflet";

export function worldLabelIcon(text, kind = "continent") {
  return L.divIcon({
    className: `map-world-label map-world-label--${kind}`,
    html: `<span>${text}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}
