import { useMemo, useState } from "react";
import { Sparkles, Search, Goal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EURO_TOP_SCORERS } from "@/lib/euro-records";
import { euroPlayerSearchIndex } from "@/lib/euro-players";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";

export function EuroPlayersHero() {
  const top = EURO_TOP_SCORERS[0];
  const boots = (COMPETITION_EDITIONS.euro ?? []).filter((e) => e.topScorer && e.winner !== "TBD");
  const uniqueScorers = new Set(boots.map((e) => e.topScorer!.name));

  const index = useMemo(() => euroPlayerSearchIndex(), []);
  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return index.filter((h) => h.name.toLowerCase().includes(s)).slice(0, 6);
  }, [q, index]);

  function jumpTo(name: string) {
    const el = document.getElementById(`player-${name.replace(/\s+/g, "-").toLowerCase()}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setQ("");
  }

  return (
    <section
      id="players-hero"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-emerald-500/10 p-5 sm:p-8 mb-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.35),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.25),transparent_55%)]"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Sparkles className="size-3" /> Euro legends · past & present
        </div>
        <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight">UEFA Euro Players</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Every Golden Boot, every 100-goal legend, every breakout star since 1960.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <Tile value={top ? `${top.value}g` : "—"} label={top ? top.name : "Top scorer"} tone="rose" />
          <Tile value={boots.length} label="Golden Boots awarded" tone="amber" />
          <Tile value={uniqueScorers.size} label="Different top scorers" tone="emerald" />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) jumpTo(suggestions[0].name);
              }}
              placeholder="Find a player…"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm outline-none focus:border-white/30 focus:bg-white/[0.08]"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur shadow-xl overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => jumpTo(s.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
                  >
                    <span className="font-semibold truncate">{s.name}</span>
                    <span className="text-muted-foreground text-[11px] truncate">· {s.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {top && (
            <Link
              to="/football/$comp/records/$category"
              params={{ comp: "euro", category: "top-scorers-all-time" }}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 px-4 h-12 text-sm font-bold text-rose-100 ring-1 ring-rose-400/30 hover:bg-rose-500/30 shrink-0"
            >
              <Goal className="size-4" /> {top.name} · {top.value} Euro goals
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({ value, label, tone }: { value: number | string; label: string; tone: "rose" | "amber" | "emerald" }) {
  const c = tone === "rose" ? "text-rose-200" : tone === "amber" ? "text-amber-200" : "text-emerald-200";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 min-w-0">
      <div className={`font-black tabular-nums truncate ${c} text-xl sm:text-3xl`}>{value}</div>
      <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate">{label}</div>
    </div>
  );
}
