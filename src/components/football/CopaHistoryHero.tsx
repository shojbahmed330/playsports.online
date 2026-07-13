import { useState, useMemo } from "react";
import { Sparkles, Search, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { copaStats, getCopaEditions, copaFlag } from "@/lib/copa-history";
import { latestCompletedEdition, titleCounts } from "@/lib/competition-history";

/** Full-bleed hero for /football/copa-america/history. */
export function CopaHistoryHero() {
  const stats = copaStats();
  const last = latestCompletedEdition("copa-america");
  const titles = titleCounts("copa-america");
  const reigningTitles = last ? (titles.find((t) => t.team === last.winner)?.titles ?? 1) : 1;

  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    const n = parseInt(q, 10);
    return getCopaEditions()
      .filter((e) => (Number.isFinite(n) ? String(e.year).includes(q) : (e.winner ?? "").toLowerCase().includes(q.toLowerCase())))
      .slice(0, 5);
  }, [q]);

  function jumpTo(year: number) {
    const decade = Math.floor(year / 10) * 10;
    const el = document.getElementById(`decade-${decade}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setQ("");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/15 via-sky-500/10 to-emerald-500/10 p-5 sm:p-8 mb-6">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.35),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.25),transparent_55%)]"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Sparkles className="size-3" /> Copa América · Archive
        </div>
        <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight">
          Every Copa, every champion.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          South America's oldest international — {stats.tournaments} tournaments, {stats.champions} different champions.
        </p>

        <div className="mt-5 grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          <StatTile value={stats.tournaments} label="Tournaments" tone="amber" />
          <StatTile value={stats.champions} label="Different champions" tone="emerald" />
          <StatTile value={stats.span} label="Years covered" tone="sky" small />
          <StatTile value={stats.goals || "—"} label="Goals scored" tone="rose" />
          <StatTile value={stats.matches || "—"} label="Matches played" tone="indigo" />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && suggestions[0]) jumpTo(suggestions[0].year); }}
              placeholder="Jump to year or nation…"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm outline-none focus:border-white/30 focus:bg-white/[0.08]"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur shadow-xl overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.year}
                    type="button"
                    onClick={() => jumpTo(s.year)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
                  >
                    <span aria-hidden>{copaFlag(s.winner)}</span>
                    <span className="font-bold tabular-nums">{s.year}</span>
                    <span className="text-muted-foreground">· {s.winner}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {last && (
            <Link
              to="/football/$comp/history/$year"
              params={{ comp: "copa-america", year: String(last.year) }}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 px-4 h-12 text-sm font-bold text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/30 shrink-0"
            >
              <Trophy className="size-4" /> Reigning: {last.winner} · {reigningTitles} title{reigningTitles === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function StatTile({ value, label, tone, small }: { value: number | string; label: string; tone: "amber" | "emerald" | "sky" | "rose" | "indigo"; small?: boolean }) {
  const toneCls =
    tone === "amber" ? "text-amber-200"
    : tone === "emerald" ? "text-emerald-200"
    : tone === "sky" ? "text-sky-200"
    : tone === "rose" ? "text-rose-200"
    : "text-indigo-200";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 min-w-0">
      <div className={`font-black tabular-nums truncate ${toneCls} ${small ? "text-base sm:text-xl" : "text-xl sm:text-3xl"}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate">
        {label}
      </div>
    </div>
  );
}
