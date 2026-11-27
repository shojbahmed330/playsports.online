import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { WCMatch } from "@/lib/supabase";
import { dateKeyInTz } from "@/lib/timezone";
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

const WEEKDAY_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const DAY_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const MONTH_FMT = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

/**
 * Format a `YYYY-MM-DD` key with UTC getters. The key already represents the
 * viewer's local day, so formatting it in UTC keeps the same Y/M/D and makes
 * SSR and client output identical (the old local-noon formatter could shift a
 * day across timezones).
 */
function fmtChip(key: string): { weekday: string; day: string; month: string } {
  const [y, m, d] = key.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return {
    weekday: WEEKDAY_FMT.format(noon),
    day: DAY_FMT.format(noon),
    month: MONTH_FMT.format(noon),
  };
}

export interface DateScrubberProps {
  matches: WCMatch[];
  value: string | undefined; // YYYY-MM-DD or undefined = All dates
  onChange: (next: string | undefined) => void;
  className?: string;
}

export function DateScrubber({ matches, value, onChange, className = "" }: DateScrubberProps) {
  const tz = useTimezone();
  const [mounted, setMounted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => setMounted(true), []);

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

  // Dates are viewer-local. Rendering the strip on the server would use the
  // server timezone and mismatch on hydration, so hold a same-size slot until
  // the client mount.
  if (!mounted) {
    return <div className={`relative ${className} h-[76px]`} aria-hidden="true" />;
  }

  if (dates.length === 0) return null;

  const today = todayKey();
  const activeIdx = value ? dates.indexOf(value) : -1;
  const baseIdx =
    activeIdx >= 0
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

  const allCount = matches.length;
  const todayCount = countByDate.get(today) ?? 0;
  const liveDate = Array.from(livePred).sort()[0];

  return (
    <div className={`relative ${className}`}>
      {/* Top label row */}
      <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
        <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
        <span className="text-micro uppercase text-primary">Match Schedule</span>
        <TimezonePicker compact />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="ml-auto inline-flex min-h-11 items-center text-micro text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="flex min-h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors active:scale-95 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Previous match day"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={`min-w-0 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${value ? "border-primary bg-primary/15" : "border-border bg-card"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className={`truncate text-micro uppercase ${value ? "text-primary" : isDisplayToday ? "text-primary/90" : "text-muted-foreground"}`}>
                  {value ? display.weekday : isDisplayToday ? "Today" : display.weekday}
                  <span className="ml-1 opacity-60">· {display.month}</span>
                </div>
                <div className={`truncate text-xl font-black leading-tight tabular-nums ${value ? "text-foreground" : "text-foreground"}`}>
                  {display.day}{" "}
                  <span className="ml-1 align-middle text-micro font-bold tracking-wider text-muted-foreground">
                    {countByDate.get(displayKey) ?? 0} match{(countByDate.get(displayKey) ?? 0) === 1 ? "" : "es"}
                  </span>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-micro font-bold uppercase text-muted-foreground">
                <CalendarDays className="size-3" aria-hidden="true" />
                {value ? "Change" : "Pick"}
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={!nextDate}
            onClick={() => nextDate && onChange(nextDate)}
            className="flex min-h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors active:scale-95 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Next match day"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Quick chips: All · Today · Live */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Chip active={value === undefined} onClick={() => onChange(undefined)}>
            All · {allCount}
          </Chip>
          {dates.includes(today) && (
            <Chip active={value === today} onClick={() => onChange(today)}>
              Today · {todayCount}
            </Chip>
          )}
          {liveDate && (
            <button
              type="button"
              onClick={() => onChange(liveDate)}
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-live/40 bg-live/10 px-2.5 text-micro font-bold uppercase text-live transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="relative flex items-center justify-center" aria-hidden="true">
                <span className="absolute size-2.5 animate-ping rounded-full bg-live/60 motion-reduce:animate-none" />
                <span className="relative size-1.5 rounded-full bg-live" />
              </span>
              Live
            </button>
          )}
        </div>
      </div>

      {/* ─────────────── DESKTOP: dropdown ─────────────── */}
      <div className="hidden items-center justify-center gap-2 sm:flex">
        <button
          type="button"
          disabled={!prevDate}
          onClick={() => prevDate && onChange(prevDate)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous match day"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={`group relative inline-flex max-w-md flex-1 items-center gap-3 rounded-xl border px-4 py-2 text-left shadow-[var(--shadow-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${value ? "border-primary bg-primary/15" : "border-border bg-card hover:border-primary/40"}`}
          >
            <CalendarDays className={`size-5 shrink-0 ${value || isDisplayToday ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className={`truncate text-micro uppercase ${value ? "text-primary" : isDisplayToday ? "text-primary/90" : "text-muted-foreground"}`}>
                {value ? display.weekday : isDisplayToday ? "Today" : display.weekday}
                <span className="ml-1 opacity-60">· {display.month}</span>
              </div>
              <div className="flex items-baseline gap-2 truncate text-xl font-black leading-tight tabular-nums text-foreground">
                {display.day}
                <span className="text-micro font-bold tracking-wider text-muted-foreground">
                  {countByDate.get(displayKey) ?? 0} match{(countByDate.get(displayKey) ?? 0) === 1 ? "" : "es"}
                </span>
              </div>
            </div>
            {livePred.size > 0 && (
              <span className="relative inline-flex shrink-0 items-center justify-center" aria-hidden="true">
                <span className="absolute size-3 animate-ping rounded-full bg-live/60 motion-reduce:animate-none" />
                <span className="relative size-1.5 rounded-full bg-live ring-2 ring-background" />
              </span>
            )}
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            sideOffset={8}
            className="max-h-[70vh] w-[min(90vw,540px)] overflow-y-auto border-border bg-background/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-micro uppercase text-primary">Pick a match day</span>
              <span className="text-micro tabular-nums text-muted-foreground">{dates.length} days · {matches.length} matches</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <DayCell
                active={value === undefined}
                onClick={() => onChange(undefined)}
                top="ALL"
                day={String(matches.length)}
                bottom="dates"
              />
              {dates.map((d) => (
                <DayCell
                  key={d}
                  date={d}
                  active={value === d}
                  today={d === today}
                  past={d < today}
                  live={livePred.has(d)}
                  count={countByDate.get(d) ?? 0}
                  onClick={() => onChange(d)}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          disabled={!nextDate}
          onClick={() => nextDate && onChange(nextDate)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next match day"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>

        {dates.includes(today) && (
          <button
            type="button"
            onClick={() => onChange(today)}
            className={`h-11 shrink-0 rounded-xl border px-3 text-micro font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${value === today
                ? "border-primary bg-primary/15 text-primary"
                : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"}`}
          >
            Today · {todayCount}
          </button>
        )}
      </div>

      {/* ─────────────── MOBILE: full-screen date picker sheet ─────────────── */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-background/70 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none sm:hidden">
          <button
            type="button"
            aria-label="Close date picker"
            tabIndex={-1}
            className="absolute inset-0 cursor-default"
            onClick={() => setPickerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pick a match day"
            className="relative max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border-t border-primary/30 bg-background p-4 animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                <h3 className="text-caption font-bold uppercase text-primary">Pick a match day</h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="grid size-11 place-items-center rounded-full border border-border bg-card text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close date picker"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <DayCell
                active={value === undefined}
                onClick={() => {
                  onChange(undefined);
                  setPickerOpen(false);
                }}
                top="ALL"
                day={String(matches.length)}
                bottom="dates"
                big
              />
              {dates.map((d) => (
                <DayCell
                  key={d}
                  date={d}
                  active={value === d}
                  today={d === today}
                  past={d < today}
                  live={livePred.has(d)}
                  count={countByDate.get(d) ?? 0}
                  big
                  onClick={() => {
                    onChange(d);
                    setPickerOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center rounded-full border px-2.5 text-micro font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DayCell({
  date,
  active,
  today = false,
  past = false,
  live = false,
  count,
  top,
  day,
  bottom,
  big = false,
  onClick,
}: {
  date?: string;
  active: boolean;
  today?: boolean;
  past?: boolean;
  live?: boolean;
  count?: number;
  top?: string;
  day?: string;
  bottom?: string;
  big?: boolean;
  onClick: () => void;
}) {
  const chip = date ? fmtChip(date) : null;
  const weekday = top ?? chip?.weekday ?? "";
  const dayLabel = day ?? chip?.day ?? "";
  const monthLabel = bottom ?? chip?.month ?? "";
  return (
    <button
      type="button"
      data-date={date}
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${big ? "p-3" : "p-2"} ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : today
            ? "border-primary/60 bg-primary/5 text-foreground"
            : past
              ? "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
              : "border-border bg-card text-foreground hover:border-primary/40"
      }`}
    >
      {live && (
        <span className="absolute right-1 top-1 flex items-center justify-center" aria-hidden="true">
          <span className="absolute size-2.5 animate-ping rounded-full bg-live/60 motion-reduce:animate-none" />
          <span className="relative size-1.5 rounded-full bg-live" />
        </span>
      )}
      <div className="text-micro font-bold tracking-wider opacity-80">{weekday}</div>
      <div className={`${big ? "text-lg" : "text-base"} mt-0.5 font-black leading-tight tabular-nums`}>{dayLabel}</div>
      <div className="text-micro opacity-60">{monthLabel}</div>
      {count != null && (
        <div className="mt-0.5 text-micro font-bold opacity-70">
          {big ? `${count} match${count === 1 ? "" : "es"}` : `${count}m`}
        </div>
      )}
    </button>
  );
}

export function filterByDateKey(matches: WCMatch[], date: string | undefined): WCMatch[] {
  if (!date) return matches;
  return matches.filter((m) => dateKey(m.match_date) === date);
}
