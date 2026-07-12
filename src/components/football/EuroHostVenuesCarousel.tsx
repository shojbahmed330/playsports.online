import { MapPin } from "lucide-react";
import { EURO_2028_VENUES } from "@/data/euro2028_venues";

/**
 * Evergreen host-venues carousel for the fixtures page. Horizontal snap
 * on mobile, 3-column grid on desktop.
 */
export function EuroHostVenuesCarousel() {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        <MapPin className="size-3.5" /> 10 host venues · UK &amp; Ireland
      </div>
      <ul className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {EURO_2028_VENUES.map((v) => (
          <li
            key={v.stadium}
            className="snap-start shrink-0 w-[75vw] max-w-[280px] sm:w-auto sm:max-w-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/25 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none shrink-0" aria-hidden>{v.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">{v.stadium}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {v.city} · {v.country}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Capacity</span>
              <span className="tabular-nums font-bold text-foreground">
                {v.capacity.toLocaleString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
