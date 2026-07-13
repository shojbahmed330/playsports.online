import { Link } from "@tanstack/react-router";
import { Trophy, Sparkles, MapPin } from "lucide-react";
import type { EditionSummary } from "@/data/competition-editions";
import { editionsByDecade } from "@/lib/competition-history";
import { flagFor, euroFiltersMatch, type EuroFilterId } from "@/lib/euro-history";

/**
 * Rich per-decade cards replacing the flat decade sections. Each decade
 * shows a dominant winner badge, roll-up stats, and edition tiles with
 * winner / runner-up / top scorer / final venue.
 */
export function EuroDecadeCards({ filter }: { filter: EuroFilterId }) {
  const decades = editionsByDecade("euro");
  const anyMatch = decades.some((d) => d.editions.some((e) => euroFiltersMatch(e, filter)));
  if (!anyMatch) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-muted-foreground">
        No editions match this filter. Try switching to <span className="font-bold">All</span>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {decades.map((bucket) => {
        const editions = bucket.editions.filter((e) => euroFiltersMatch(e, filter));
        if (editions.length === 0) return null;
        const top = bucket.champions[0];
        return (
          <section
            key={bucket.decade}
            id={`decade-${bucket.decade}`}
            className="scroll-mt-32 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 sm:p-5"
          >
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-4">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Decade</div>
                <h3 className="text-lg sm:text-xl font-black truncate">
                  {bucket.label}
                  {top && (
                    <span className="ml-2 text-sm font-bold text-amber-300">
                      · {top.team} era
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
                <Pill>{editions.length} ed{editions.length === 1 ? "" : "s"}</Pill>
                {bucket.totalGoals !== undefined && (
                  <Pill>{bucket.totalGoals}g</Pill>
                )}
                {bucket.totalMatches !== undefined && (
                  <Pill>{bucket.totalMatches}m</Pill>
                )}
              </div>
            </header>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[...editions].reverse().map((e) => (
                <EditionTile key={e.year} e={e} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function EditionTile({ e }: { e: EditionSummary }) {
  return (
    <li>
      <Link
        to="/football/$comp/history/$year"
        params={{ comp: "euro", year: String(e.year) }}
        className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25 transition p-3 sm:p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden className="text-base shrink-0">{flagFor(e.winner)}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
            Euro {e.year} · {e.host}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="size-4 text-amber-300 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-black truncate">{e.winner}</div>
            {e.runnerUp && (
              <div className="text-[11px] text-muted-foreground truncate">
                <span className="tabular-nums">{e.finalScore ?? ""}</span> vs {e.runnerUp}
              </div>
            )}
          </div>
        </div>

        {e.topScorer && (
          <div className="mt-2 text-[11px] text-muted-foreground truncate">
            Top: <span className="text-foreground font-semibold">{e.topScorer.name}</span> ·{" "}
            {e.topScorer.goals}g
          </div>
        )}

        {e.finalVenue && (
          <div className="mt-0.5 text-[11px] text-muted-foreground truncate inline-flex items-center gap-1">
            <MapPin className="size-3 shrink-0" /> {e.finalVenue}
          </div>
        )}

        {e.blurb && (
          <div className="mt-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 px-2 py-1.5 text-[11px] text-amber-100/90 flex items-start gap-1.5">
            <Sparkles className="size-3 shrink-0 mt-0.5 text-amber-300" />
            <span className="line-clamp-2">{e.blurb}</span>
          </div>
        )}
      </Link>
    </li>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}
