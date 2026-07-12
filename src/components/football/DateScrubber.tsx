import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

/**
 * Compact date scrubber for the scores page. Renders a ±7 day strip around
 * the selected day and reports selection back as YYYY-MM-DD.
 */
export function DateScrubber({
  value,
  onChange,
  windowDays = 7,
}: {
  /** Selected day (Date object) */
  value: Date;
  onChange: (d: Date) => void;
  windowDays?: number;
}) {
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

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        <CalendarDays className="size-3.5" /> Date
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
        {days.map((d) => {
          const active = key(d) === selectedKey;
          return (
            <button
              key={key(d)}
              type="button"
              onClick={() => onChange(d)}
              className={`snap-start shrink-0 rounded-xl border px-3 py-2 text-center transition min-w-[64px] ${
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
              <div className="text-[10px] opacity-70">
                {d.toLocaleDateString(undefined, { month: "short" })}
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
