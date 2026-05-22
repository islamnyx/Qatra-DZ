import { useEffect, useState } from "react";
import { Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wilayaLabelIcon(nameAr, nameEn, status, zoom, isNeighbor, countryAr) {
  const critical = status === "critical";
  const arSize = zoom <= 7 ? "12px" : "10px";
  const enSize = zoom <= 7 ? "9px" : "8px";
  const countryLine = isNeighbor
    ? `<span class="wilaya-country" dir="rtl">${escapeHtml(countryAr)}</span>`
    : "";
  const statusClass = isNeighbor ? "neighbor" : critical ? "critical" : "ok";
  return L.divIcon({
    className: "donor-wilaya-label",
    html: `<div class="wilaya-label-stack ${statusClass}">
      ${countryLine}
      <span class="wilaya-ar" dir="rtl" style="font-size:${arSize}">${escapeHtml(nameAr)}</span>
      <span class="wilaya-en" style="font-size:${enSize}">${escapeHtml(nameEn)}</span>
    </div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

/** Algeria (69) + optional neighbor regions — Arabic first, English second, one block per zone */
export default function WilayaMapLayer({ wilayas, neighbors = [], onSelectWilaya }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoomend", sync);
    sync();
    return () => map.off("zoomend", sync);
  }, [map]);

  const showWilayaLabels = zoom >= 5 && zoom <= 11;
  const showNeighborLabels = zoom >= 4 && zoom <= 8;
  const showNeighbors = zoom <= 8;

  return (
    <>
      {showNeighbors &&
        neighbors.map((w) => (
          <Circle
            key={`n-zone-${w.code}`}
            center={[w.lat, w.lng]}
            radius={w.radiusM ?? 20000}
            pathOptions={{
              color: "#64748b",
              fillColor: "#94a3b8",
              fillOpacity: 0.12,
              weight: 1,
              dashArray: "4 6",
            }}
          />
        ))}

      {wilayas.map((w) => {
        const critical = w.status === "critical";
        return (
          <Circle
            key={`w-zone-${w.code}`}
            center={[w.lat, w.lng]}
            radius={w.radiusM ?? 15000}
            pathOptions={{
              color: critical ? "#dc2626" : "#16a34a",
              fillColor: critical ? "#fecaca" : "#bbf7d0",
              fillOpacity: zoom <= 8 ? 0.22 : 0.1,
              weight: 1,
            }}
            eventHandlers={{
              click: () => onSelectWilaya?.(w),
            }}
          />
        );
      })}

      {showNeighborLabels &&
        neighbors.map((w) => (
          <Marker
            key={`n-label-${w.code}`}
            position={[w.lat, w.lng]}
            icon={wilayaLabelIcon(w.nameAr, w.name, w.status, zoom, true, w.countryAr)}
            interactive={false}
            zIndexOffset={-300}
          />
        ))}

      {showWilayaLabels &&
        wilayas.map((w) => (
          <Marker
            key={`w-label-${w.code}`}
            position={[w.lat, w.lng]}
            icon={wilayaLabelIcon(w.nameAr, w.name, w.status, zoom, false, "")}
            interactive={false}
            zIndexOffset={-100}
          />
        ))}
    </>
  );
}
