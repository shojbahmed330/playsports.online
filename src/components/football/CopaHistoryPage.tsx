import { Link } from "@tanstack/react-router";
import { requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { CopaHistoryHero } from "@/components/football/CopaHistoryHero";
import { CopaHistoryFilters, useCopaHistoryFilter } from "@/components/football/CopaHistoryFilters";
import { CopaTitleRace } from "@/components/football/CopaTitleRace";
import { CopaChampionsTimelineDeluxe } from "@/components/football/CopaChampionsTimelineDeluxe";
import { CopaOnThisDayHistory } from "@/components/football/CopaOnThisDayHistory";
import { CopaRecordBook } from "@/components/football/CopaRecordBook";
import { CopaHostsMap } from "@/components/football/CopaHostsMap";
import { CopaDecadeCards } from "@/components/football/CopaDecadeCards";
import { CopaHistoryJumpBar } from "@/components/football/CopaHistoryJumpBar";

/** Composition root for /football/copa-america/history. */
export function CopaHistoryPage() {
  const comp = requireCompetition("copa-america");
  const [filter, setFilter] = useCopaHistoryFilter();

  return (
    <CompetitionPageShell comp={comp}>
      <div className="sm:hidden mb-4">
        <LastEditionRecap comp={comp} collapsible />
      </div>

      <CopaHistoryHero />
      <CopaHistoryFilters value={filter} onChange={setFilter} />

      <CopaTitleRace />
      <CopaChampionsTimelineDeluxe />
      <CopaOnThisDayHistory />
      <CopaRecordBook />
      <CopaHostsMap />

      <div className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
            By decade
          </h2>
          <Link
            to="/football/$comp"
            params={{ comp: "copa-america" }}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            ← Back to overview
          </Link>
        </div>
        <CopaDecadeCards filter={filter} />
      </div>

      <div className="h-16 sm:hidden" aria-hidden />
      <CopaHistoryJumpBar />
    </CompetitionPageShell>
  );
}
