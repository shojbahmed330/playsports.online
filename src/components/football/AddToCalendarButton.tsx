import { CalendarPlus } from "lucide-react";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { buildMatchIcs, downloadIcs } from "@/lib/ics";

export function AddToCalendarButton({ fx, compact = false }: { fx: Wc2026Fixture; compact?: boolean }) {
  if (!fx || fx.status !== "notstarted") return null;
  const startMs = fx.startTs * 1000;
  const title = `${fx.home.name} v ${fx.away.name} — FIFA World Cup 2026`;
  const url = `https://allsportslive.lovable.app/football/match/${fx.id}`;

  const onClick = () => {
    const ics = buildMatchIcs({
      id: fx.id,
      title,
      startMs,
      durationMinutes: 120,
      venue: fx.venue,
      city: fx.city,
      url,
      description: `${fx.group ?? ""} — kickoff local time varies. Match centre: ${url}`.trim(),
    });
    const safe = `${fx.home.code || fx.home.name}-vs-${fx.away.code || fx.away.name}`
      .replace(/[^a-z0-9\-]+/gi, "-").toLowerCase();
    downloadIcs(`wc2026-${safe}`, ics);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add match to calendar"
      className={`inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20 active:scale-95 transition ${
        compact ? "text-[10px] font-bold uppercase tracking-wider px-2 py-1" : "text-xs font-semibold px-3 py-1.5"
      }`}
    >
      <CalendarPlus className={compact ? "size-3" : "size-3.5"} />
      {compact ? "ICS" : "Add to calendar"}
    </button>
  );
}
