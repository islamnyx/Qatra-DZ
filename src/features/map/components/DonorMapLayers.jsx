import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  loadWorldCountriesGeo,
  loadWorldBoundariesGeo,
  worldCountryFillStyle,
  worldBoundaryStyle,
} from "../utils/geoCache.js";
import { buildWilayaFeatureCollection } from "../utils/buildWilayaGeo.js";
import { wilayaLabelIcon, wilayaLabelsVisible } from "../utils/wilayaLabelIcon.js";
import { getDriveStatus } from "../utils/driveStatus.js";
import { centerIcon, driveIcon, emergencyIcon, userIcon } from "../utils/markers.js";
import {
  getImpactRadiusM,
  countLivesSaved,
  getImpactTier,
  clampGpsAccuracyM,
} from "../utils/impactZone.js";
import { ALGERIA_WILAYAS_69 } from "../data/algeriaWilayas69.js";

const canvas = () => L.canvas({ padding: 0.5 });

function wilayaRadius(zoom) {
  if (zoom <= 6) return 12;
  if (zoom <= 8) return 9;
  return 7;
}

function buildWilayaLabelLayer(wilayas, zoom) {
  const group = L.layerGroup();
  if (!wilayaLabelsVisible(zoom)) return group;

  const list = wilayas?.length ? wilayas : ALGERIA_WILAYAS_69;
  for (const w of list) {
    group.addLayer(
      L.marker([w.lat, w.lng], {
        icon: wilayaLabelIcon(w.nameAr, w.name, w.status, zoom),
        interactive: false,
        zIndexOffset: -100,
      })
    );
  }
  return group;
}

/**
 * Canvas zones + divIcon labels on the map (no white tooltip boxes).
 */
