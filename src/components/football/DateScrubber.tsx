import { useMemo, useRef } from "react";
import { CalendarDays } from "lucide-react";

/**
 * Compact date scrubber for the scores page. Renders a ±7 day strip around
 * the selected day and reports selection back as a Date. Includes a
 * "jump to date" native picker for leaping to historical matches.
 */
export function DateScrubber({
  value,
  onChange,
  windowDays = 7,
}: {
  value: Date;
  onChange: (d: Date) => void;
  windowDays?: number;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const days = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date(value);
    base.setHours(0, 0, 0, 0);
    for (let i = -windowDays; i <= windowDays; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [value, windowDays]);

  const key = (d: Date) => d.toISOString().slice(0, 10);
  const selectedKey = key(value);
  const monthLabel = value.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground min-w-0">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">{monthLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = pickerRef.current;
            if (!el) return;
            // Try native picker on supported browsers, else focus.
            if (typeof (el as any).showPicker === "function") {
              try { (el as any).showPicker(); return; } catch { /* fall through */ }
            }
            el.focus();
            el.click();
          }}
          className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/25 rounded-full px-2.5 py-1 transition"
        >
          Jump to date
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={key(value)}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split("-").map(Number);
            onChange(new Date(y, m - 1, d));
          }}
          className="sr-only"
          aria-label="Jump to date"
        />
      </div>
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
        {days.map((d) => {
          const active = key(d) === selectedKey;
          const today = key(d) === key(new Date());
          return (
            <button
              key={key(d)}
              type="button"
              onClick={() => onChange(d)}
              className={`snap-center shrink-0 rounded-xl border px-3 py-2 text-center transition min-w-[60px] tap-target ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest opacity-80">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div className="text-base font-black tabular-nums leading-tight">
                {d.getDate()}
              </div>
              <div className={`text-[9px] uppercase tracking-widest ${today && !active ? "text-primary font-bold" : "opacity-70"}`}>
                {today ? "Today" : d.toLocaleDateString(undefined, { month: "short" })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
