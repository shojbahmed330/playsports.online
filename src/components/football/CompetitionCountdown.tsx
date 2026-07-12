import { useEffect, useState } from "react";
import type { Competition } from "@/lib/competitions";
import { formatSeasonLabel } from "@/lib/competitions";
import { Timer } from "lucide-react";

/**
 * Countdown banner shown on a competition landing page when the current
 * season/edition has a scheduled start in the future. For leagues we skip
 * the countdown after the season has begun.
 */
export function CompetitionCountdown({
  comp,
  targetIso,
}: {
  comp: Competition;
  /** Optional explicit start timestamp. Falls back to Jan 1 of currentSeason. */
  targetIso?: string;
}) {
  const target = new Date(targetIso ?? `${comp.currentSeason}-06-15T18:00:00Z`).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target - now;
  if (!Number.isFinite(target) || diff <= 0) return null;
  const days = Math.floor(diff / (24 * 3600_000));
  const hours = Math.floor((diff % (24 * 3600_000)) / 3600_000);
  const mins = Math.floor((diff % 3600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        <Timer className="size-3.5" /> {comp.shortName} {formatSeasonLabel(comp, comp.currentSeason)} countdown
      </div>
      <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
        <Unit v={days} label="days" />
        <Unit v={hours} label="hours" />
        <Unit v={mins} label="min" />
        <Unit v={secs} label="sec" />
      </div>
    </section>
  );
}

function Unit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-black tabular-nums">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}
