import { useEffect, useState } from "react";

/**
 * Thin one-line status bar under the hero.
 * Shows live count, upcoming count, and user's local timezone.
 */
export function StatusBar({
  liveCount,
  upcomingCount,
  totalToday,
}: {
  liveCount: number;
  upcomingCount: number;
  totalToday: number;
}) {
  const [zone, setZone] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = -new Date().getTimezoneOffset() / 60;
      const sign = offset >= 0 ? "+" : "";
      setZone(`${tz} · GMT${sign}${offset}`);
    } catch {
      setZone("local time");
    }
  }, []);

  return (
    <div className="border-b border-white/5 bg-gray-950/80 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
        <div
          suppressHydrationWarning
          className="flex items-center gap-3 sm:gap-4 min-w-0 overflow-x-auto no-scrollbar"
        >
          <span className="inline-flex items-center gap-1.5 font-bold text-red-300 shrink-0">
            <span
              className={`size-1.5 rounded-full ${
                mounted && liveCount > 0
                  ? "bg-live animate-pulse motion-reduce:animate-none"
                  : "bg-muted"
              }`}
            />
            {liveCount} live
          </span>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="text-amber-300 font-semibold shrink-0">{upcomingCount} upcoming</span>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="text-muted-foreground shrink-0">{totalToday} today</span>
        </div>
        {zone && (
          <span className="text-gray-500 truncate hidden sm:inline" title={zone}>
            🌍 {zone}
          </span>
        )}
      </div>
    </div>
  );
}
