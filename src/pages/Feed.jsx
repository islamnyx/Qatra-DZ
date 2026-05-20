import { useState } from "react";
import BottomNav from "../components/BottomNav";
import LanguageToggle from "../components/LanguageToggle";
import { newsFeed } from "../mockData";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { Newspaper, Users, Calendar } from "lucide-react";

const tagStyles = {
  red: "bg-red-100 text-red-700 border-red-200",
  green: "bg-green-100 text-green-700 border-green-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Feed() {
  const { t, lang } = useLanguage();
  const { campaignInterest, registerCampaignInterest } = useApp();
  const [joined, setJoined] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <header className="border-b border-red-100 bg-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-red-600" />
            <div>
              <h1 className="text-lg font-bold text-red-700">{t("feedTitle")}</h1>
              <p className="text-xs text-gray-500">CRA Algeria</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>
      <main className="px-4 py-4 space-y-3">
        {newsFeed.map((item) => (
          <article key={item.id} className={`rounded-2xl border bg-white p-4 ${item.isCampaign ? "border-red-300" : "border-red-100"}`}>
            {item.isCampaign && (
              <div className="flex items-center gap-2 mb-3 rounded-xl bg-red-600 px-3 py-2 text-white">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs font-bold">{t("campaignDays")}</p>
                  <p className="text-xs flex items-center gap-1"><Users className="h-3 w-3" />{campaignInterest} {t("peopleInterested")}</p>
                </div>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tagStyles[item.tagColor]}`}>{item.tag}</span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h2 className="font-bold text-sm mb-1">{lang === "fr" && item.titleFr ? item.titleFr : item.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{lang === "fr" && item.descriptionFr ? item.descriptionFr : item.description}</p>
            {item.isCampaign && (
              <button type="button" onClick={() => { if (!joined) { registerCampaignInterest(); setJoined(true); } }} disabled={joined} className={`w-full rounded-xl py-2.5 text-sm font-bold ${joined ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-600 text-white"}`}>
                {joined ? `✓ ${t("interested")}` : t("registerInterest")}
              </button>
            )}
          </article>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
