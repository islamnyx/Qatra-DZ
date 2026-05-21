import { useMapEvents } from "react-leaflet";

export default function MapClickHandler({ toolMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (toolMode === "none") return;
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}
