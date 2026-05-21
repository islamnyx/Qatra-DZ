import BottomNav from "../components/BottomNav";
import BloodTypeBadge from "../components/BloodTypeBadge";
import EligibilityRing from "../components/EligibilityRing";
import BadgeCard from "../components/BadgeCard";
import FeatureLinkCard from "../components/FeatureLinkCard";
import LanguageToggle from "../components/LanguageToggle";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useDonor } from "../context/DonorContext";
import { Calendar, Trophy, TrendingUp, Users, QrCode } from "lucide-react";

function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2);
}

export default function Profile() {
  const { t } = useLanguage();
  const { donor, donationHistory, badgeDetails, loading } = useDonor();

  if (loading || !donor) {
    return (
      <div className="mx-auto min-h-screen max-w-sm bg-red-50 flex items-center justify-center">
        <p className="text-red-600 font-semibold">...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <header className="border-b border-red-100 bg-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t("profileTitle")}</p>
            <h1 className="text-lg font-bold text-red-700">{donor.name}</h1>
          </div>
          <LanguageToggle />
        </div>
      </header>
      <main className="space-y-4 px-4 py-4">
        <section className="rounded-2xl border border-red-100 bg-white p-4 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white ring-4 ring-red-100">
            {getInitials(donor.name)}
          </div>
          <BloodTypeBadge type={donor.bloodType} size="lg" />
          <p className="text-xs text-gray-500 mt-2">{donor.wilaya} · {donor.id}</p>
        </section>
        <Link to="/passport" className="block rounded-2xl border-2 border-red-200 bg-white p-4 text-center active:scale-[0.98]">
          <p className="text-xs font-semibold text-red-600 mb-2">{t("passport")}</p>
          <QrCode className="mx-auto h-8 w-8 text-red-600" />
          <p className="text-sm font-bold text-red-700 mt-2">{t("showPassport")}</p>
        </Link>
        <section className="rounded-2xl border border-red-100 bg-white p-4">
          <div className="flex justify-center"><EligibilityRing daysLeft={donor.daysUntilEligible} /></div>
        </section>
        <FeatureLinkCard to="/family" icon={Users} title={t("familyVault")} description={t("familyVaultDesc")} />
        <section className="rounded-2xl border border-red-100 bg-red-100 p-4 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-red-700 shrink-0" />
          <div>
            <p className="font-bold text-red-800 text-sm">{t("rank")}</p>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> +120 pts</p>
          </div>
        </section>
        <section className="rounded-2xl border border-red-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2"><Calendar className="h-4 w-4" />{t("history")}</h3>
          <ul className="space-y-3">
            {donationHistory.map((entry) => (
              <li key={entry.date} className="flex justify-between border-b border-red-50 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{entry.hospital}</p>
                  <p className="text-xs text-gray-500">{entry.date}</p>
                </div>
                <span className="text-xs text-red-600 font-bold">✓</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-red-100 bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            {badgeDetails.map((b) => <BadgeCard key={b.name} name={b.name} icon={b.icon} color={b.color} />)}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
