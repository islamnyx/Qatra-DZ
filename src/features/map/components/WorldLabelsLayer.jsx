import { useEffect, useState } from "react";
import { LayerGroup, Marker, useMap } from "react-leaflet";
import {
  CONTINENT_LABELS,
  OCEAN_LABELS,
  REGION_COUNTRY_LABELS,
  pickLabelText,
} from "../data/worldLabels.js";
import { worldLabelIcon } from "../utils/worldLabelIcon.js";

function inZoom(label, zoom) {
  return zoom >= label.minZoom && zoom <= label.maxZoom;
}

export default function WorldLabelsLayer({ lang = "ar" }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoomend moveend", sync);
    sync();
    return () => {
      map.off("zoomend moveend", sync);
    };
  }, [map]);

  return (
    <LayerGroup pane="overlayPane" zIndex={460}>
      {OCEAN_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={worldLabelIcon(pickLabelText(l, lang), "ocean")}
          interactive={false}
          zIndexOffset={-300}
        />
      ))}

      {CONTINENT_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={worldLabelIcon(pickLabelText(l, "en"), "continent")}
          interactive={false}
          zIndexOffset={-200}
        />
      ))}

      {REGION_COUNTRY_LABELS.filter((l) => inZoom(l, zoom)).map((l) => (
        <Marker
          key={l.en}
          position={[l.lat, l.lng]}
          icon={worldLabelIcon(pickLabelText(l, lang), "country")}
          interactive={false}
          zIndexOffset={-100}
        />
      ))}
    </LayerGroup>
  );
}
