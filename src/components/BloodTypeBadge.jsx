const typeStyles = {
  "O-": "bg-red-800 text-white border-red-900",
  "AB-": "bg-red-800 text-white border-red-900",
  "O+": "bg-red-100 text-red-700 border-red-200",
  "A+": "bg-red-100 text-red-700 border-red-200",
  "B+": "bg-red-100 text-red-700 border-red-200",
  "AB+": "bg-blue-100 text-blue-700 border-blue-200",
  "A-": "bg-blue-100 text-blue-700 border-blue-200",
  "B-": "bg-blue-100 text-blue-700 border-blue-200",
};

export default function BloodTypeBadge({ type, size = "md" }) {
  const sizeClass =
    size === "lg"
      ? "px-4 py-2 text-lg font-bold"
      : "px-3 py-1 text-sm font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClass} ${
        typeStyles[type] ?? "bg-red-100 text-red-700 border-red-200"
      }`}
    >
      {type}
    </span>
  );
}