export default function DonorMapLayers({
  wilayas,
  centers,
  drives,
  emergencies,
  isEligible,
  qrHighlightDriveId,
  userPosition,
  positionAccuracyM,
  totalDonations = 0,
  onSelectWilaya,
  onSelectCenter,
  onSelectDrive,
  onSelectEmergency,
}) {
  const map = useMap();
  const cbRef = useRef({});
  const wilayaLayerRef = useRef(null);
  const wilayaLabelsRef = useRef(null);

  cbRef.current = {
    onSelectWilaya,
    onSelectCenter,
    onSelectDrive,
    onSelectEmergency,
  };

  const wilayasRef = useRef(wilayas);
  wilayasRef.current = wilayas;

  const syncWilayaLabels = (zoom) => {
    wilayaLabelsRef.current?.remove();
    wilayaLabelsRef.current = buildWilayaLabelLayer(wilayasRef.current, zoom).addTo(map);
  };

  useEffect(() => {
    const renderer = canvas();
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
          style: worldCountryFillStyle,
        }).addTo(map);

        boundariesLayer = L.geoJSON(boundariesGeo, {
          smoothFactor: 0.6,
          interactive: false,
          style: (feature) => worldBoundaryStyle(feature),
        }).addTo(map);
      }
    );

    return () => {
      mounted = false;
      countriesLayer?.remove();
      boundariesLayer?.remove();
    };
  }, [map]);

  useEffect(() => {
    const renderer = canvas();
    wilayaLayerRef.current?.remove();

    const onZoomEnd = () => {
      const z = map.getZoom();
      syncWilayaLabels(z);
      wilayaLayerRef.current?.eachLayer((l) => {
        if (l.setRadius) l.setRadius(wilayaRadius(z));
      });
    };

    const geo = buildWilayaFeatureCollection(wilayas);
    const z = map.getZoom();

    wilayaLayerRef.current = L.geoJSON(geo, {
      renderer,
      pointToLayer: (feature, latlng) => {
        const critical = feature.properties.status === "critical";
        return L.circleMarker(latlng, {
          renderer,
          radius: wilayaRadius(z),
          color: critical ? "#dc2626" : "#16a34a",
          fillColor: critical ? "#fca5a5" : "#86efac",
          fillOpacity: 0.45,
          weight: 1,
        });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const [lng, lat] = feature.geometry.coordinates;
        layer.on("click", () => {
          cbRef.current.onSelectWilaya?.({
            code: p.code,
            name: p.name,
            nameAr: p.nameAr,
            status: p.status,
            shortage: p.shortage,
            hospitals: p.hospitals,
            lat,
            lng,
          });
        });
      },
    }).addTo(map);

    syncWilayaLabels(z);
    map.on("zoomend", onZoomEnd);

    return () => {
      map.off("zoomend", onZoomEnd);
      wilayaLayerRef.current?.remove();
      wilayaLayerRef.current = null;
      wilayaLabelsRef.current?.remove();
      wilayaLabelsRef.current = null;
    };
  }, [map, wilayas]);

  useEffect(() => {
    const group = L.layerGroup();
    centers.forEach((c) => {
      const m = L.marker([c.lat, c.lng], {
        icon: centerIcon(!isEligible),
        opacity: isEligible ? 1 : 0.55,
      });
      m.on("click", () => cbRef.current.onSelectCenter?.(c));
      group.addLayer(m);
    });
    drives
      .filter((d) => getDriveStatus(d) !== "past")
      .forEach((d) => {
        const m = L.marker([d.lat, d.lng], {
          icon: driveIcon(getDriveStatus(d), d.id === qrHighlightDriveId),
        });
        m.on("click", () => cbRef.current.onSelectDrive?.(d));
        group.addLayer(m);
      });
    emergencies.forEach((a) => {
      const m = L.marker([a.lat, a.lng], { icon: emergencyIcon() });
      m.on("click", () => cbRef.current.onSelectEmergency?.(a));
      group.addLayer(m);
    });

    group.addTo(map);
    return () => {
      group.clearLayers();
      group.remove();
    };
  }, [map, centers, drives, emergencies, isEligible, qrHighlightDriveId]);

  useEffect(() => {
    const group = L.layerGroup();
    if (userPosition) {
      const impactM = getImpactRadiusM(totalDonations);
      const tier = getImpactTier(totalDonations);
      const lives = countLivesSaved(totalDonations);

      group.addLayer(
        L.marker(userPosition, { icon: userIcon(), zIndexOffset: 1000 })
      );

      const accuracyM = clampGpsAccuracyM(positionAccuracyM);
      if (accuracyM != null) {
        group.addLayer(
          L.circle(userPosition, {
            radius: accuracyM,
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.08,
            weight: 1,
            dashArray: "4 4",
            renderer: canvas(),
            className: "donor-gps-accuracy",
          })
        );
      }

      /* Inner warmth ring — feature 2.7 emotional depth */
      group.addLayer(
        L.circle(userPosition, {
          radius: impactM * 0.55,
          color: "#15803d",
          fillColor: "#4ade80",
          fillOpacity: 0.14,
          weight: 1,
          className: `impact-zone-inner impact-zone-tier-${tier}`,
        })
      );

      /* SVG path (no canvas) so CSS pulse animation works — grows per donation */
      group.addLayer(
        L.circle(userPosition, {
          radius: impactM,
          color: "#16a34a",
          fillColor: "#22c55e",
          fillOpacity: 0.12,
          weight: 1.5,
          className: `impact-zone-pulse impact-zone-tier-${tier}`,
        })
      );

      if (lives > 0) {
        const livesIcon = L.divIcon({
          className: "impact-lives-badge",
          html: `<span class="impact-lives-badge__inner" aria-hidden="true"><span class="impact-lives-badge__heart">♥</span><span class="impact-lives-badge__count">${lives}</span></span>`,
          iconSize: [44, 28],
          iconAnchor: [22, 36],
        });
        group.addLayer(
          L.marker(userPosition, {
            icon: livesIcon,
            interactive: false,
            zIndexOffset: 1100,
          })
        );
      }
    }
    group.addTo(map);
    return () => {
      group.clearLayers();
      group.remove();
    };
  }, [map, userPosition, positionAccuracyM, totalDonations]);

  return null;
}
