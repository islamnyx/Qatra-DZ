import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SOSBanner from "../components/SOSBanner";
import EligibilityRing from "../components/EligibilityRing";
import SOSRespondModal from "../components/SOSRespondModal";
import RespondSuccess from "../components/RespondSuccess";
import FeatureLinkCard from "../components/FeatureLinkCard";
import { formatTimeAgo } from "../mockData";
import { shareSOS } from "../utils/shareSOS";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { useDonor } from "../context/DonorContext";
import { data } from "../services/data/index.js";
import { Droplet, Award, Heart, Info, Sparkles, Users, QrCode } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const { donor, loading, apiOnline } = useDonor();
  const { respondToSos, hasResponded, showSuccess, clearSuccess } = useApp();
  const [urgentSOS, setUrgentSOS] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [serverResponded, setServerResponded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWhy56, setShowWhy56] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!donor) return;
    data
      .getUrgentSos()
      .then((data) => {
        setUrgentSOS(data.request);
        setMatchScore(data.matchScore);
        setServerResponded(data.responded);
      })
      .catch(async () => {
        const { getMostUrgentSOS } = await import("../mockData");
        const { calculateMatchScore } = await import("../utils/matchScore");
        const req = getMostUrgentSOS();
        setUrgentSOS(req);
        setMatchScore(calculateMatchScore(req, donor));
        setServerResponded(false);
      });
  }, [donor]);

  const handleShare = async () => {
    if (!urgentSOS) return;
    const result = await shareSOS(urgentSOS);
    if (result === "copied") setToast("تم النسخ!");
    else if (result) setToast("تم المشاركة!");
    setTimeout(() => setToast(""), 2500);
  };

  const responded = urgentSOS
    ? hasResponded(urgentSOS.id) || serverResponded
    : false;

  if (loading || !donor) {
    return (
      <div className="mx-auto min-h-screen max-w-sm bg-red-50 flex items-center justify-center">
        <p className="text-red-600 font-semibold">...</p>
      </div>
    );
  }

  const livesSaved = donor.totalDonations * 3;
  const badgeCount = donor.badges?.length ?? 0;

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <Navbar apiOnline={apiOnline} />
      {toast && (
        <div className="mx-4 mt-2 rounded-xl bg-red-700 px-4 py-2 text-center text-sm font-semibold text-white">
          {toast}
        </div>
      )}
      <main className="space-y-4 px-4 py-4">
        {urgentSOS && (
          <div className="animate-fade-in-up">
            <SOSBanner
              request={urgentSOS}
              matchScore={matchScore}
              onRespond={() => setModalOpen(true)}
              onShare={handleShare}
              responded={responded}
              timeAgo={formatTimeAgo(urgentSOS.postedAt)}
            />
          </div>
        )}
        <section className="rounded-2xl border border-red-100 bg-white p-4 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">{t("eligibility")}</h2>
            <button type="button" onClick={() => setShowWhy56(!showWhy56)} className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <Info className="h-3.5 w-3.5" /> {t("why56")}
            </button>
          </div>
          {showWhy56 && (
            <p className="text-xs text-gray-600 bg-red-50 rounded-xl p-3 mb-3 border border-red-100">{t("why56Text")}</p>
          )}
          <div className="flex items-center gap-4">
            <EligibilityRing daysLeft={donor.daysUntilEligible} />
            <div>
              <p className="text-lg font-bold text-red-700">
                {donor.isEligible ? t("eligibleToday") : `${t("daysLeft")} ${donor.daysUntilEligible} ${t("days")}`}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> +120 {t("points")}
              </p>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-3 gap-2 animate-fade-in-up stagger-2">
          {[
            { icon: Droplet, value: donor.totalDonations, label: t("donations") },
            { icon: Heart, value: livesSaved, label: t("livesSaved") },
            { icon: Award, value: badgeCount, label: t("badges") },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-red-100 bg-white p-3 text-center">
              <Icon className="mx-auto h-5 w-5 text-red-600 mb-1" />
              <p className="text-xl font-bold text-red-700">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </section>
        <section className="space-y-2 animate-fade-in-up stagger-3">
          <FeatureLinkCard to="/family" icon={Users} title={t("familyVault")} description={t("familyVaultDesc")} />
          <FeatureLinkCard to="/passport" icon={QrCode} title={t("passport")} description={t("passportDesc")} accent="amber" />
        </section>
        <section className="rounded-2xl border border-red-100 bg-white p-4 overflow-hidden animate-fade-in-up stagger-4">
          <div className="shimmer-bar h-1 -mx-4 -mt-4 mb-3" />
          <p className="text-sm text-gray-500">{t("points")}</p>
          <p className="text-3xl font-bold text-red-700">{donor.points.toLocaleString("ar-DZ")}</p>
        </section>
      </main>
      <BottomNav />
      {modalOpen && urgentSOS && (
        <SOSRespondModal
          request={urgentSOS}
          matchScore={matchScore}
          onClose={() => setModalOpen(false)}
          onConfirm={(eta) => {
            respondToSos(urgentSOS.id, eta);
            setModalOpen(false);
          }}
        />
      )}
      {showSuccess && <RespondSuccess onClose={clearSuccess} />}
    </div>
  );
}
