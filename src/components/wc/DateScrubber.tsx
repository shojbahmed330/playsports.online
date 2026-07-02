import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { WCMatch } from "@/lib/supabase";
import { dateKeyInTz, fmtDateChip } from "@/lib/timezone";
import { TimezonePicker, useTimezone } from "./TimezonePicker";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

// YYYY-MM-DD in the *active timezone* so chips match what the user sees on
// each card. Re-keyed when the user switches timezone via useTimezone().
function dateKey(iso: string | null | undefined): string | null {
  return dateKeyInTz(iso);
}

function todayKey(): string {
  return dateKeyInTz(new Date())!;
}

function fmtChip(key: string): { weekday: string; day: string; month: string } {
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
  const tz = useTimezone();
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
  const [pickerOpen, setPickerOpen] = useState(false);


  if (dates.length === 0) return null;

  // Mobile helpers — navigate to prev/next date relative to current selection.
  const activeIdx = value ? dates.indexOf(value) : -1;
  const baseIdx = activeIdx >= 0
    ? activeIdx
    : (() => {
        const i = dates.indexOf(today);
        if (i >= 0) return i;
        const next = dates.findIndex((d) => d >= today);
        return next >= 0 ? next : 0;
      })();
  const prevDate = baseIdx > 0 ? dates[baseIdx - 1] : null;
  const nextDate = baseIdx < dates.length - 1 ? dates[baseIdx + 1] : null;
  const displayKey = value ?? dates[baseIdx];
  const display = fmtChip(displayKey);
  const isDisplayToday = displayKey === today;

  return (
    <div className={`relative ${className}`}>
      {/* Top label row */}
      <div className="flex items-center gap-2 px-1 mb-2 flex-wrap">
        <CalendarDays className="size-3.5 text-amber-400" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-amber-400 uppercase">Match Schedule</span>
        <TimezonePicker compact />
        {value && (
          <button
            onClick={() => onChange(undefined)}
            className="ml-auto text-[10px] text-gray-400 hover:text-amber-400 underline-offset-2 hover:underline transition-colors"
          >
            Clear date
          </button>
        )}
      </div>

      {/* ─────────────── MOBILE: prev / pill / next + quick chips ─────────────── */}
      <div className="sm:hidden">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-2">
          <button
            type="button"
            disabled={!prevDate}
            onClick={() => prevDate && onChange(prevDate)}
            className="flex items-center justify-center w-11 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-300 active:scale-95 transition disabled:opacity-30 disabled:active:scale-100"
            aria-label="Previous match day"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={`min-w-0 rounded-xl border px-3 py-2 text-left transition-all
              ${value
                ? "border-amber-500 bg-amber-500/15 shadow-[0_0_0_3px_rgba(245,158,11,0.10)]"
                : "border-gray-800 bg-gray-900/60"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className={`text-[9.5px] font-bold tracking-[0.18em] uppercase truncate
                  ${value ? "text-amber-300" : isDisplayToday ? "text-amber-300/90" : "text-gray-400"}`}>
                  {value ? display.weekday : isDisplayToday ? "Today" : display.weekday}
                  <span className="ml-1 opacity-60">· {display.month}</span>
                </div>
                <div className={`text-xl font-black leading-tight tabular-nums truncate
                  ${value ? "text-amber-200" : "text-white"}`}>
                  {display.day} <span className="text-[10px] font-bold tracking-wider opacity-60 align-middle ml-1">
                    {countByDate.get(displayKey) ?? 0} match{(countByDate.get(displayKey) ?? 0) === 1 ? "" : "es"}
                  </span>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-300">
                <CalendarDays className="size-3" />
                {value ? "Change" : "Pick"}
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={!nextDate}
            onClick={() => nextDate && onChange(nextDate)}
            className="flex items-center justify-center w-11 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-300 active:scale-95 transition disabled:opacity-30 disabled:active:scale-100"
            aria-label="Next match day"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Quick chips: All · Today · Live */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={`rounded-full px-2.5 py-1 border transition
              ${value === undefined
                ? "border-amber-500 bg-amber-500/15 text-amber-300"
                : "border-gray-800 bg-gray-900/60 text-gray-400 active:scale-95"}`}
          >
            All · {matches.length}
          </button>
          {dates.includes(today) && (
            <button
              type="button"
              onClick={() => onChange(today)}
              className={`rounded-full px-2.5 py-1 border transition
                ${value === today
                  ? "border-amber-500 bg-amber-500/15 text-amber-300"
                  : "border-amber-500/40 bg-amber-500/5 text-amber-200 active:scale-95"}`}
            >
              Today · {countByDate.get(today) ?? 0}
            </button>
          )}
          {livePred.size > 0 && (
            <button
              type="button"
              onClick={() => {
                const liveDate = Array.from(livePred).sort()[0];
                if (liveDate) onChange(liveDate);
              }}
              className="rounded-full px-2.5 py-1 border border-red-500/40 bg-red-500/10 text-red-300 active:scale-95 transition inline-flex items-center gap-1"
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute size-2.5 rounded-full bg-red-500/60 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-red-500" />
              </span>
              Live
            </button>
          )}
        </div>
      </div>

      {/* ─────────────── DESKTOP: stylish dropdown ─────────────── */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={!prevDate}
          onClick={() => prevDate && onChange(prevDate)}
          className="flex items-center justify-center h-11 w-9 rounded-xl border border-white/10 bg-gray-900/60 text-gray-300 hover:border-amber-500/40 hover:text-amber-300 transition disabled:opacity-30"
          aria-label="Previous match day"
        >
          <ChevronLeft className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={`group flex-1 max-w-md relative inline-flex items-center gap-3 rounded-xl border px-4 py-2 text-left transition-all shadow-lg
              ${value
                ? "border-amber-500 bg-gradient-to-r from-amber-500/20 to-orange-500/10 shadow-amber-500/20"
                : "border-white/10 bg-gray-900/70 hover:border-amber-500/40"}`}
          >
            <CalendarDays className={`size-5 shrink-0 ${value || isDisplayToday ? "text-amber-300" : "text-gray-400"}`} />
            <div className="min-w-0 flex-1">
              <div className={`text-[10px] font-bold tracking-[0.18em] uppercase truncate
                ${value ? "text-amber-300" : isDisplayToday ? "text-amber-300/90" : "text-gray-400"}`}>
                {value ? display.weekday : isDisplayToday ? "Today" : display.weekday}
                <span className="ml-1 opacity-60">· {display.month}</span>
              </div>
              <div className={`text-xl font-black leading-tight tabular-nums truncate flex items-baseline gap-2
                ${value ? "text-amber-200" : "text-white"}`}>
                {display.day}
                <span className="text-[11px] font-bold tracking-wider opacity-60">
                  {countByDate.get(displayKey) ?? 0} match{(countByDate.get(displayKey) ?? 0) === 1 ? "" : "es"}
                </span>
              </div>
            </div>
            {livePred.size > 0 && (
              <span className="relative inline-flex items-center justify-center shrink-0">
                <span className="absolute size-3 rounded-full bg-red-500/60 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-red-500 ring-2 ring-black" />
              </span>
            )}
            <ChevronDown className="size-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            sideOffset={8}
            className="w-[min(90vw,540px)] max-h-[70vh] overflow-y-auto border-white/10 bg-gray-950/95 backdrop-blur-xl p-3 shadow-2xl shadow-black/60"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Pick a match day</span>
              <span className="text-[10px] text-gray-500 tabular-nums">{dates.length} days · {matches.length} matches</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className={`rounded-xl border p-2 text-center transition
                  ${value === undefined
                    ? "border-amber-500 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-gray-900/60 text-gray-300 hover:border-amber-500/40"}`}
              >
                <div className="text-[9px] font-bold tracking-wider opacity-80">ALL</div>
                <div className="text-base font-black leading-tight mt-0.5">{matches.length}</div>
                <div className="text-[9px] opacity-60">dates</div>
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
                    onClick={() => onChange(d)}
                    className={`relative rounded-xl border p-2 text-center transition
                      ${active
                        ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_0_2px_rgba(245,158,11,0.15)]"
                        : isToday
                          ? "border-amber-500/60 bg-amber-500/5 text-amber-200 hover:bg-amber-500/10"
                          : isPast
                            ? "border-white/5 bg-gray-950/60 text-gray-500 hover:border-white/10 hover:text-gray-300"
                            : "border-white/10 bg-gray-900/60 text-gray-300 hover:border-amber-500/40 hover:text-amber-200"}`}
                  >
                    {isLive && (
                      <span className="absolute top-1 right-1 flex items-center justify-center">
                        <span className="absolute size-2.5 rounded-full bg-red-500/60 animate-ping" />
                        <span className="relative size-1.5 rounded-full bg-red-500" />
                      </span>
                    )}
                    <div className="text-[9px] font-bold tracking-wider opacity-80">{weekday}</div>
                    <div className="text-lg font-black leading-tight mt-0.5 tabular-nums">{day}</div>
                    <div className="text-[9px] opacity-60">{month}</div>
                    <div className="text-[9px] font-bold opacity-70 mt-0.5">{countByDate.get(d)}m</div>
                  </button>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          disabled={!nextDate}
          onClick={() => nextDate && onChange(nextDate)}
          className="flex items-center justify-center h-11 w-9 rounded-xl border border-white/10 bg-gray-900/60 text-gray-300 hover:border-amber-500/40 hover:text-amber-300 transition disabled:opacity-30"
          aria-label="Next match day"
        >
          <ChevronRight className="size-4" />
        </button>

        {dates.includes(today) && (
          <button
            type="button"
            onClick={() => onChange(today)}
            className={`h-11 shrink-0 rounded-xl px-3 border text-[11px] font-bold uppercase tracking-widest transition
              ${value === today
                ? "border-amber-500 bg-amber-500/15 text-amber-300"
                : "border-amber-500/40 bg-amber-500/5 text-amber-200 hover:bg-amber-500/10"}`}
          >
            Today · {countByDate.get(today) ?? 0}
          </button>
        )}
      </div>


      {/* ─────────────── MOBILE: full-screen date picker sheet ─────────────── */}
      {pickerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-end animate-in fade-in duration-150"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-h-[80vh] rounded-t-2xl border-t border-amber-500/30 bg-gray-950 p-4 overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">Pick a match day</h3>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="rounded-full p-1.5 bg-gray-900 border border-gray-800 text-gray-400 active:scale-95"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { onChange(undefined); setPickerOpen(false); }}
                className={`rounded-xl border p-3 text-center transition
                  ${value === undefined
                    ? "border-amber-500 bg-amber-500/15 text-amber-300"
                    : "border-gray-800 bg-gray-900/60 text-gray-300"}`}
              >
                <div className="text-[9px] font-bold tracking-wider opacity-80">ALL</div>
                <div className="text-lg font-black leading-tight mt-0.5">{matches.length}</div>
                <div className="text-[9px] mt-0.5 opacity-60">dates</div>
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
                    onClick={() => { onChange(d); setPickerOpen(false); }}
                    className={`relative rounded-xl border p-3 text-center transition
                      ${active
                        ? "border-amber-500 bg-amber-500/15 text-amber-300"
                        : isToday
                          ? "border-amber-500/60 bg-amber-500/5 text-amber-200"
                          : isPast
                            ? "border-gray-800 bg-gray-950/60 text-gray-500"
                            : "border-gray-800 bg-gray-900/60 text-gray-300"}`}
                  >
                    {isLive && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center">
                        <span className="absolute size-2.5 rounded-full bg-red-500/60 animate-ping" />
                        <span className="relative size-1.5 rounded-full bg-red-500" />
                      </span>
                    )}
                    <div className="text-[9px] font-bold tracking-wider opacity-80">{weekday}</div>
                    <div className="text-lg font-black leading-tight mt-0.5 tabular-nums">{day}</div>
                    <div className="text-[9px] opacity-60">{month}</div>
                    <div className="mt-1 text-[9px] font-bold opacity-70">{countByDate.get(d)} match{countByDate.get(d) === 1 ? "" : "es"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function filterByDateKey(matches: WCMatch[], date: string | undefined): WCMatch[] {
  if (!date) return matches;
  return matches.filter((m) => dateKey(m.match_date) === date);
}

