import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { MAP_PROGRAMMATIC_MOVE } from "./MapRecenter.jsx";

/** Stops auto-follow when the donor pans the map manually (not programmatic recenter). */
export default function MapFollowGuard({ onUserMovedMap }) {
  const map = useMap();

  useEffect(() => {
    const stopFollow = () => {
      if (map[MAP_PROGRAMMATIC_MOVE]) return;
      onUserMovedMap?.();
    };

    map.on("dragstart", stopFollow);

    return () => {
      map.off("dragstart", stopFollow);
    };
  }, [map, onUserMovedMap]);

  return null;
}
