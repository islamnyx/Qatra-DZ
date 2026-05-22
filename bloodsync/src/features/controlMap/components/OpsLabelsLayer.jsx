import { useEffect, useState } from "react";
import { LayerGroup, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  CONTINENT_LABELS,
  OCEAN_LABELS,
  REGION_COUNTRY_LABELS,
  MAGHREB_BOUNDS,
  pickLabelText,
} from "@qatra/map-data/worldLabels.js";

function opsLabelIcon(text, kind = "continent") {
  return L.divIcon({
    className: `ops-world-label ops-world-label--${kind}`,
    html: `<span>${text}</span>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function inZoom(label, zoom) {
  return zoom >= label.minZoom && zoom <= label.maxZoom;
}

export default function OpsLabelsLayer({ lang = "en" }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [citiesVisible, setCitiesVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      const currentZoom = map.getZoom();
      setZoom(currentZoom);

      const { lat, lng } = map.getCenter();
      const inMaghreb =
        lat >= MAGHREB_BOUNDS.south &&
        lat <= MAGHREB_BOUNDS.north &&
        lng >= MAGHREB_BOUNDS.west &&
        lng <= MAGHREB_BOUNDS.east;
      
      setCitiesVisible(currentZoom >= 7 && inMaghreb);
    };

    map.on("zoomend moveend", sync);
    sync();

    return () => {
      map.off("zoomend moveend", sync);
    };
  }, [map]);

  return (
    <>
      {/* 1. OSM/CARTO dark city & region labels — optimized for Maghreb to stay responsive */}
      {citiesVisible && (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          minZoom={7}
          pane="overlayPane"
          zIndex={455}
          updateWhenZooming={false}
          updateWhenIdle
          keepBuffer={2}
        />
      )}

      {/* 2. Custom dark-theme markers for Oceans, Continents, and neighboring Countries at low/mid zoom */}
      <LayerGroup pane="overlayPane" zIndex={460}>
        {OCEAN_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={opsLabelIcon(pickLabelText(l, lang), "ocean")}
            interactive={false}
            zIndexOffset={-300}
          />
        ))}

        {CONTINENT_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={opsLabelIcon(pickLabelText(l, lang), "continent")}
            interactive={false}
            zIndexOffset={-200}
          />
        ))}

        {REGION_COUNTRY_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
          <Marker
            key={l.en}
            position={[l.lat, l.lng]}
            icon={opsLabelIcon(pickLabelText(l, lang), "country")}
            interactive={false}
            zIndexOffset={-100}
          />
        ))}
      </LayerGroup>
    </>
  );
}
