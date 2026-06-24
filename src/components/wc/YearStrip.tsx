import { useEffect, useRef } from "react";
import { WC_YEARS } from "@/lib/supabase";
import { YearTile } from "./YearTile";

/**
 * Horizontal year picker with snap-scroll. Each tile shows the champion's flag
 * and an abbreviated badge. 2026 carries a 🔴 LIVE pulse.
 */
export function YearStrip({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const years = WC_YEARS.slice().reverse();

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
      {years.map((y) => (
        <YearTile
          key={y}
          year={y}
          active={y === year}
          isCurrent={y === 2026}
          onClick={() => onChange(y)}
        />
      ))}
    </div>
  );
}
