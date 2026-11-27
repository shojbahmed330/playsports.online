import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { CHAMPIONS_OVERRIDE, type ChampionRecord } from "@/lib/champions";
import { SectionHeader } from "@/components/ui/state";

const SPORT_META: Record<
  ChampionRecord["sport"],
  { label: string; accentVar: string; href?: string }
> = {
  football_wc: { label: "FIFA World Cup", accentVar: "--color-accent-football", href: "/football" },
  ipl: { label: "IPL", accentVar: "--color-accent-cricket", href: "/cricket/ipl" },
  icc_wc: { label: "ICC ODI World Cup", accentVar: "--color-accent-cricket", href: "/cricket" },
  t20_wc: { label: "T20 World Cup", accentVar: "--color-accent-cricket", href: "/cricket" },
  mlb: { label: "MLB", accentVar: "--color-accent-mlb", href: "/mlb" },
  nba: { label: "NBA", accentVar: "--color-accent-nba", href: "/nba" },
  nhl: { label: "NHL", accentVar: "--color-accent-nhl", href: "/nhl" },
  mls: { label: "MLS", accentVar: "--color-accent-mls", href: "/mls" },
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
    <section className="animate-fade-in space-y-4 motion-reduce:animate-none">
      <SectionHeader kicker="Reigning champions" title="Hall of titleholders" className="mb-0" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((c) => {
          const meta = SPORT_META[c.sport];
          const inner = (
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:scale-[1.02]">
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `var(${meta.accentVar})` }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-micro uppercase text-muted-foreground">{meta.label}</span>
                <span className="text-micro font-bold tabular-nums text-primary">{c.season}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-3xl leading-none" aria-hidden="true">
                  {c.emoji ?? "🏆"}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-extrabold text-foreground">{c.champion}</div>
                  {c.runnerUp && (
                    <div className="truncate text-caption text-muted-foreground">
                      def. {c.runnerUp}
                    </div>
                  )}
                </div>
              </div>
              <Trophy
                className="absolute -bottom-3 -right-2 size-16 text-primary/10"
                aria-hidden="true"
              />
            </div>
          );

          return meta.href ? (
            <Link
              key={`${c.sport}-${c.season}`}
              to={meta.href as "/football"}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {inner}
            </Link>
          ) : (
            <div key={`${c.sport}-${c.season}`}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
