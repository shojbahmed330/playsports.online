import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

/**
 * Six curated Euro-legend cards. Horizontal snap scroller on mobile,
 * 3-column grid ≥ sm. Uses ESPN headshots where an athlete id exists.
 */

type Legend = {
  name: string;
  playerId?: string;
  tally: string;
  years: string;
  decade: string;
  image?: string;
};

const LEGENDS: Legend[] = [
  {
    name: "Cristiano Ronaldo",
    playerId: "44877",
    tally: "14 goals · 30 apps",
    years: "Portugal · 2004–2024",
    decade: "2004→",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/44877.png",
  },
  {
    name: "Antoine Griezmann",
    playerId: "150211",
    tally: "7 goals · 21 apps",
    years: "France · 2016–2024",
    decade: "2010s",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/150211.png",
  },
  {
    name: "Fernando Torres",
    tally: "5 Euro goals · 2 titles",
    years: "Spain · 2004–2012",
    decade: "2000s–2010s",
  },
  {
    name: "Alan Shearer",
    tally: "7 Euro goals",
    years: "England · 1992–2000",
    decade: "1990s",
  },
  {
    name: "Michel Platini",
    tally: "9 goals in 5 games",
    years: "France · Euro 1984 (record)",
    decade: "1984",
  },
  {
    name: "Marco van Basten",
    tally: "5 goals · Final volley",
    years: "Netherlands · Euro 1988",
    decade: "1988",
  },
];

export function EuroLegendsRail() {
  return (
    <section id="legends" className="mt-8 sm:mt-10 scroll-mt-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Star className="size-4" /> Euro Legends
      </h3>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {LEGENDS.map((l) => {
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=0b1220&color=fff&bold=true&size=96`;
            const body = (
              <>
                <img
                  src={l.image ?? fallback}
                  alt={l.name}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== fallback) img.src = fallback;
                  }}
                  className="size-14 rounded-full object-cover bg-white/10 ring-1 ring-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold truncate">{l.name}</div>
                    <span className="shrink-0 text-[9px] uppercase tracking-widest rounded-full bg-white/10 text-muted-foreground px-1.5 py-0.5">
                      {l.decade}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.years}</div>
                  <div className="text-[11px] font-semibold text-amber-200 truncate">{l.tally}</div>
                </div>
              </>
            );
            const className =
              "snap-start shrink-0 w-[76vw] max-w-[300px] sm:w-auto sm:max-w-none flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-300/40 hover:bg-amber-500/[0.06] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.15)] transition px-3 py-2.5";
            return l.playerId ? (
              <Link
                key={l.name}
                to="/football/$comp/players/$playerId"
                params={{ comp: "euro", playerId: l.playerId }}
                className={className}
              >
                {body}
              </Link>
            ) : (
              <div key={l.name} className={className}>{body}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
