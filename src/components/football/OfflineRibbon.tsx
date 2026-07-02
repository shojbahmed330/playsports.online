import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineRibbon() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="sticky top-0 z-40 bg-amber-500/95 text-black text-[11px] font-bold text-center py-1.5 px-3 inline-flex items-center justify-center gap-2 w-full">
      <WifiOff className="size-3.5" /> You're offline — showing last saved data
    </div>
  );
}
