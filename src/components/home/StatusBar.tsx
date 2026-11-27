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
    <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-caption sm:px-6">
        <div
          suppressHydrationWarning
          className="no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto sm:gap-4"
        >
          <span className="inline-flex shrink-0 items-center gap-1.5 font-bold text-live">
            <span
              className={`size-1.5 rounded-full ${
                mounted && liveCount > 0
                  ? "bg-live animate-pulse motion-reduce:animate-none"
                  : "bg-muted"
              }`}
              aria-hidden="true"
            />
            {liveCount} live
          </span>
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">·</span>
          <span className="shrink-0 font-semibold text-primary">{upcomingCount} upcoming</span>
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">·</span>
          <span className="shrink-0 text-muted-foreground">{totalToday} today</span>
        </div>
        {zone && (
          <span className="hidden truncate text-muted-foreground sm:inline" title={zone}>
            🕒 {zone}
          </span>
        )}
      </div>
    </div>
  );
}
