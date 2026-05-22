import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Draws the driving path on the map (real roads via OSRM, or straight fallback).
 */
export default function RoutePathLayer({ path, source = "roads" }) {
  const map = useMap();

  useEffect(() => {
    if (!path?.length || path.length < 2) return;

    const isRoads = source === "roads" && path.length > 2;
    const line = L.polyline(path, {
      color: "#dc2626",
      weight: isRoads ? 5 : 4,
      opacity: 0.9,
      dashArray: isRoads ? undefined : "8 6",
      lineCap: "round",
      lineJoin: "round",
      className: isRoads ? "map-route-line map-route-line--roads" : "map-route-line",
    }).addTo(map);

    try {
      const bounds = line.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
      }
    } catch {
      /* ignore invalid bounds */
    }

    return () => {
      map.removeLayer(line);
    };
  }, [path, source, map]);

  return null;
}
