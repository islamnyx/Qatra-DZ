import { useState } from "react";
import BottomNav from "../components/BottomNav";
import BackHeader from "../components/BackHeader";
import BloodTypeBadge from "../components/BloodTypeBadge";
import { familyMembers } from "../mockData";
import { useLanguage } from "../context/LanguageContext";
import { Users, Shield, Bell, UserPlus, Check } from "lucide-react";

export default function FamilyVault() {
  const { t, lang } = useLanguage();
  const [circleOn, setCircleOn] = useState(true);
  const [alertDemo, setAlertDemo] = useState(false);
  const [toast, setToast] = useState("");

  const runDemoAlert = () => {
    setAlertDemo(true);
    setToast(t("demoAlertDone"));
    setTimeout(() => { setAlertDemo(false); setToast(""); }, 3000);
  };

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <BackHeader title={t("familyVaultTitle")} subtitle={t("familyVaultSubtitle")} />
      {toast && (
        <div className="mx-4 mt-3 rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white">{toast}</div>
      )}
      <main className="space-y-4 px-4 py-4">
        <section className="rounded-2xl border border-red-200 bg-red-600 p-4 text-white">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-bold text-sm">{t("alertCircleFirst")}</p>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">{t("alertCircleDesc")}</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-red-100 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            <span className="text-sm font-semibold">{t("circleActive")}</span>
          </div>
          <button type="button" onClick={() => setCircleOn(!circleOn)} className={`relative h-7 w-12 rounded-full ${circleOn ? "bg-red-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 start-0.5 h-6 w-6 rounded-full bg-white transition-transform ${circleOn ? "translate-x-5" : ""}`} />
          </button>
        </section>
        <ul className="space-y-2">
          {familyMembers.map((member) => (
            <li key={member.id} className={`rounded-2xl border border-red-100 bg-white p-4 flex items-center gap-3 ${alertDemo ? "ring-2 ring-red-300" : ""}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{member.alertOrder}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{member.name}</p>
                <p className="text-xs text-gray-500">{lang === "fr" ? member.relationFr : member.relationAr} · {member.wilaya}</p>
              </div>
              <BloodTypeBadge type={member.bloodType} />
              {alertDemo && <Bell className="h-4 w-4 text-red-600 animate-pulse shrink-0" />}
            </li>
          ))}
        </ul>
        <button type="button" className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-red-300 bg-white py-3 text-sm font-semibold text-red-600">
          <UserPlus className="h-4 w-4" /> {t("addFamily")}
        </button>
        <button type="button" onClick={runDemoAlert} disabled={!circleOn || alertDemo} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white disabled:opacity-50">
          {alertDemo ? <><Check className="h-4 w-4" /> {t("demoAlertDone")}</> : <><Bell className="h-4 w-4" /> {t("demoAlert")}</>}
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
