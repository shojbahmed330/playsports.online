import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { copaAnniversary } from "@/lib/copa-records";
import { copaFlag } from "@/lib/copa-history";

/** "On this day" for Copa history page. */
export function CopaOnThisDayHistory() {
  const found = copaAnniversary();
  if (!found) return null;
  const { edition, yearsAgo, isToday, daysAway } = found;
  const [, m, d] = (edition.finalDate as string).split("-").map(Number);
  const dateLabel = new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return (
    <section
      id="on-this-day-history"
      className="mt-8 scroll-mt-32 rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.09] via-white/[0.02] to-white/[0.02] p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300">
        <CalendarDays className="size-3.5" />
        {isToday
          ? `On this day · ${yearsAgo} year${yearsAgo === 1 ? "" : "s"} ago`
          : `Next Copa anniversary · in ${daysAway} day${daysAway === 1 ? "" : "s"}`}
      </div>
      <div className="mt-2 flex items-center gap-2 min-w-0">
        <span aria-hidden className="text-2xl shrink-0">{copaFlag(edition.winner)}</span>
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-black truncate">
            {edition.winner}{" "}
            <span className="text-muted-foreground font-medium">
              {edition.finalScore ?? ""} {edition.runnerUp ?? ""}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            Copa {edition.year} final · {edition.finalVenue ?? edition.host} · {dateLabel}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: "copa-america", year: String(edition.year) }}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100 ring-1 ring-amber-400/30 hover:bg-amber-500/30"
        >
          Read the {edition.year} recap →
        </Link>
      </div>
    </section>
  );
}
