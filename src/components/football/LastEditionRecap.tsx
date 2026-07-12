import { Link } from "@tanstack/react-router";
import { Trophy, ArrowRight } from "lucide-react";
import type { Competition } from "@/lib/competitions";
import { latestCompletedEdition } from "@/lib/competition-history";

/**
 * Fallback card shown on Landing / Scores / Standings pages when a competition
 * is between editions (no live/upcoming data). Instead of an empty "table will
 * appear once the season begins" state, we surface the most recent completed
 * edition's champion, final and top scorer, plus deep-links into history.
 */
export function LastEditionRecap({
  comp,
  variant = "wide",
}: {
  comp: Competition;
  variant?: "wide" | "compact";
}) {
  const last = latestCompletedEdition(comp.slug);
  if (!last) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
        {comp.shortName} is between editions. Check back closer to the next tournament.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300/90">
        <Trophy className="size-3.5" /> Last edition · {last.year}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-2xl sm:text-3xl font-black text-foreground">{last.winner}</h3>
        <span className="text-sm text-muted-foreground">champions</span>
      </div>
      {last.runnerUp && (
        <p className="mt-1 text-sm text-muted-foreground">
          Final: <span className="font-semibold text-foreground">{last.winner}</span>{" "}
          {last.finalScore ?? "def."}{" "}
          <span className="font-semibold text-foreground">{last.runnerUp}</span>
          {last.finalVenue ? ` · ${last.finalVenue}` : ""}
        </p>
      )}
      {last.topScorer && (
        <p className="mt-1 text-sm text-muted-foreground">
          Top scorer:{" "}
          <span className="font-semibold text-foreground">{last.topScorer.name}</span> ·{" "}
          {last.topScorer.goals} goals
        </p>
      )}
      {variant === "wide" && last.blurb && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{last.blurb}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: comp.slug, year: String(last.year) }}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/30"
        >
          {last.year} recap <ArrowRight className="size-3.5" />
        </Link>
        <Link
          to="/football/$comp/history"
          params={{ comp: comp.slug }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-foreground/90 hover:bg-white/[0.08]"
        >
          All editions
        </Link>
        <Link
          to="/football/$comp/records"
          params={{ comp: comp.slug }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-foreground/90 hover:bg-white/[0.08]"
        >
          Records
        </Link>
      </div>
    </div>
  );
}
