import { Search, Layers } from "lucide-react";
import { BLOOD_TYPES_FILTER } from "../api/controlMapApi";
import { HEAT_LEVELS } from "../utils/heatmap";

const LAYER_OPTS = [
  { key: "countries", label: "Country borders" },
  { key: "mapLabels", label: "Map labels" },
  { key: "heatmap", label: "Supply risk (wilaya)" },
  { key: "hospitals", label: "Hospital network" },
  { key: "expiry", label: "Expiry alerts" },
  { key: "drives", label: "Mobile drives" },
  { key: "density", label: "Donor density" },
  { key: "rare", label: "Rare blood" },
  { key: "performance", label: "Drive analytics" },
  { key: "transfers", label: "Transfer routes" },
];

export default function MapToolbar({
  bloodType,
  onBloodType,
  heatmapSummary,
  layers,
  onToggleLayer,
  search,
  onSearch,
  wilayaFilter,
  onWilayaFilter,
  wilayas,
  toolMode,
  onToolMode,
}) {
  return (
    <div className="ops-map-toolbar absolute left-3 top-3 z-[500] max-w-[calc(100%-1.5rem)] rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2 text-slate-300">
        <Layers className="h-4 w-4 text-red-500" />
        <span className="text-xs font-semibold uppercase tracking-wide">Operations map</span>
        <span className="text-[10px] text-slate-500 ml-1">— national blood network</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-slate-500" htmlFor="ops-blood-type">
            Supply risk for blood type
          </label>
          <select
            id="ops-blood-type"
            value={bloodType}
            onChange={(e) => onBloodType(e.target.value)}
            aria-label="Blood type for supply risk layer"
          >
            {BLOOD_TYPES_FILTER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <select value={wilayaFilter} onChange={(e) => onWilayaFilter(e.target.value)}>
          <option value="">All wilayas</option>
          {wilayas.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border border-[#334155] px-2 py-1">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            className="border-0! bg-transparent! w-28 outline-none"
            placeholder="Search facility"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <select value={toolMode} onChange={(e) => onToolMode(e.target.value)} className="border-amber-700/50">
          <option value="none">Tools: off</option>
          <option value="planner">Drive planner (draw zone)</option>
          <option value="broadcast">Alert broadcast</option>
        </select>
      </div>
      {layers.heatmap && heatmapSummary && (
        <p className="mt-1.5 text-[10px] text-slate-400">
          <span className="text-slate-300 font-semibold">{bloodType}</span> — days of supply per wilaya:{" "}
          {heatmapSummary.critical > 0 && (
            <span style={{ color: HEAT_LEVELS.critical.color }}>{heatmapSummary.critical} critical</span>
          )}
          {heatmapSummary.low > 0 && (
            <span style={{ color: HEAT_LEVELS.low.color }}>
              {heatmapSummary.critical > 0 ? ", " : ""}
              {heatmapSummary.low} low
            </span>
          )}
          {heatmapSummary.moderate > 0 && (
            <span style={{ color: HEAT_LEVELS.moderate.color }}>
              {heatmapSummary.critical + heatmapSummary.low > 0 ? ", " : ""}
              {heatmapSummary.moderate} moderate
            </span>
          )}
          {heatmapSummary.adequate > 0 && (
            <span style={{ color: HEAT_LEVELS.adequate.color }}>
              {heatmapSummary.critical + heatmapSummary.low + heatmapSummary.moderate > 0 ? ", " : ""}
              {heatmapSummary.adequate} adequate
            </span>
          )}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {LAYER_OPTS.map(({ key, label }) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={layers[key] ?? false}
              onChange={() => onToggleLayer(key)}
            />
            {label}
          </label>
        ))}
      </div>
      {layers.heatmap && (
        <div className="mt-2 flex flex-wrap gap-2 ops-legend rounded-lg px-2 py-1.5">
          {Object.entries(HEAT_LEVELS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
