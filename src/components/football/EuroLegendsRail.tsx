import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

/**
 * Four curated Euro-legend cards linking into player pages.
 * Uses ESPN headshots where the player has an ESPN id; otherwise generic
 * ui-avatars fallback (Platini / Van Basten are pre-ESPN era).
 */

type Legend = {
  name: string;
  playerId?: string; // ESPN athlete id (present → deep link works)
  tally: string;
  years: string;
  image?: string;
};

const LEGENDS: Legend[] = [
  {
    name: "Cristiano Ronaldo",
    playerId: "44877",
    tally: "14 goals · 30 apps",
    years: "Portugal · 2004–2024",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/44877.png",
  },
  {
    name: "Antoine Griezmann",
    playerId: "150211",
    tally: "7 goals · 21 apps",
    years: "France · 2016–2024",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/150211.png",
  },
  {
    name: "Michel Platini",
    tally: "9 goals in 5 games",
    years: "France · Euro 1984 (record)",
  },
  {
    name: "Marco van Basten",
    tally: "5 goals · Final volley",
    years: "Netherlands · Euro 1988",
  },
];

export function EuroLegendsRail() {
  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Star className="size-4" /> Euro Legends
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
                className="size-12 rounded-full object-cover bg-white/10 ring-1 ring-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">{l.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{l.years}</div>
                <div className="text-[11px] font-semibold text-amber-200 truncate">{l.tally}</div>
              </div>
            </>
          );
          const className =
            "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 hover:border-white/25 hover:bg-white/[0.06] transition";
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
    </section>
  );
}
