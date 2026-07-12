import { Radio, Calendar, Trophy } from "lucide-react";
import type { Competition } from "@/lib/competitions";
import { formatSeasonLabel } from "@/lib/competitions";

/**
 * Competition-agnostic hero. Theme driven entirely by the Competition config.
 * Callers can pass live-state props (live count, next kickoff, etc.).
 *
 * Kept intentionally simple in Phase 1 — WC's rich, WC-specific hero lives in
 * `FootballHero`. This is used by the new `/football/<comp>` landings.
 */
export function CompetitionHero({
  comp,
  liveCount = 0,
  todayCount = 0,
  nextLabel,
}: {
  comp: Competition;
  liveCount?: number;
  todayCount?: number;
  nextLabel?: string | null;
}) {
  const seasonLabel = formatSeasonLabel(comp, comp.currentSeason);
  const heroline =
    liveCount > 0
      ? `${liveCount} match${liveCount === 1 ? "" : "es"} live right now`
      : todayCount > 0
      ? `${todayCount} match${todayCount === 1 ? "" : "es"} today`
      : nextLabel
      ? `Next kickoff: ${nextLabel}`
      : comp.tagline ?? "";

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: comp.hero.gradient }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.04)_100%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.04)_100%)] bg-[size:32px_32px] opacity-40"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <div className="flex flex-col items-center text-center">
          {liveCount > 0 && (
            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-red-500/40">
              <span className="size-1.5 rounded-full bg-white animate-pulse" /> Live now
            </span>
          )}

          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            {comp.confederation}
          </div>
          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight">
            {comp.name}{" "}
            <span
              className={`bg-gradient-to-r ${comp.hero.titleAccent} bg-clip-text text-transparent`}
            >
              {seasonLabel}
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-muted-foreground max-w-2xl px-2">
            {heroline}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatPill
              icon={<Radio className="size-3.5" />}
              label="Live"
              value={liveCount}
              tone={liveCount > 0 ? "live" : "muted"}
            />
            <StatPill
              icon={<Calendar className="size-3.5" />}
              label={comp.kind === "league" ? "This week" : "Today"}
              value={todayCount}
              tone="info"
            />
            <StatPill
              icon={<Trophy className="size-3.5" />}
              label="Season"
              value={seasonLabel}
              tone="gold"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "live" | "info" | "gold" | "muted";
}) {
  const cls =
    tone === "live"
      ? "border-red-500/40 bg-red-500/10 text-red-200 shadow-[0_0_30px_-12px_rgba(239,68,68,0.6)]"
      : tone === "info"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
      : tone === "gold"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-white/10 bg-white/5 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {tone === "live" && <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />}
      {icon}
      <span className="opacity-80 uppercase tracking-wider text-[10px]">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </span>
  );
}
