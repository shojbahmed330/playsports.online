import { useEffect, useRef } from "react";
import { WC_YEARS } from "@/lib/supabase";

/**
 * Horizontal year picker with snap-scroll. Highlights selected year and
 * shows a 🔴 LIVE pulse on 2026 (current tournament).
 */
export function YearStrip({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const years = WC_YEARS.slice().reverse(); // newest first

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-year="${year}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [year]);

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Tournament year"
      className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-4 pb-2 -mx-4 scrollbar-thin"
      style={{ scrollbarWidth: "thin" }}
    >
      {years.map((y) => {
        const active = y === year;
        const isCurrent = y === 2026;
        return (
          <button
            key={y}
            data-year={y}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(y)}
            className={`relative shrink-0 snap-center min-w-[84px] sm:min-w-[96px] px-4 py-2.5 rounded-xl text-sm font-bold tabular-nums transition-all ${
              active
                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-[1.04]"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/40"
            }`}
          >
            {y}
            {isCurrent && !active && (
              <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
            )}
            {isCurrent && active && (
              <span className="absolute -top-1 right-1 text-[8px] font-black bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none animate-pulse">
                LIVE
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
