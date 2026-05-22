import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const MAP_PROGRAMMATIC_MOVE = "_qatraProgrammaticMove";

/**
 * Moves the map viewport only when `recenterTarget.key` changes (locate / first GPS fix).
 */
export default function MapRecenter({ recenterTarget }) {
  const map = useMap();

  useEffect(() => {
    const target = recenterTarget;
    if (!target?.coords || target.key == null) return;

    const mapInstance = map;
    mapInstance[MAP_PROGRAMMATIC_MOVE] = true;

    mapInstance.setView(target.coords, target.zoom ?? mapInstance.getZoom(), {
      animate: true,
    });

    const clearFlag = () => {
      mapInstance[MAP_PROGRAMMATIC_MOVE] = false;
    };
    mapInstance.once("moveend", clearFlag);

    return () => {
      mapInstance.off("moveend", clearFlag);
      mapInstance[MAP_PROGRAMMATIC_MOVE] = false;
    };
  }, [recenterTarget?.key, map]);

  return null;
}
