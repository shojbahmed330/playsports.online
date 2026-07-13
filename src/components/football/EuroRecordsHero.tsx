import { useMemo, useState } from "react";
import { Sparkles, Search, Goal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { euroStats } from "@/lib/euro-history";
import { EURO_TOP_SCORERS } from "@/lib/euro-records";

/** Full-bleed hero for /football/euro/records. */
export function EuroRecordsHero() {
  const stats = euroStats();
  const topScorer = EURO_TOP_SCORERS[0];

  const targets = useMemo(
    () => [
      { id: "leaderboards", label: "Top scorers · all-time" },
      { id: "leaderboards", label: "Most titles" },
      { id: "leaderboards", label: "Most appearances" },
      { id: "leaderboards", label: "Most goals in a single Euro" },
      { id: "golden-boot", label: "Golden Boot lineage" },
      { id: "record-book", label: "Youngest scorer" },
      { id: "record-book", label: "Oldest scorer" },
      { id: "record-book", label: "Biggest final win" },
      { id: "record-book", label: "Greatest upset" },
      { id: "title-race", label: "Title race" },
      { id: "on-this-day-record", label: "On this day" },
    ],
    [],
  );

  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return targets.filter((t) => t.label.toLowerCase().includes(s)).slice(0, 5);
  }, [q, targets]);

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setQ("");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-amber-500/10 p-5 sm:p-8 mb-6" id="records-hero">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.25),transparent_55%)]"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Sparkles className="size-3" /> UEFA European Championship · Records
        </div>
        <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight">
          UEFA Euro Records
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Every top scorer, every dynasty, every "did you know" — since 1960.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <StatTile value={stats.goals || "—"} label="Goals scored" tone="emerald" />
          <StatTile value={stats.matches || "—"} label="Matches played" tone="sky" />
          <StatTile value={stats.tournaments} label="Editions counted" tone="amber" />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) jumpTo(suggestions[0].id);
              }}
              placeholder="Jump to a record…"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm outline-none focus:border-white/30 focus:bg-white/[0.08]"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur shadow-xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.id}-${i}`}
                    type="button"
                    onClick={() => jumpTo(s.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                  >
                    <span className="text-muted-foreground">→</span>{" "}
                    <span className="font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {topScorer && (
            <Link
              to="/football/$comp/records/$category"
              params={{ comp: "euro", category: "top-scorers-all-time" }}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 px-4 h-12 text-sm font-bold text-emerald-100 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30 shrink-0"
            >
              <Goal className="size-4" /> All-time top scorer: {topScorer.name} · {topScorer.value}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function StatTile({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "emerald" | "sky" | "amber";
}) {
  const toneCls =
    tone === "emerald" ? "text-emerald-200" : tone === "sky" ? "text-sky-200" : "text-amber-200";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 min-w-0">
      <div className={`font-black tabular-nums truncate ${toneCls} text-xl sm:text-3xl`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate">
        {label}
      </div>
    </div>
  );
}
