import { useEffect, useMemo, useRef } from "react";
import { CalendarDays, Dot } from "lucide-react";
import type { WCMatch } from "@/lib/supabase";
import { dateKeyInTz, fmtDateChip } from "@/lib/timezone";
import { TimezonePicker, useTimezone } from "./TimezonePicker";

// YYYY-MM-DD in the *active timezone* so chips match what the user sees on
// each card. Re-keyed when the user switches timezone via useTimezone().
function dateKey(iso: string | null | undefined): string | null {
  return dateKeyInTz(iso);
}

function todayKey(): string {
  return dateKeyInTz(new Date())!;
}

function fmtChip(key: string): { weekday: string; day: string; month: string } {
  // Build a midday-UTC date that the formatter renders into the same Y-M-D
  // in the active tz (avoids edge-of-day wrap).
  const [y, m, d] = key.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return fmtDateChip(noon) ?? { weekday: "", day: String(d), month: "" };
}

export interface DateScrubberProps {
  matches: WCMatch[];
  value: string | undefined; // YYYY-MM-DD or undefined = All dates
  onChange: (next: string | undefined) => void;
  className?: string;
}

export function DateScrubber({ matches, value, onChange, className = "" }: DateScrubberProps) {
  const tz = useTimezone(); // re-render when user switches timezone
  const { dates, countByDate, livePred } = useMemo(() => {
    const map = new Map<string, number>();
    const live = new Set<string>();
    const now = Date.now();
    for (const m of matches) {
      const k = dateKey(m.match_date);
      if (!k) continue;
      map.set(k, (map.get(k) ?? 0) + 1);
      if (m.match_date) {
        const ts = new Date(m.match_date).getTime();
        const diff = now - ts;
        if (diff >= 0 && diff <= 2.5 * 60 * 60 * 1000 && !m.predicted) live.add(k);
      }
    }
    const sorted = Array.from(map.keys()).sort();
    return { dates: sorted, countByDate: map, livePred: live };
  }, [matches, tz]);

  const today = todayKey();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Auto-centre today (or first upcoming) on mount / when dates change
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = value ?? (dates.includes(today) ? today : dates.find((d) => d >= today) ?? dates[0]);
    if (!target) return;
    const chip = el.querySelector<HTMLElement>(`[data-date="${target}"]`);
    if (chip) {
      const left = chip.offsetLeft - el.clientWidth / 2 + chip.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [dates, value, today]);

  if (dates.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 px-1 mb-2 flex-wrap">
        <CalendarDays className="size-3.5 text-amber-400" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-amber-400 uppercase">Match Schedule</span>
        <TimezonePicker compact />
        <span className="text-[9.5px] text-gray-500 hidden sm:inline">Tap to change</span>
        {value && (
          <button
            onClick={() => onChange(undefined)}
            className="ml-auto text-[10px] text-gray-500 hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Clear date
          </button>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 -mx-1 px-1
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`shrink-0 snap-start min-w-[64px] rounded-xl border px-3 py-2 text-center transition-all
            ${value === undefined
              ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
              : "border-gray-800 bg-gray-900/60 text-gray-400 hover:border-amber-500/40 hover:text-amber-300"}`}
        >
          <div className="text-[9px] font-bold tracking-wider opacity-80">ALL</div>
          <div className="text-base font-black leading-none mt-0.5">{matches.length}</div>
          <div className="text-[9px] mt-1 opacity-70">DATES</div>
        </button>

        {dates.map((d) => {
          const { weekday, day, month } = fmtChip(d);
          const active = value === d;
          const isToday = d === today;
          const isLive = livePred.has(d);
          const isPast = d < today;
          return (
            <button
              key={d}
              type="button"
              data-date={d}
              onClick={() => onChange(active ? undefined : d)}
              className={`relative shrink-0 snap-start min-w-[64px] rounded-xl border px-3 py-2 text-center transition-all
                ${active
                  ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                  : isToday
                    ? "border-amber-500/60 bg-amber-500/5 text-amber-200 hover:bg-amber-500/10"
                    : isPast
                      ? "border-gray-800 bg-gray-950/60 text-gray-500 hover:border-gray-700 hover:text-gray-300"
                      : "border-gray-800 bg-gray-900/60 text-gray-300 hover:border-amber-500/40 hover:text-amber-200"}`}
            >
              {isLive && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="absolute size-3 rounded-full bg-red-500/60 animate-ping" />
                  <span className="relative size-2 rounded-full bg-red-500" />
                </span>
              )}
              <div className={`text-[9px] font-bold tracking-wider ${active ? "" : "opacity-80"}`}>{weekday}</div>
              <div className="text-lg font-black leading-none mt-0.5">{day}</div>
              <div className="text-[9px] mt-0.5 opacity-70">{month}</div>
              <div className={`mt-1 flex items-center justify-center gap-0.5 text-[9px] font-bold
                ${active ? "text-amber-400" : "text-gray-500"}`}>
                <Dot className="size-2.5 -mx-1" />
                {countByDate.get(d)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function filterByDateKey(matches: WCMatch[], date: string | undefined): WCMatch[] {
  if (!date) return matches;
  return matches.filter((m) => dateKey(m.match_date) === date);
}
