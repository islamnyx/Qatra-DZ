export default function EligibilityRing({ daysLeft, totalDays = 56, size = 120 }) {
  const elapsed = totalDays - daysLeft;
  const progress = Math.min(Math.max(elapsed / totalDays, 0), 1);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;
  const isReady = daysLeft <= 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#fee2e2"
          strokeWidth="8"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#dc2626"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-red-700">
          {isReady ? "جاهز" : daysLeft}
        </span>
        {!isReady && <span className="text-xs text-gray-500">يوم</span>}
        {isReady && <span className="text-xs text-red-600 font-medium">✓</span>}
      </div>
    </div>
  );
}
