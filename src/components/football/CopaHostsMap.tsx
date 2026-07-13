import { MapPin, Star } from "lucide-react";
import { copaFlag, getCopaEditions } from "@/lib/copa-history";

type HostRow = { host: string; flag: string; years: number[] };

function buildHosts(): HostRow[] {
  const map = new Map<string, number[]>();
  for (const e of getCopaEditions()) {
    if (!e.host) continue;
    const arr = map.get(e.host) ?? [];
    arr.push(e.year);
    map.set(e.host, arr);
  }
  return Array.from(map.entries())
    .map(([host, years]) => ({ host, flag: copaFlag(host.split(" / ")[0]), years: years.sort((a, b) => a - b) }))
    .sort((a, b) => b.years.length - a.years.length);
}

/** Horizontal strip of every Copa América host. */
export function CopaHostsMap() {
  const hosts = buildHosts();

  return (
    <section className="mt-10 scroll-mt-32" id="hosts">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <MapPin className="size-4" /> Where the Copa goes
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
              className="snap-start shrink-0 w-[170px] rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="text-2xl leading-none" aria-hidden>{h.flag}</div>
              <div className="mt-2 flex items-center gap-2 min-w-0">
                <div className="text-sm font-bold truncate flex-1 min-w-0">{h.host}</div>
                <span className="shrink-0 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                  ×{h.years.length}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums truncate">
                {h.years.slice(-4).join(", ")}
              </div>
            </li>
          ))}
          <li className="snap-start shrink-0 w-[180px] rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-transparent p-3">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Star className="size-3" /> Next up
            </div>
            <div className="mt-1 text-2xl leading-none" aria-hidden>🌎</div>
            <div className="mt-2 text-sm font-black truncate">Copa 2028</div>
            <div className="mt-0.5 text-[11px] text-amber-100/80 tabular-nums">Host TBC</div>
          </li>
        </ul>
      </div>
    </section>
  );
}
