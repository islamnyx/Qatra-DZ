import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  loadWorldCountriesGeo,
  loadWorldBoundariesGeo,
  worldBoundaryStyle,
} from "@qatra/map-utils/geoCache.js";
import { resolveIso2 } from "@qatra/map-utils/countryLabels.js";

/** Dark-theme fills — strokes from boundary layer (Morocco ≠ Western Sahara). */
function opsCountryFillStyle(feature) {
  const iso2 = resolveIso2(feature);
  const base = { stroke: false, weight: 0 };

  if (iso2 === "DZ") {
    return { ...base, fillColor: "#991b1b", fillOpacity: 0.28 };
  }
  if (iso2 === "EH") {
    return { ...base, fillColor: "#334155", fillOpacity: 0.55 };
  }
  if (iso2 === "MA") {
    return { ...base, fillColor: "#475569", fillOpacity: 0.5 };
  }
  return { ...base, fillColor: "#0f172a", fillOpacity: 0.65 };
}

/**
 * ISO country fills + single international boundary layer (same logic as Qatra donor map).
 */
export default function OpsWorldBordersLayer() {
  const map = useMap();

  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 });
    let countriesLayer = null;
    let boundariesLayer = null;
    let mounted = true;

    Promise.all([loadWorldCountriesGeo(), loadWorldBoundariesGeo()]).then(
      ([countriesGeo, boundariesGeo]) => {
        if (!mounted) return;

        countriesLayer = L.geoJSON(countriesGeo, {
          renderer,
          smoothFactor: 1.2,
          interactive: false,
          style: opsCountryFillStyle,
        }).addTo(map);

        boundariesLayer = L.geoJSON(boundariesGeo, {
          renderer,
          smoothFactor: 1,
          interactive: false,
          style: worldBoundaryStyle,
        }).addTo(map);

        boundariesLayer.bringToFront();
      }
    );

    return () => {
      mounted = false;
      if (countriesLayer) map.removeLayer(countriesLayer);
      if (boundariesLayer) map.removeLayer(boundariesLayer);
    };
  }, [map]);

  return null;
}
