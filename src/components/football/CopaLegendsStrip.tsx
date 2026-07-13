import { Star } from "lucide-react";
import { COPA_LEGENDS } from "@/lib/copa-history";

/** Snap-rail of Copa legends with headshots + tallies. */
export function CopaLegendsStrip() {
  return (
    <section id="legends" className="mt-8 sm:mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <Star className="size-4 text-amber-300" /> Copa legends
        </h2>
        <span className="text-[11px] text-muted-foreground">{COPA_LEGENDS.length} icons</span>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <ul className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {COPA_LEGENDS.map((l) => (
            <li
              key={l.name}
              className="snap-start shrink-0 w-[200px] sm:w-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-rose-500/10 grid place-items-center">
                {l.image ? (
                  <img
                    src={l.image}
                    alt={l.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) = decoding="async"> { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span className="text-4xl" aria-hidden>⭐</span>
                )}
              </div>
              <div className="mt-2 text-sm font-black truncate">{l.name}</div>
              <div className="mt-0.5 text-[11px] text-amber-200 truncate">{l.tally}</div>
              <div className="text-[10px] text-muted-foreground truncate">{l.years}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
