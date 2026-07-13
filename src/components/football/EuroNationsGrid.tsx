import { Link } from "@tanstack/react-router";
import { EURO_NATIONS, matchesEuroTeamsFilter, finishTone, type EuroTeamsFilter } from "@/lib/euro-teams";
import { flagFor } from "@/lib/euro-history";

export function EuroNationsGrid({ filter }: { filter: EuroTeamsFilter }) {
  const nations = EURO_NATIONS.filter((n) => matchesEuroTeamsFilter(n, filter)).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  if (!nations.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
        No nations match this filter.
      </div>
    );
  }

  return (
    <ul id="grid" className="scroll-mt-24 mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {nations.map((n) => {
        const anchorId = `nation-${n.name.replace(/\s+/g, "-").toLowerCase()}`;
        const body = (
          <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition p-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none shrink-0" aria-hidden>{flagFor(n.name)}</span>
              <span className="font-bold text-sm truncate min-w-0 flex-1">{n.name}</span>
              {n.euro2028Host && (
                <span className="shrink-0 rounded-full bg-emerald-500/15 text-emerald-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                  2028
                </span>
              )}
            </div>
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${finishTone(n.bestFinish)}`}>
              {n.bestFinish}
              {n.bestYear && n.bestFinish !== "Never qualified" ? ` · ${n.bestYear}` : ""}
            </div>
            {n.euro2024 && (
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Euro 2024 participant
              </div>
            )}
          </div>
        );
        return (
          <li key={n.name} id={anchorId}>
            {n.espnTeamId ? (
              <Link
                to="/football/$comp/teams/$teamId"
                params={{ comp: "euro", teamId: n.espnTeamId }}
                className="block h-full"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
