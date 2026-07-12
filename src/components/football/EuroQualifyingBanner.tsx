import { Link } from "@tanstack/react-router";
import { CalendarClock, ArrowRight } from "lucide-react";

/**
 * Shown when the API returns zero matches while looking at "today".
 * Explains the tournament calendar gap and points to fixtures.
 */
export function EuroQualifyingBanner() {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 grid place-items-center size-10 rounded-xl bg-blue-500/15 text-blue-300">
          <CalendarClock className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">
            Euro 2028 · Off-season
          </div>
          <h3 className="text-base sm:text-lg font-black leading-tight mb-1.5">
            No Euro matches today
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
            Euro 2028 qualifying begins March 2027. The tournament kicks off
            9 June 2028 across the UK &amp; Ireland.
          </p>
          <Link
            to="/football/$comp/fixtures"
            params={{ comp: "euro" }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold hover:border-white/30 transition"
          >
            View fixtures <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
