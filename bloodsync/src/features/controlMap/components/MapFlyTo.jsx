import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Smooth pan/zoom when sidebar or heatmap selects a target. */
export default function MapFlyTo({ target, zoom = 11 }) {
  const map = useMap();

  useEffect(() => {
    if (!target?.length) return;
    map.flyTo(target, zoom, { duration: 0.8 });
  }, [map, target?.[0], target?.[1], zoom]);

  return null;
}
