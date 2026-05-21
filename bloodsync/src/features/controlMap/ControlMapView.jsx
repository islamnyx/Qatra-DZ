import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Polygon, Polyline, Popup } from "react-leaflet";
import {
  loadControlMapData,
  broadcastRegionalAlert,
  deployDrive,
  sendTransferRequest,
} from "./api/controlMapApi";
import MapToolbar from "./components/MapToolbar";
import ControlHospitalSidebar from "./components/ControlHospitalSidebar";
import MapClickHandler from "./components/MapClickHandler";
import {
  ExpiryPanel,
  PlannerPanel,
  BroadcastPanel,
  RareClusterPanel,
  DriveAnalyticsPanel,
} from "./components/OpsFloatingPanels";
import { hospitalIcon, bankIcon, driveIcon, expiryIcon, rareIcon, performanceIcon } from "./utils/markers";
import { countDonorsInPolygon, donorsInRadius, haversineKm, estimateDriveMin } from "./utils/geo";
import { hospitals as allHospitals } from "../../mock/data";
import "./controlMap.css";

const DEFAULT_LAYERS = {
  heatmap: true,
  hospitals: true,
  expiry: true,
  drives: true,
  density: false,
  rare: false,
  performance: true,
  transfers: true,
};

const ALGERIA_CENTER = [28.5, 2.5];
const DEFAULT_ZOOM = 6;

function hospitalByName(name) {
  return allHospitals.find((h) => h.name === name);
}

