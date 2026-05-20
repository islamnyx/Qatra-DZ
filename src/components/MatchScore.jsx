export default function MatchScore({ score, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-1.5">
      <div className="relative h-9 w-9">
        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 88} 88`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
          {score}%
        </span>
      </div>
      <div>
        <p className="text-[10px] text-red-100 leading-none">{label}</p>
        <p className="text-xs font-bold text-white">مطابق جداً</p>
      </div>
    </div>
  );
}
