import { Radio, Calendar, Clock } from "lucide-react";
import { CompetitionCountdown } from "./CompetitionCountdown";
import type { Competition } from "@/lib/competitions";

export type ScoresFilter = "all" | "live" | "upcoming" | "final";

/**
 * Scoreboard hero: live/today/next stat row + filter pills. When no
 * live matches, drops in a compact Euro 2028 countdown.
 */
export function EuroScoresHero({
  comp,
  liveCount,
  todayCount,
  nextLabel,
  filter,
  onFilterChange,
  counts,
}: {
  comp: Competition;
  liveCount: number;
  todayCount: number;
  nextLabel: string | null;
  filter: ScoresFilter;
  onFilterChange: (f: ScoresFilter) => void;
  counts: Record<ScoresFilter, number>;
}) {
  const showCountdown = liveCount === 0 && comp.slug === "euro";
  return (
    <section className="mb-4 sm:mb-6 space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          icon={<Radio className="size-3.5" />}
          label="Live"
          value={liveCount}
          accent={liveCount > 0 ? "text-red-300" : undefined}
          pulse={liveCount > 0}
        />
        <Stat
          icon={<Calendar className="size-3.5" />}
          label="Today"
          value={todayCount}
        />
        <Stat
          icon={<Clock className="size-3.5" />}
          label="Next"
          text={nextLabel ?? "—"}
        />
      </div>

      {showCountdown && (
        <CompetitionCountdown comp={comp} targetIso="2028-06-09T19:00:00Z" />
      )}

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {(["all", "live", "upcoming", "final"] as ScoresFilter[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border min-h-[36px] ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f} · {counts[f] ?? 0}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  text,
  accent,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  text?: string;
  accent?: string;
  pulse?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
        {pulse && <span className="size-1.5 rounded-full bg-red-400 animate-pulse ml-auto" />}
      </div>
      <div className={`mt-1 text-xl sm:text-2xl font-black tabular-nums truncate ${accent ?? "text-foreground"}`}>
        {value !== undefined ? value : text}
      </div>
    </div>
  );
}
