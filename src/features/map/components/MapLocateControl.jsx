import { Locate } from "lucide-react";

/** Floating locate control on the map (same action as header GPS button). */
export default function MapLocateControl({ onLocate, loading, label }) {
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onLocate?.();
  };

  return (
    <div
      className="leaflet-top leaflet-right map-locate-control pointer-events-auto"
      style={{ marginTop: 8, marginRight: 8, zIndex: 1000 }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 shadow-md hover:bg-red-50 disabled:opacity-60"
        aria-label={label}
        title={label}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Locate className={`h-5 w-5 ${loading ? "animate-pulse" : ""}`} />
      </button>
    </div>
  );
}
