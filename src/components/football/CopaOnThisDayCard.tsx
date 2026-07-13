import { Link } from "@tanstack/react-router";
import { CalendarClock, ArrowRight } from "lucide-react";
import { getCopaOnThisDay } from "@/lib/copa-history";

/** "On this day in Copa history" — silent when no anniversaries match. */
export function CopaOnThisDayCard() {
  const hits = getCopaOnThisDay(new Date());
  if (!hits.length) return null;

  return (
    <section id="on-this-day" className="mt-8 sm:mt-10 scroll-mt-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <CalendarClock className="size-4" /> On this day in Copa history
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {hits.slice(0, 4).map((h, i) => (
          <Link
            key={`${h.year}-${i}`}
            to="/football/$comp/history/$year"
            params={{ comp: "copa-america", year: String(h.year) }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition p-4"
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-sky-200/90">
              Copa {h.year}
            </div>
            <p className="mt-1 text-sm leading-snug">{h.text}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              Read the edition <ArrowRight className="size-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
