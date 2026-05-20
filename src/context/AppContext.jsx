import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);
const CAMPAIGN_KEY = "qatra_campaign_interest";

export function AppProvider({ children }) {
  const [respondedIds, setRespondedIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [campaignInterest, setCampaignInterest] = useState(487);

  useEffect(() => {
    const saved = localStorage.getItem(CAMPAIGN_KEY);
    if (saved) setCampaignInterest(Number(saved));
  }, []);

  const markResponded = (id) => {
    setRespondedIds((prev) => [...new Set([...prev, id])]);
    setShowSuccess(true);
  };

  const clearSuccess = () => setShowSuccess(false);

  const registerCampaignInterest = () => {
    setCampaignInterest((n) => {
      const next = n + 1;
      localStorage.setItem(CAMPAIGN_KEY, String(next));
      return next;
    });
  };

  const hasResponded = (id) => respondedIds.includes(id);

  return (
    <AppContext.Provider
      value={{
        markResponded,
        hasResponded,
        showSuccess,
        clearSuccess,
        campaignInterest,
        registerCampaignInterest,
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
