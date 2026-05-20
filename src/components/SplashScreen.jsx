import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2200);
    const doneTimer = setTimeout(() => onComplete(), 2900);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center splash-screen ${
        exiting ? "splash-exit" : ""
      }`}
    >
      <div className="relative flex flex-col items-center">
        <span className="absolute h-32 w-32 rounded-full border-2 border-white/30 splash-ring" />
        <span className="absolute h-40 w-40 rounded-full border border-white/15 splash-ring stagger-2" />
        <div className="relative splash-drop">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Droplet className="h-16 w-16 text-white fill-white drop-shadow-lg" />
          </div>
          <span className="absolute left-1/2 top-full h-8 w-1.5 -translate-x-1/2 rounded-full bg-white/80 splash-drip-1" />
          <span className="absolute left-[38%] top-full h-6 w-1 rounded-full bg-white/60 splash-drip-2" />
          <span className="absolute left-[62%] top-full h-5 w-1 rounded-full bg-white/50 splash-drip-3" />
        </div>
        <h1 className="splash-title mt-8 text-3xl font-bold text-white tracking-wide">قطرة</h1>
        <p className="splash-title mt-1 text-sm text-white/80 font-medium">
          Qatra · Croissant-Rouge Algérien
        </p>
      </div>
    </div>
  );
}
