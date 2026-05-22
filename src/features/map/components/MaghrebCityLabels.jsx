import { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import { MAGHREB_BOUNDS } from "../data/worldLabels.js";

/** OSM/CARTO city names for Maghreb only — avoids Chinese labels when viewing Asia at low zoom. */
export default function MaghrebCityLabels() {
  const map = useMap();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const z = map.getZoom();
      const { lat, lng } = map.getCenter();
      const inMaghreb =
        lat >= MAGHREB_BOUNDS.south &&
        lat <= MAGHREB_BOUNDS.north &&
        lng >= MAGHREB_BOUNDS.west &&
        lng <= MAGHREB_BOUNDS.east;
      setVisible(z >= 7 && inMaghreb);
    };

    map.on("zoomend moveend", check);
    check();
    return () => {
      map.off("zoomend moveend", check);
    };
  }, [map]);

  if (!visible) return null;

  return (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
      maxZoom={19}
      minZoom={7}
      pane="overlayPane"
      zIndex={455}
      updateWhenZooming={false}
      updateWhenIdle
      keepBuffer={2}
    />
  );
}
