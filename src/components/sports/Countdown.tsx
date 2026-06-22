import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatCountdown, msUntil } from "@/lib/time";

/**
 * Live-ticking countdown chip. Updates every second when <1h to go,
 * every minute otherwise.
 */
export function Countdown({
  ts,
  className = "",
  compact = false,
}: {
  ts: number;
  className?: string;
  compact?: boolean;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const remaining = msUntil(ts);
    if (remaining <= 0) return;
    const interval = remaining < 60 * 60_000 ? 1000 : 30_000;
    const id = window.setInterval(() => setTick((n) => n + 1), interval);
    return () => window.clearInterval(id);
  }, [ts]);

  const remaining = msUntil(ts);
  if (remaining <= 0) return null;
  const urgent = remaining < 60 * 60_000;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
        urgent
          ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
          : "bg-gray-800/60 text-gray-300 ring-1 ring-gray-700/60"
      } ${className}`}
    >
      {!compact && <Clock className="size-3" />}
      {formatCountdown(remaining)}
    </span>
  );
}
