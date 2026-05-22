import { useEffect, useState } from "react";
import { Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { HEAT_LEVELS } from "../utils/heatmap";

const LABEL_MIN_ZOOM = 5;
const LABEL_MAX_ZOOM = 8;

function wilayaLabelIcon(nameAr) {
  return L.divIcon({
    className: "wilaya-map-label",
    html: `<span dir="rtl">${nameAr}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

/**
 * Supply-risk zones by wilaya — click to filter hospitals in that wilaya.
 */
export default function WilayaHeatmapLayer({
  zones,
  bloodType,
  highlightedWilaya,
  onZoneClick,
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const showLabels = zoom >= LABEL_MIN_ZOOM && zoom <= LABEL_MAX_ZOOM;

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoomend", sync);
    sync();
    return () => {
      map.off("zoomend", sync);
    };
  }, [map]);

  return (
    <>
      {zones.map((zone) => {
        const isHighlight = highlightedWilaya === zone.wilaya;
        const dimmed = highlightedWilaya && !isHighlight;
        const levelLabel = HEAT_LEVELS[zone.level]?.label ?? zone.level;

        return (
          <Circle
            key={`heat-${zone.wilaya}-${bloodType}-${zone.level}-${zone.daysRemaining}`}
            center={zone.center}
            radius={zone.radiusM}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: dimmed ? 0.1 : isHighlight ? 0.45 : 0.38,
              weight: isHighlight ? 2.5 : 1,
            }}
            eventHandlers={{
              click: () => onZoneClick?.(zone),
            }}
          >
            <Popup className="ops-popup" autoPan={true}>
              <p className="m-0 font-bold text-sm" dir="rtl">
                {zone.nameAr ?? zone.wilaya}
              </p>
              <p className="m-0 mt-1 text-[11px] text-slate-400">
                {bloodType} · ~{zone.daysRemaining} days · {levelLabel}
              </p>
              <button
                type="button"
                className="ops-popup-btn mt-2 w-full"
                onClick={() => onZoneClick?.(zone)}
              >
                View hospitals in {zone.wilaya}
              </button>
            </Popup>
          </Circle>
        );
      })}

      {showLabels &&
        zones.map((zone) => (
          <Marker
            key={`label-${zone.wilaya}`}
            position={zone.center}
            icon={wilayaLabelIcon(zone.nameAr ?? zone.wilaya)}
            interactive={false}
            zIndexOffset={-200}
          />
        ))}
    </>
  );
}
