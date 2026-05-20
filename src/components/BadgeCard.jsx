import { Award, Star, Heart, Shield } from "lucide-react";

const iconMap = {
  award: Award,
  star: Star,
  heart: Heart,
  shield: Shield,
};

const colorMap = {
  red: "bg-red-100 text-red-700 border-red-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

export default function BadgeCard({ name, icon = "award", color = "red" }) {
  const Icon = iconMap[icon] ?? Award;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 ${colorMap[color] ?? colorMap.red}`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-semibold text-center leading-tight">{name}</span>
    </div>
  );
}
