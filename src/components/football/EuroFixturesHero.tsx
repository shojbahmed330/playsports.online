import { useEffect, useState } from "react";
import { Trophy, CalendarCheck } from "lucide-react";

export type FixtureFilter = "all" | "qualifying" | "finals" | "my";

const MILESTONES = [
  { label: "Qualifying draw", iso: "2026-12-13T12:00:00Z" },
  { label: "Qualifiers begin", iso: "2027-03-24T18:00:00Z" },
  { label: "Play-offs", iso: "2028-03-23T19:00:00Z" },
  { label: "Euro 2028 opener", iso: "2028-06-09T19:00:00Z" },
  { label: "Euro 2028 final", iso: "2028-07-09T19:00:00Z" },
];

/**
 * Fixtures hero: next milestone chip, live countdown, filter tabs.
 * Only used on `/football/euro/fixtures`.
 */
export function EuroFixturesHero({
  filter,
  onFilterChange,
  counts,
}: {
  filter: FixtureFilter;
  onFilterChange: (f: FixtureFilter) => void;
  counts: Record<FixtureFilter, number>;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = MILESTONES.find((m) => new Date(m.iso).getTime() > now) ?? MILESTONES[MILESTONES.length - 1];
  const diff = new Date(next.iso).getTime() - now;
  const days = Math.max(0, Math.floor(diff / 86_400_000));
  const hours = Math.max(0, Math.floor((diff % 86_400_000) / 3_600_000));
  const mins = Math.max(0, Math.floor((diff % 3_600_000) / 60_000));

  return (
    <section className="mb-4 sm:mb-6 space-y-4">
      <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/[0.12] via-white/[0.02] to-transparent p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">
          <CalendarCheck className="size-3.5" /> Next milestone
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black leading-tight truncate">
              {next.label}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {new Date(next.iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-baseline gap-2 sm:gap-3 tabular-nums">
            <Unit v={days} label="d" />
            <Unit v={hours} label="h" />
            <Unit v={mins} label="m" />
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {(["all", "qualifying", "finals", "my"] as FixtureFilter[]).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "All" : f === "my" ? "My teams" : f === "qualifying" ? "Qualifying" : "Finals";
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
              {f === "finals" && <Trophy className="inline size-3 mr-1 -mt-0.5" />}
              {label} · {counts[f] ?? 0}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Unit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-xl sm:text-2xl font-black">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}
