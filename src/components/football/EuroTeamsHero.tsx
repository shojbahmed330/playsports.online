import { useMemo, useState } from "react";
import { Sparkles, Search, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EURO_NATIONS } from "@/lib/euro-teams";
import { euroChampionNations } from "@/lib/euro-teams";
import { flagFor } from "@/lib/euro-history";

/** Full-bleed header for /football/euro/teams. */
export function EuroTeamsHero() {
  const played = EURO_NATIONS.filter((n) => n.bestFinish !== "Never qualified").length;
  const champs = euroChampionNations();
  const spain = champs[0];
  const euro28 = EURO_NATIONS.filter((n) => n.euro2028Host).length;

  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return EURO_NATIONS.filter((n) => n.name.toLowerCase().includes(s)).slice(0, 6);
  }, [q]);

  function jumpTo(name: string) {
    const el = document.getElementById(`nation-${name.replace(/\s+/g, "-").toLowerCase()}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setQ("");
  }

  return (
    <section
      id="teams-hero"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-amber-500/10 p-5 sm:p-8 mb-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.25),transparent_55%)]"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          <Sparkles className="size-3" /> 55 nations · one trophy
        </div>
        <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight">UEFA Euro Nations</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Every UEFA member nation, best-ever Euro finish and the road to Euro 2028.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <Tile value={played} label="Nations that have played" tone="sky" />
          <Tile value={champs.length} label="Different champions" tone="amber" />
          <Tile value={euro28} label="Euro 2028 host nations" tone="emerald" />
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
              placeholder="Jump to a nation…"
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
                    <span aria-hidden>{flagFor(s.name)}</span>
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-muted-foreground text-[11px]">· {s.bestFinish}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {spain && (
            <Link
              to="/football/$comp/history/$year"
              params={{ comp: "euro", year: String(spain.years[spain.years.length - 1]) }}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 px-4 h-12 text-sm font-bold text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/30 shrink-0"
            >
              <Trophy className="size-4" /> Reigning champion: {spain.team} · ×{spain.titles}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({ value, label, tone }: { value: number | string; label: string; tone: "sky" | "amber" | "emerald" }) {
  const c = tone === "sky" ? "text-sky-200" : tone === "amber" ? "text-amber-200" : "text-emerald-200";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4 min-w-0">
      <div className={`font-black tabular-nums truncate ${c} text-xl sm:text-3xl`}>{value}</div>
      <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground truncate">{label}</div>
    </div>
  );
}