export default function ControlMapView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloodType, setBloodType] = useState("O-");
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [search, setSearch] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [toolMode, setToolMode] = useState("none");

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedExpiry, setSelectedExpiry] = useState(null);
  const [selectedRare, setSelectedRare] = useState(null);
  const [selectedDriveAnalytics, setSelectedDriveAnalytics] = useState(null);
  const [transferStatuses, setTransferStatuses] = useState({});

  const [plannerPoints, setPlannerPoints] = useState([]);
  const [plannerAnalysis, setPlannerAnalysis] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [extraDrives, setExtraDrives] = useState([]);

  const [broadcastCenter, setBroadcastCenter] = useState(null);
  const [broadcastRadiusKm, setBroadcastRadiusKm] = useState(25);
  const [broadcastBloodType, setBroadcastBloodType] = useState("O-");
  const [broadcasting, setBroadcasting] = useState(false);
  const [toast, setToast] = useState("");

  const [transferPending, setTransferPending] = useState(false);
  const [rareAlerting, setRareAlerting] = useState(false);

  const reload = useCallback(async (bt) => {
    setLoading(true);
    try {
      const payload = await loadControlMapData(bt);
      setData(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload(bloodType);
  }, [bloodType, reload]);

  const wilayas = useMemo(
    () => [...new Set((data?.hospitals ?? []).map((h) => h.wilaya))],
    [data?.hospitals]
  );

  const filteredHospitals = useMemo(() => {
    if (!data?.hospitals) return [];
    return data.hospitals.filter((h) => {
      if (wilayaFilter && h.wilaya !== wilayaFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return h.name.toLowerCase().includes(q) || h.wilaya.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data?.hospitals, wilayaFilter, search]);

  const allDrives = useMemo(
    () => [...(data?.drives ?? []), ...extraDrives],
    [data?.drives, extraDrives]
  );

  const estimatedReach = useMemo(() => {
    if (!broadcastCenter || !data?.donorDensityZones) return 0;
    return donorsInRadius(data.donorDensityZones, broadcastCenter, broadcastRadiusKm);
  }, [broadcastCenter, broadcastRadiusKm, data?.donorDensityZones]);

  const toggleLayer = (key) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleMapClick = (latlng) => {
    if (toolMode === "planner") {
      setPlannerPoints((pts) => [...pts, latlng]);
      setPlannerAnalysis(null);
      return;
    }
    if (toolMode === "broadcast") {
      setBroadcastCenter(latlng);
    }
  };

  const analyzeZone = () => {
    if (!data?.donorDensityZones || plannerPoints.length < 3) return;
    const count = countDonorsInPolygon(data.donorDensityZones, plannerPoints);
    const cx = plannerPoints.reduce((s, p) => s + p[0], 0) / plannerPoints.length;
    const cy = plannerPoints.reduce((s, p) => s + p[1], 0) / plannerPoints.length;
    let best = data.donorDensityZones[0];
    let bestD = Infinity;
    for (const z of data.donorDensityZones) {
      const d = haversineKm(cx, cy, z.center[0], z.center[1]);
      if (d < bestD) {
        bestD = d;
        best = z;
      }
    }
    setPlannerAnalysis({
      donorCount: count + Math.round(count * 0.15),
      optimalLabel: best.label,
      optimalCenter: best.center,
    });
  };

  const handleDeployDrive = async () => {
    if (!plannerAnalysis) return;
    setDeploying(true);
    try {
      const res = await deployDrive({
        name: `CRA — Zone ${plannerAnalysis.optimalLabel}`,
        wilaya: "Alger",
        coordinates: plannerAnalysis.optimalCenter,
        status: "planned",
        plannedDonors: plannerAnalysis.donorCount,
      });
      if (res.drive) {
        setExtraDrives((d) => [...d, res.drive]);
        showToast("Drive deployed — visible on donor map (simulated)");
        setPlannerPoints([]);
        setPlannerAnalysis(null);
        setToolMode("none");
      }
    } finally {
      setDeploying(false);
    }
  };

  const handleBroadcast = async () => {
    setBroadcasting(true);
    try {
      const res = await broadcastRegionalAlert({
        bloodType: broadcastBloodType,
        radiusKm: broadcastRadiusKm,
        center: broadcastCenter,
        estimatedReach,
      });
      showToast(res.message + ` (~${estimatedReach} donors)`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleTransferRequest = async (hospital) => {
    const rec = data?.recommendations?.find((r) => r.toHospital === hospital.name);
    const to = rec ? hospitalByName(rec.fromHospital) : data?.hospitals?.find((x) => x.id !== hospital.id);
    if (!to) {
      showToast("No transfer partner found");
      return;
    }
    setTransferPending(true);
    try {
      await sendTransferRequest({
        fromHospitalId: hospital.id,
        toHospitalId: to.id,
        bloodType: rec?.bloodType ?? "O-",
        units: rec?.units ?? 5,
      });
      showToast(`Transfer request sent → ${to.name}`);
    } finally {
      setTransferPending(false);
    }
  };

  const handleExpiryTransfer = (expiry, item) => {
    if (!item?.suggestedTo) return;
    const km = item.distanceKm ? parseFloat(item.distanceKm) : 0;
    showToast(
      `نقل إلى ${item.suggestedTo} — ${item.distanceKm ?? km} km (~${estimateDriveMin(km || 5)} min)`
    );
  };

  const patchTransfer = (id, status) => {
    setTransferStatuses((s) => ({ ...s, [id]: status }));
    showToast(`Transfer ${id}: ${status}`);
  };

  if (loading && !data) {
    return (
      <div className="ops-map-wrap -m-6 flex h-[calc(100vh-4rem)] items-center justify-center text-slate-400">
        Loading operations map…
      </div>
    );
  }

  return (
    <div className="ops-map-wrap relative -m-6 h-[calc(100vh-4rem)]">
      <MapToolbar
        bloodType={bloodType}
        onBloodType={setBloodType}
        layers={layers}
        onToggleLayer={toggleLayer}
        search={search}
        onSearch={setSearch}
        wilayaFilter={wilayaFilter}
        onWilayaFilter={setWilayaFilter}
        wilayas={wilayas}
        toolMode={toolMode}
        onToolMode={setToolMode}
      />

      {toast && (
        <div className="absolute top-3 right-3 z-[600] rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <MapContainer center={ALGERIA_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler toolMode={toolMode} onMapClick={handleMapClick} />

        {layers.heatmap &&
          data?.heatmap?.map((zone) => (
            <Circle
              key={zone.wilaya}
              center={zone.center}
              radius={zone.radiusM}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.35,
                weight: 1,
              }}
            >
              <Popup className="ops-popup">
                <strong>{zone.wilaya}</strong>
                <br />
                {bloodType}: ~{zone.daysRemaining} days supply
                <br />
                <span style={{ color: zone.color }}>{zone.level}</span>
              </Popup>
            </Circle>
          ))}

        {layers.density &&
          data?.donorDensityZones?.map((z) => {
            const intensity = Math.min(0.55, z.eligibleCount / 1500);
            return (
              <Circle
                key={z.id}
                center={z.center}
                radius={z.radiusM}
                pathOptions={{
                  color: "#f97316",
                  fillColor: "#fb923c",
                  fillOpacity: intensity,
                  weight: 0,
                }}
              >
                <Popup>
                  {z.label}: <strong>{z.eligibleCount.toLocaleString()}</strong> eligible donors (aggregate)
                </Popup>
              </Circle>
            );
          })}

        {toolMode === "broadcast" && broadcastCenter && (
          <Circle
            center={broadcastCenter}
            radius={broadcastRadiusKm * 1000}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#dc2626",
              fillOpacity: 0.12,
              weight: 2,
              dashArray: "6 4",
            }}
          />
        )}

        {plannerPoints.length >= 2 && (
          <Polygon
            positions={plannerPoints}
            pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.15, weight: 2 }}
          />
        )}

        {layers.hospitals &&
          filteredHospitals.map((h) => (
            <Marker
              key={h.id}
              position={h.coordinates}
              icon={h.isBloodBank ? bankIcon() : hospitalIcon()}
              eventHandlers={{
                click: () => {
                  setSelectedHospital(h);
                  setSelectedExpiry(null);
                  setSelectedRare(null);
                  setSelectedDriveAnalytics(null);
                },
              }}
            />
          ))}

        {layers.expiry &&
          data?.expiryMarkers?.map((em) => (
            <Marker
              key={`exp-${em.hospital.id}`}
              position={[
                em.hospital.coordinates[0] + 0.008,
                em.hospital.coordinates[1] + 0.008,
              ]}
              icon={expiryIcon(em.units)}
              eventHandlers={{
                click: () => {
                  setSelectedExpiry(em);
                  setSelectedHospital(null);
                },
              }}
            />
          ))}

        {layers.drives &&
          allDrives.map((d) => (
            <Marker
              key={d.id}
              position={d.coordinates}
              icon={driveIcon(d.status)}
              eventHandlers={{
                click: () => setSelectedHospital(null),
              }}
            >
              <Popup>
                <strong>{d.name}</strong>
                <br />
                Status: {d.status}
              </Popup>
            </Marker>
          ))}

        {layers.rare &&
          data?.rareBloodClusters?.map((c) => (
            <Marker
              key={c.id}
              position={c.center}
              icon={rareIcon(c.count)}
              eventHandlers={{ click: () => setSelectedRare(c) }}
            />
          ))}

        {layers.performance &&
          data?.completedDrives?.map((d) => (
            <Marker
              key={d.id}
              position={d.coordinates}
              icon={performanceIcon(d.performance)}
              eventHandlers={{ click: () => setSelectedDriveAnalytics(d) }}
            />
          ))}

        {layers.transfers &&
          data?.transferRoutes?.map((t) => {
            const status = transferStatuses[t.id] ?? t.status;
            const color =
              status === "Approved" || status === "In Transit"
                ? "#22c55e"
                : status === "Pending"
                  ? "#eab308"
                  : "#64748b";
            return (
              <Polyline
                key={t.id}
                positions={[t.fromCoords, t.toCoords]}
                pathOptions={{ color, weight: 3, opacity: 0.85, dashArray: status === "Pending" ? "8 6" : undefined }}
              >
                <Popup>
                  <strong>{t.id}</strong>: {t.from} → {t.to}
                  <br />
                  {t.type} · {t.units} units · {status}
                  <br />
                  ~{haversineKm(t.fromCoords[0], t.fromCoords[1], t.toCoords[0], t.toCoords[1]).toFixed(0)} km
                  {status === "Pending" && (
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => patchTransfer(t.id, "Approved")}>
                        Approve
                      </button>
                      <button type="button" onClick={() => patchTransfer(t.id, "Rejected")}>
                        Reject
                      </button>
                    </div>
                  )}
                </Popup>
              </Polyline>
            );
          })}
      </MapContainer>

      <ControlHospitalSidebar
        hospital={selectedHospital}
        recommendations={data?.recommendations}
        onClose={() => setSelectedHospital(null)}
        onTransferRequest={handleTransferRequest}
        transferPending={transferPending}
      />

      <ExpiryPanel
        expiry={selectedExpiry}
        onClose={() => setSelectedExpiry(null)}
        onSuggestTransfer={handleExpiryTransfer}
      />

      <PlannerPanel
        polygon={plannerPoints}
        analysis={plannerAnalysis}
        onClear={() => {
          setPlannerPoints([]);
          setPlannerAnalysis(null);
        }}
        onAnalyze={analyzeZone}
        onDeploy={handleDeployDrive}
        deploying={deploying}
      />

      <BroadcastPanel
        center={broadcastCenter}
        radiusKm={broadcastRadiusKm}
        onRadius={setBroadcastRadiusKm}
        bloodType={broadcastBloodType}
        onBloodType={setBroadcastBloodType}
        estimatedReach={estimatedReach}
        onBroadcast={handleBroadcast}
        broadcasting={broadcasting}
        onClose={() => {
          setBroadcastCenter(null);
          setToolMode("none");
        }}
      />

      <RareClusterPanel
        cluster={selectedRare}
        onClose={() => setSelectedRare(null)}
        alerting={rareAlerting}
        onAlert={async () => {
          setRareAlerting(true);
          try {
            const res = await broadcastRegionalAlert({
              bloodType: selectedRare.phenotype,
              estimatedReach: selectedRare.count,
            });
            showToast(res.message);
          } finally {
            setRareAlerting(false);
          }
        }}
      />

      <DriveAnalyticsPanel drive={selectedDriveAnalytics} onClose={() => setSelectedDriveAnalytics(null)} />
    </div>
  );
}
