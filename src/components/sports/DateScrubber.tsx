import { ChevronLeft, ChevronRight } from "lucide-react";

// Generates 7 days centered on `selected`.
function makeRange(selected: string): string[] {
  const d = parseYmd(selected);
  const days: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + i);
    days.push(toYmd(x));
  }
  return days;
}

export function toYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

export function parseYmd(s: string): Date {
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  return new Date(Date.UTC(y, m, d));
}

export function todayYmd(): string {
  return toYmd(new Date());
}

export function DateScrubber({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (ymd: string) => void;
}) {
  const days = makeRange(selected);
  const shift = (delta: number) => {
    const d = parseYmd(selected);
    d.setUTCDate(d.getUTCDate() + delta);
    onChange(toYmd(d));
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 -mx-1 px-1">
      <button
        onClick={() => shift(-1)}
        className="shrink-0 size-9 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 grid place-items-center text-gray-400 hover:text-white"
        aria-label="Previous day"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="flex gap-1 mx-1">
        {days.map((ymd) => {
          const d = parseYmd(ymd);
          const active = ymd === selected;
          const isToday = ymd === todayYmd();
          return (
            <button
              key={ymd}
              onClick={() => onChange(ymd)}
              className={`shrink-0 w-16 sm:w-20 rounded-lg px-2 py-1.5 text-center border transition-all ${
                active
                  ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700"
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80">
                {d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" })}
              </div>
              <div className="text-sm font-bold tabular-nums">
                {d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}
              </div>
              {isToday && !active && (
                <div className="text-[8px] uppercase tracking-wider text-amber-400 font-bold">Today</div>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => shift(1)}
        className="shrink-0 size-9 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 grid place-items-center text-gray-400 hover:text-white"
        aria-label="Next day"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
