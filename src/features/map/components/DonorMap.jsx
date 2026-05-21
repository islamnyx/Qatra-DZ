import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from "react-leaflet";
import { centerIcon, driveIcon, emergencyIcon, userIcon } from "../utils/markers.js";
import { getDriveStatus } from "../utils/driveStatus.js";
import { ALGER_CENTER } from "../mock/mapData.js";
import { formatDistance } from "../utils/geo.js";

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function DonorMap({
  userPosition,
  centers,
  drives,
  emergencies,
  isEligible,
  selectedCenter,
  selectedDrive,
  selectedEmergency,
  routeTarget,
  qrHighlightDriveId,
  onSelectCenter,
  onSelectDrive,
  onSelectEmergency,
  className = "",
}) {
  const mapCenter = userPosition ?? ALGER_CENTER;
  const zoom = userPosition ? 13 : 11;

  const activeDrives = useMemo(
    () => drives.filter((d) => getDriveStatus(d) !== "past"),
    [drives]
  );

  const routeLine = useMemo(() => {
    if (!userPosition || !routeTarget) return null;
    return [
      [userPosition[0], userPosition[1]],
      [routeTarget.lat, routeTarget.lng],
    ];
  }, [userPosition, routeTarget]);

  return (
    <div className={`donor-map-root ${isEligible ? "eligible-map-glow" : ""} ${className}`}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && <MapRecenter center={userPosition} zoom={zoom} />}

        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon()} />
            <Circle
              center={userPosition}
              radius={2500}
              pathOptions={{
                color: "#22c55e",
                fillColor: "#22c55e",
                fillOpacity: 0.15,
                weight: 1,
                className: "impact-zone-pulse",
              }}
            />
            <Circle
              center={userPosition}
              radius={1200}
              pathOptions={{
                color: "#86efac",
                fillColor: "#bbf7d0",
                fillOpacity: 0.08,
                weight: 0,
              }}
            />
          </>
        )}

        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#dc2626",
              weight: 4,
              opacity: 0.85,
              className: "map-route-line",
            }}
          />
        )}

        {centers.map((c) => {
          const locked = !isEligible;
          const isSelected = selectedCenter?.id === c.id;
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={centerIcon(locked)}
              opacity={locked ? 0.55 : 1}
              eventHandlers={{ click: () => onSelectCenter(c) }}
              zIndexOffset={isSelected ? 500 : 0}
            />
          );
        })}

        {activeDrives.map((d) => {
          const status = getDriveStatus(d);
          const qrHighlight = d.id === qrHighlightDriveId;
          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={driveIcon(status, qrHighlight)}
              eventHandlers={{ click: () => onSelectDrive(d) }}
              zIndexOffset={selectedDrive?.id === d.id ? 600 : 100}
            />
          );
        })}

        {emergencies.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={emergencyIcon()}
            eventHandlers={{ click: () => onSelectEmergency(a) }}
            zIndexOffset={selectedEmergency?.id === a.id ? 700 : 200}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export function MapLegendChip({ label, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow border border-red-50">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function RouteSummary({ center, lang, t }) {
  if (!center?.distanceKm) return null;
  return (
    <p className="text-center text-xs font-semibold text-red-700 px-4 py-1 bg-white/90">
      {t("mapRouteTo")} {center.nameAr} — {formatDistance(center.distanceKm, lang)}
    </p>
  );
}
