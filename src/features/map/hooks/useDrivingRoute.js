import { useEffect, useState } from "react";
import { fetchDrivingRoute } from "../utils/routing.js";

/**
 * Loads road-following route when user + destination are set.
 */
export function useDrivingRoute(userPosition, routeTarget) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userPosition || !routeTarget) {
      setRoute(null);
      setLoading(false);
      return;
    }

    if (routeTarget.cachedRoute) {
      setRoute(routeTarget.cachedRoute);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchDrivingRoute(userPosition, { lat: routeTarget.lat, lng: routeTarget.lng }).then(
      (result) => {
        if (!cancelled) {
          setRoute(result);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [
    userPosition,
    routeTarget?.lat,
    routeTarget?.lng,
    routeTarget?.id,
    routeTarget?.cachedRoute,
  ]);

  return { route, loading };
}
