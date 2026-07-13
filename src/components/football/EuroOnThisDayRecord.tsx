import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { nextRecordMoment } from "@/lib/euro-records";

/** Anniversary card scoped to record-setting Euro moments. */
export function EuroOnThisDayRecord() {
  const found = nextRecordMoment();
  if (!found) return null;
  const { moment, daysAway, isToday } = found;
  const [, m, d] = moment.date.split("-").map(Number);
  const dateLabel = new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return (
    <section
      id="on-this-day-record"
      className="mt-8 scroll-mt-24 rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.09] via-white/[0.02] to-white/[0.02] p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
        <CalendarDays className="size-3.5" />
        {isToday
          ? `Record set on this day · ${new Date().getUTCFullYear() - moment.year} years ago`
          : `Next record anniversary · in ${daysAway} day${daysAway === 1 ? "" : "s"}`}
      </div>
      <div className="mt-2 min-w-0">
        <div className="text-lg sm:text-xl font-black truncate">{moment.headline}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Euro {moment.year} · {dateLabel}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{moment.detail}</p>
      </div>
      <div className="mt-3">
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: "euro", year: String(moment.year) }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-100 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30"
        >
          Read the {moment.year} recap →
        </Link>
      </div>
    </section>
  );
}
