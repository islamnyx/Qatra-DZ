import { memo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ALGER_CENTER } from "../mock/mapData.js";
import { formatDistance } from "../utils/geo.js";
import DonorMapLayers from "./DonorMapLayers.jsx";
import MapRecenter from "./MapRecenter.jsx";
import MapFollowGuard from "./MapFollowGuard.jsx";
import MapLocateControl from "./MapLocateControl.jsx";
import WorldLabelsLayer from "./WorldLabelsLayer.jsx";
import MaghrebCityLabels from "./MaghrebCityLabels.jsx";
import RoutePathLayer from "./RoutePathLayer.jsx";

/** Fixed initial view — never bind to GPS or the map remounts / jumps on every fix. */
const MAP_INITIAL_CENTER = ALGER_CENTER;
const MAP_INITIAL_ZOOM = 6;

function DonorMapInner({
  userPosition,
  centers,
  drives,
  emergencies,
  isEligible,
  routePath,
  routeSource,
  qrHighlightDriveId,
  recenterTarget,
  positionAccuracyM,
  totalDonations = 0,
  wilayas,
  onSelectWilaya,
  onSelectCenter,
  onSelectDrive,
  onSelectEmergency,
  onUserMovedMap,
  onLocate,
  locateLoading,
  locateLabel,
  lang = "ar",
  className,
}) {
  return (
    <div className={`donor-map-root ${isEligible ? "eligible-map-glow" : ""} ${className ?? ""}`}>
      <MapContainer
        center={MAP_INITIAL_CENTER}
        zoom={MAP_INITIAL_ZOOM}
        minZoom={2}
        maxZoom={18}
        preferCanvas
        zoomAnimationThreshold={6}
        fadeAnimation={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* Base without labels — our GeoJSON draws correct Morocco / Western Sahara borders */}
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          minZoom={2}
          updateWhenZooming={false}
          updateWhenIdle
          keepBuffer={3}
        />

        <DonorMapLayers
          wilayas={wilayas}
          centers={centers}
          drives={drives}
          emergencies={emergencies}
          isEligible={isEligible}
          qrHighlightDriveId={qrHighlightDriveId}
          userPosition={userPosition}
          positionAccuracyM={positionAccuracyM}
          totalDonations={totalDonations}
          onSelectWilaya={onSelectWilaya}
          onSelectCenter={onSelectCenter}
          onSelectDrive={onSelectDrive}
          onSelectEmergency={onSelectEmergency}
        />

        {routePath?.length >= 2 && (
          <RoutePathLayer path={routePath} source={routeSource} />
        )}

        <MapRecenter recenterTarget={recenterTarget} />
        <MapFollowGuard onUserMovedMap={onUserMovedMap} />

        <WorldLabelsLayer lang={lang} />
        <MaghrebCityLabels />

        {onLocate && (
          <MapLocateControl
            onLocate={onLocate}
            loading={locateLoading}
            label={locateLabel}
          />
        )}
      </MapContainer>
    </div>
  );
}

const DonorMap = memo(DonorMapInner);
export default DonorMap;

export function MapLegendChip({ label, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow border border-red-50">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

export function RouteSummary({ center, routeInfo, routeLoading, lang, t }) {
  if (!center) return null;
  if (routeLoading) {
    return (
      <p className="text-center text-xs font-semibold text-red-600 px-4 py-1 bg-white/90 animate-pulse">
        {t("mapRouteLoading")} {center.nameAr}
      </p>
    );
  }
  const roadKm = routeInfo?.distanceKm;
  if (roadKm == null && center.distanceKm == null) return null;
  return (
    <p className="text-center text-xs font-semibold text-red-700 px-4 py-1 bg-white/90">
      {t("mapRouteTo")} {center.nameAr}
      {roadKm != null ? (
        <>
          {" — "}
          {formatDistance(roadKm, lang)}
          {routeInfo?.source === "roads" && (
            <span className="text-gray-500 font-normal"> · {t("mapRouteByRoad")}</span>
          )}
        </>
      ) : (
        center.distanceKm != null && <> — {formatDistance(center.distanceKm, lang)}</>
      )}
    </p>
  );
}
