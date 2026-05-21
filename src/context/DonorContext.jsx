import { createContext, useContext, useState, useEffect } from "react";
import { data } from "../services/data/index.js";
import { DEMO_DONOR_ID } from "../config/env.js";

const DonorContext = createContext(null);

export function DonorProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [badgeDetails, setBadgeDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await data.health();
      setApiOnline(true);
      const donorData = await data.getDonor(DEMO_DONOR_ID);
      setDonor(donorData);
      setDonationHistory(donorData.donationHistory ?? []);
      setBadgeDetails(donorData.badgeDetails ?? []);
    } catch (e) {
      setApiOnline(false);
      setError(e.message);
      const { donor: mockDonor, donationHistory: mockHistory, badgeDetails: mockBadges } =
        await import("../mockData");
      setDonor(mockDonor);
      setDonationHistory(mockHistory);
      setBadgeDetails(mockBadges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <DonorContext.Provider
      value={{
        donor,
        donationHistory,
        badgeDetails,
        loading,
        apiOnline,
        error,
        refresh,
        donorId: DEMO_DONOR_ID,
      }}
    >
      {children}
    </DonorContext.Provider>
  );
}

export function useDonor() {
  const ctx = useContext(DonorContext);
  if (!ctx) throw new Error("useDonor must be used within DonorProvider");
  return ctx;
}
