import { Trophy } from "lucide-react";
import { CHAMPIONS_OVERRIDE, type ChampionRecord } from "@/lib/champions";

const SPORT_META: Record<ChampionRecord["sport"], { label: string; accent: string; href?: string }> = {
  football_wc: { label: "FIFA World Cup", accent: "from-amber-500/20 to-amber-500/0", href: "/football" },
  ipl: { label: "IPL", accent: "from-yellow-400/20 to-yellow-400/0", href: "/cricket/ipl" },
  icc_wc: { label: "ICC ODI World Cup", accent: "from-sky-500/20 to-sky-500/0", href: "/cricket" },
  t20_wc: { label: "T20 World Cup", accent: "from-emerald-500/20 to-emerald-500/0", href: "/cricket" },
  mlb: { label: "MLB", accent: "from-red-500/20 to-red-500/0", href: "/mlb" },
  nba: { label: "NBA", accent: "from-orange-500/20 to-orange-500/0", href: "/nba" },
  nhl: { label: "NHL", accent: "from-blue-500/20 to-blue-500/0", href: "/nhl" },
  mls: { label: "MLS", accent: "from-lime-500/20 to-lime-500/0", href: "/mls" },
};

/**
 * Cross-sport champions strip. Reads from the central champions registry
 * (`src/lib/champions.ts`) — adding a new winner there auto-appears here
 * and on any other surface that uses `getChampion()`.
 */
export function HallOfChampionsStrip() {
  // Most recent winner per sport, only sports we have meta for.
  const latestPerSport = new Map<string, ChampionRecord>();
  for (const c of CHAMPIONS_OVERRIDE) {
    if (!SPORT_META[c.sport]) continue;
    const existing = latestPerSport.get(c.sport);
    if (!existing || c.season > existing.season) latestPerSport.set(c.sport, c);
  }
  const rows = Array.from(latestPerSport.values()).sort((a, b) => b.season - a.season);
  if (!rows.length) return null;

  return (
    <section className="space-y-3 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Reigning champions
          </h2>
          <p className="text-lg sm:text-xl font-extrabold mt-1">Hall of titleholders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {rows.map((c) => {
          const meta = SPORT_META[c.sport];
          const Inner = (
            <div
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${meta.accent} bg-card p-4 h-full transition-all hover:border-amber-500/50 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  {meta.label}
                </span>
                <span className="text-[10px] tabular-nums font-bold text-amber-300/80">{c.season}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-3xl leading-none" aria-hidden>{c.emoji ?? "🏆"}</span>
                <div className="min-w-0">
                  <div className="font-extrabold truncate">{c.champion}</div>
                  {c.runnerUp && (
                    <div className="text-[11px] text-muted-foreground truncate">
                      def. {c.runnerUp}
                    </div>
                  )}
                </div>
              </div>
              <Trophy className="absolute -bottom-3 -right-2 size-16 text-amber-500/10" aria-hidden />
            </div>
          );

          return meta.href ? (
            <a key={`${c.sport}-${c.season}`} href={meta.href} className="block">
              {Inner}
            </a>
          ) : (
            <div key={`${c.sport}-${c.season}`}>{Inner}</div>
          );
        })}
      </div>
    </section>
  );
}
