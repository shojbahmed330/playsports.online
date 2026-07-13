/**
 * Curated player data for `/football/euro/players`: rising stars +
 * unified search index across leaderboards and 2024 squad-of-tournament.
 */

import { getEdition } from "@/data/competition-editions";
import { EURO_TOP_SCORERS, EURO_MOST_APPEARANCES } from "@/lib/euro-records";

export type RisingStar = {
  name: string;
  playerId?: string;
  nation: string;
  club: string;
  position: string;
  euroDebut: number;
  headline: string;
  image?: string;
};

export const EURO_RISING_STARS: RisingStar[] = [
  {
    name: "Lamine Yamal",
    playerId: "352697",
    nation: "Spain",
    club: "Barcelona",
    position: "RW",
    euroDebut: 2024,
    headline: "16y 362d — youngest Euro scorer ever",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/352697.png",
  },
  {
    name: "Jamal Musiala",
    playerId: "252221",
    nation: "Germany",
    club: "Bayern Munich",
    position: "AM",
    euroDebut: 2024,
    headline: "3 goals · Germany's creative heartbeat",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/252221.png",
  },
  {
    name: "Florian Wirtz",
    playerId: "254495",
    nation: "Germany",
    club: "Liverpool",
    position: "AM",
    euroDebut: 2024,
    headline: "8-second goal vs Scotland — fastest in Euro history",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/254495.png",
  },
  {
    name: "Arda Güler",
    playerId: "355687",
    nation: "Turkey",
    club: "Real Madrid",
    position: "AM",
    euroDebut: 2024,
    headline: "Curling debut goal at 19 — Turkey's new no. 10",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/355687.png",
  },
];

export type PlayerSearchHit = {
  name: string;
  detail: string;
  playerId?: string;
};

/** Unified search index — top scorers + appearances + 2024 squad + rising stars. */
export function euroPlayerSearchIndex(): PlayerSearchHit[] {
  const hits: PlayerSearchHit[] = [];
  for (const r of EURO_TOP_SCORERS) {
    hits.push({ name: r.name, detail: `${r.nation} · ${r.value} goals` });
  }
  for (const r of EURO_MOST_APPEARANCES) {
    if (!hits.some((h) => h.name === r.name)) {
      hits.push({ name: r.name, detail: `${r.nation} · ${r.value} apps` });
    }
  }
  const squad = getEdition("euro", 2024)?.squadOfTournament ?? [];
  for (const p of squad) {
    if (!hits.some((h) => h.name === p.name)) {
      hits.push({ name: p.name, detail: `${p.team ?? ""} · Euro 2024 XI` });
    }
  }
  for (const s of EURO_RISING_STARS) {
    if (!hits.some((h) => h.name === s.name)) {
      hits.push({ name: s.name, detail: `${s.nation} · Rising star`, playerId: s.playerId });
    }
  }
  return hits;
}
