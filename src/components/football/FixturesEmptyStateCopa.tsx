import { Link } from "@tanstack/react-router";
import { CalendarClock, ArrowRight } from "lucide-react";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import type { Competition } from "@/lib/competitions";

/**
 * Warm empty state for Copa América fixtures while the ESPN feed
 * has no upcoming games (between tournament windows).
 */
export function FixturesEmptyStateCopa({ comp }: { comp: Competition }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 sm:px-5 py-4 flex items-start gap-3">
        <CalendarClock className="size-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">No live Copa América fixtures right now</div>
          <p className="text-[12px] text-muted-foreground mt-1">
            Next major kickoff: Copa América 2028. Meanwhile, CONMEBOL nations meet through the World Cup qualifying window.
          </p>
          <Link
            to="/football/$comp/history/$year"
            params={{ comp: "copa-america", year: "2024" }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-200 hover:border-amber-300 transition"
          >
            Browse the 2024 archive <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          From the archives
        </div>
        <LastEditionRecap comp={comp} collapsible />
      </div>
    </div>
  );
}
