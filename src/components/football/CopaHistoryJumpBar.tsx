import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { editionsByDecade } from "@/lib/competition-history";

/** Mobile-only sticky bottom bar for /football/copa-america/history decades. */
export function CopaHistoryJumpBar() {
  const decades = editionsByDecade("copa-america").map((d) => d.decade).sort((a, b) => a - b);
  const currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
  const [active, setActive] = useState<number>(
    decades.includes(currentDecade) ? currentDecade : (decades[decades.length - 1] ?? currentDecade),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];
    decades.forEach((d) => {
      const el = document.getElementById(`decade-${d}`);
      if (!el) return;
      const o = new IntersectionObserver(
        (entries) => { for (const e of entries) if (e.isIntersecting) setActive(d); },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [decades]);

  function jump(dir: -1 | 0 | 1) {
    const idx = decades.indexOf(active);
    const target =
      dir === 0
        ? decades.includes(currentDecade) ? currentDecade : decades[decades.length - 1]
        : decades[Math.max(0, Math.min(decades.length - 1, idx + dir))];
    const el = document.getElementById(`decade-${target}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const prevIdx = decades.indexOf(active) - 1;
  const nextIdx = decades.indexOf(active) + 1;
  const prevLabel = prevIdx >= 0 ? `${decades[prevIdx]}s` : "—";
  const nextLabel = nextIdx < decades.length ? `${decades[nextIdx]}s` : "—";

  return (
    <div
      className="sm:hidden fixed bottom-3 left-3 right-3 z-30 rounded-full border border-white/10 bg-gray-950/90 backdrop-blur shadow-2xl"
      role="navigation"
      aria-label="Jump between decades"
    >
      <div className="flex items-center gap-1 p-1">
        <button
          type="button"
          onClick={() => jump(-1)}
          disabled={prevIdx < 0}
          className="tap-target flex-1 inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-bold text-muted-foreground disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> {prevLabel}
        </button>
        <button
          type="button"
          onClick={() => jump(0)}
          className="tap-target inline-flex items-center gap-1 rounded-full bg-amber-500/20 ring-1 ring-amber-400/30 px-3 py-2 text-xs font-bold text-amber-100"
        >
          <Calendar className="size-4" /> {active}s
        </button>
        <button
          type="button"
          onClick={() => jump(1)}
          disabled={nextIdx >= decades.length}
          className="tap-target flex-1 inline-flex items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-bold text-muted-foreground disabled:opacity-40"
        >
          {nextLabel} <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
