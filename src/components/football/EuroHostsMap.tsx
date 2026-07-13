import { MapPin, Star } from "lucide-react";
import { euroHostsList } from "@/lib/euro-history";

/**
 * Horizontal strip of every past Euro host with the year(s) they hosted,
 * highlighting the upcoming 2028 UK & Ireland edition. No map lib.
 */
export function EuroHostsMap() {
  const hosts = euroHostsList();
  const upcoming = { host: "UK & Ireland", years: [2028], flag: "🇬🇧" };

  return (
    <section className="mt-10 scroll-mt-32" id="hosts">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <MapPin className="size-4" /> Where the Euros go
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {hosts.length + 1} host{hosts.length ? "s" : ""}
        </span>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <ul className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {hosts.map((h) => (
            <li
              key={h.host}
              className="snap-start shrink-0 w-[160px] rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="text-2xl leading-none" aria-hidden>{h.flag}</div>
              <div className="mt-2 text-sm font-bold truncate">{h.host}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                {h.years.join(", ")}
              </div>
            </li>
          ))}
          <li className="snap-start shrink-0 w-[180px] rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-transparent p-3">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Star className="size-3" /> Next up
            </div>
            <div className="mt-1 text-2xl leading-none" aria-hidden>{upcoming.flag}</div>
            <div className="mt-2 text-sm font-black truncate">{upcoming.host}</div>
            <div className="mt-0.5 text-[11px] text-amber-100/80 tabular-nums">2028</div>
          </li>
        </ul>
      </div>
    </section>
  );
}
