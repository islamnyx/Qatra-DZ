import { Bell, Droplet } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-red-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
          <Droplet className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-red-700 leading-tight">{t("appName")}</h1>
          <p className="text-xs text-gray-500">{t("appSubtitle")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-red-100">
          <Bell className="h-5 w-5 text-red-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
        </button>
      </div>
    </header>
  );
}
