import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

/**
 * Mobile-only sticky bottom bar for jumping prev / today / next day.
 * Uses 44px tap targets and clears the global mobile tab bar.
 */
export function ScoresJumpBar({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const shift = (delta: number) => {
    const d = new Date(value);
    d.setDate(d.getDate() + delta);
    onChange(d);
  };
  const today = new Date();
  const isToday = value.toDateString() === today.toDateString();

  return (
    <div className="sm:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/15 bg-background/95 backdrop-blur px-1 py-1 shadow-2xl">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="grid place-items-center size-11 rounded-full hover:bg-white/10 active:bg-white/15 transition"
          aria-label="Previous day"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onChange(new Date())}
          disabled={isToday}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 h-11 text-xs font-bold uppercase tracking-widest transition ${
            isToday
              ? "text-muted-foreground opacity-60"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <CalendarDays className="size-3.5" />
          Today
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="grid place-items-center size-11 rounded-full hover:bg-white/10 active:bg-white/15 transition"
          aria-label="Next day"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
