import { createContext, useContext, useState } from "react";
import { data } from "../services/data/index.js";
import { DEMO_DONOR_ID } from "../config/env.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [respondedIds, setRespondedIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const markResponded = (id) => {
    setRespondedIds((prev) => [...new Set([...prev, id])]);
    setShowSuccess(true);
  };

  const respondToSos = async (sosId, eta) => {
    try {
      await data.respondToSos(sosId, { donorId: DEMO_DONOR_ID, eta });
      markResponded(sosId);
      return { ok: true };
    } catch (err) {
      if (err.code === "ALREADY_RESPONDED") {
        markResponded(sosId);
        return { ok: true, already: true };
      }
      markResponded(sosId);
      return { ok: true, offline: true };
    }
  };

  const clearSuccess = () => setShowSuccess(false);

  const hasResponded = (id) => respondedIds.includes(id);

  return (
    <AppContext.Provider
      value={{
        markResponded,
        respondToSos,
        hasResponded,
        showSuccess,
        clearSuccess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
