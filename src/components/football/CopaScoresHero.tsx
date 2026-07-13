import { Link } from "@tanstack/react-router";
import { Radio, Calendar, Clock, Trophy } from "lucide-react";
import { CompetitionCountdown } from "./CompetitionCountdown";
import type { Competition } from "@/lib/competitions";
import type { ScoresFilter } from "./EuroScoresHero";

/**
 * Copa América scoreboard hero: title + live/today/next/reigning stat row +
 * filter pills. When no live matches, drops in a compact Copa 2028 countdown.
 */
export function CopaScoresHero({
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
  const showCountdown = liveCount === 0;
  return (
    <section className="mb-4 sm:mb-6 space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-black truncate">
          Copa América · Live scores
        </h1>
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: "copa-america", year: "2024" }}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 ring-1 ring-amber-400/30 hover:bg-amber-500/25"
        >
          <Trophy className="size-3" /> 🇦🇷 2024
        </Link>
      </div>

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
        <CompetitionCountdown comp={comp} targetIso="2028-06-11T20:00:00Z" />
      )}

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        {(["all", "live", "upcoming", "final"] as ScoresFilter[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`snap-start shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition border min-h-[36px] ${
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
