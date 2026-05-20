import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function FeatureLinkCard({ to, icon: Icon, title, description, accent = "red" }) {
  const accents = {
    red: "border-red-200 bg-red-50",
    amber: "border-amber-200 bg-amber-50",
  };
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-transform active:scale-[0.98] ${accents[accent] ?? accents.red}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-red-800 text-sm">{title}</p>
        <p className="text-xs text-gray-600 leading-snug mt-0.5">{description}</p>
      </div>
      <ChevronLeft className="h-5 w-5 text-red-400 shrink-0" />
    </Link>
  );
}
