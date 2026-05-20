import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import LanguageToggle from "./LanguageToggle";

export default function BackHeader({ title, subtitle }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-red-100 bg-white px-4 py-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100"
      >
        <ArrowRight className="h-5 w-5 text-red-600" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-red-700 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      <LanguageToggle />
    </header>
  );
}
