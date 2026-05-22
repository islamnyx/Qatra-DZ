import { useCallback, useEffect, useRef, useState } from "react";
import { ALGER_CENTER } from "../mock/mapData";
import { haversineKm } from "../utils/geo";
import {
  GEO_LOW_ACCURACY_M,
  isSuspiciousGeoJump,
} from "../utils/geoJump";

const STALE_MS = 2 * 60 * 1000;
const LOW_ACCURACY_M = GEO_LOW_ACCURACY_M;
const RELOAD_DISTANCE_KM = 0.15;
const MAP_RECENTER_ZOOM = 14;

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 20000,
};

const WATCH_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 8000,
  timeout: 25000,
};

function toPosition(coords, timestamp) {
  return {
    coords: [coords.latitude, coords.longitude],
    accuracy: coords.accuracy ?? null,
    timestamp: timestamp ?? Date.now(),
  };
}

/**
 * Donor map geolocation.
 * - Map view recenters only via `recenterTarget` (locate / first fix), never on every watch tick.
 * - Manual refresh always accepts the fix (`trustFix`) so the locate button cannot silently fail.
 */
export function useDonorGeolocation(onCoords) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState("idle");
  const [meta, setMeta] = useState({
    accuracy: null,
    timestamp: null,
    stale: false,
    lowAccuracy: false,
  });
  const [recenterTarget, setRecenterTarget] = useState(null);
  const watchIdRef = useRef(null);
  const hasFixRef = useRef(false);
  const followMapRef = useRef(true);
  const lastReportedRef = useRef(null);
  const lastGoodCoordsRef = useRef(null);
  const onCoordsRef = useRef(onCoords);
  onCoordsRef.current = onCoords;

  const requestMapRecenter = useCallback((coords, zoom = MAP_RECENTER_ZOOM) => {
    if (!coords || !followMapRef.current) return;
    setRecenterTarget({
      coords: [...coords],
      zoom,
      key: Date.now(),
    });
  }, []);

  const reportCoords = useCallback((coords, force = false) => {
    const prev = lastReportedRef.current;
    if (
      !force &&
      prev &&
      haversineKm(prev[0], prev[1], coords[0], coords[1]) < RELOAD_DISTANCE_KM
    ) {
      return;
    }
    lastReportedRef.current = coords;
    onCoordsRef.current?.(coords[0], coords[1]);
  }, []);

  const applyFix = useCallback(
    (pos, { recenter = false, forceReport = false, trustFix = false } = {}) => {
      const next = toPosition(pos.coords, pos.timestamp);

      if (
        !trustFix &&
        hasFixRef.current &&
        isSuspiciousGeoJump(lastGoodCoordsRef.current, next.coords, next.accuracy)
      ) {
        return false;
      }

      setPosition(next.coords);
      const age = Date.now() - next.timestamp;
      setMeta({
        accuracy: next.accuracy,
        timestamp: next.timestamp,
        stale: age > STALE_MS,
        lowAccuracy: next.accuracy != null && next.accuracy > LOW_ACCURACY_M,
      });
      setStatus("ok");
      hasFixRef.current = true;
      lastGoodCoordsRef.current = next.coords;
      reportCoords(next.coords, forceReport);

      if (recenter) {
        requestMapRecenter(next.coords);
      }
      return true;
    },
    [reportCoords, requestMapRecenter]
  );

  const pauseMapFollow = useCallback(() => {
    followMapRef.current = false;
  }, []);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setPosition(ALGER_CENTER);
      onCoordsRef.current?.(ALGER_CENTER[0], ALGER_CENTER[1]);
      return;
    }

    followMapRef.current = true;
    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const applied = applyFix(pos, {
          recenter: true,
          forceReport: true,
          trustFix: true,
        });
        if (!applied && lastGoodCoordsRef.current) {
          requestMapRecenter(lastGoodCoordsRef.current);
        }
        setStatus(hasFixRef.current ? "ok" : "unavailable");
      },
      (err) => {
        if (err.code === 1) {
          setStatus("denied");
          if (!hasFixRef.current) {
            setPosition(ALGER_CENTER);
            onCoordsRef.current?.(ALGER_CENTER[0], ALGER_CENTER[1]);
          }
        } else {
          setStatus(hasFixRef.current ? "ok" : "unavailable");
          if (hasFixRef.current && lastGoodCoordsRef.current) {
            requestMapRecenter(lastGoodCoordsRef.current);
          }
        }
      },
      GPS_OPTIONS
    );
  }, [applyFix, requestMapRecenter]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setPosition(ALGER_CENTER);
      onCoordsRef.current?.(ALGER_CENTER[0], ALGER_CENTER[1]);
      return;
    }

    setStatus("loading");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const isFirst = !hasFixRef.current;
        applyFix(pos, {
          recenter: isFirst,
          forceReport: isFirst,
        });
      },
      (err) => {
        if (err.code === 1) {
          setStatus("denied");
          if (!hasFixRef.current) {
            setPosition(ALGER_CENTER);
            onCoordsRef.current?.(ALGER_CENTER[0], ALGER_CENTER[1]);
          }
        } else if (!hasFixRef.current) {
          setStatus("unavailable");
        }
      },
      WATCH_OPTIONS
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [applyFix]);

  useEffect(() => {
    if (!meta.timestamp || status !== "ok") return;
    const tick = () => {
      const age = Date.now() - meta.timestamp;
      setMeta((m) => ({ ...m, stale: age > STALE_MS }));
    };
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [meta.timestamp, status]);

  return {
    userPosition: position,
    locStatus: status,
    locMeta: meta,
    recenterTarget,
    refreshLocation,
    pauseMapFollow,
  };
}
