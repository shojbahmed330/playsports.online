/**
 * Curated Copa América 2024 group tables + knockout bracket.
 * Static data — ESPN's feed does not return historical group tables reliably.
 * Sources: CONMEBOL final tables, Copa América 2024 official records.
 */

export type Copa2024GroupRow = {
  team: string;
  flag: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  qualified?: boolean;
};

export type Copa2024Group = {
  group: "A" | "B" | "C" | "D";
  rows: Copa2024GroupRow[];
};

export const COPA_2024_GROUPS: Copa2024Group[] = [
  {
    group: "A",
    rows: [
      { team: "Argentina", flag: "🇦🇷", p: 3, w: 3, d: 0, l: 0, gf: 6, ga: 0, gd: 6, pts: 9, qualified: true },
      { team: "Canada",    flag: "🇨🇦", p: 3, w: 1, d: 1, l: 1, gf: 1, ga: 2, gd: -1, pts: 4, qualified: true },
      { team: "Chile",     flag: "🇨🇱", p: 3, w: 0, d: 2, l: 1, gf: 0, ga: 1, gd: -1, pts: 2 },
      { team: "Peru",      flag: "🇵🇪", p: 3, w: 0, d: 1, l: 2, gf: 0, ga: 4, gd: -4, pts: 1 },
    ],
  },
  {
    group: "B",
    rows: [
      { team: "Venezuela", flag: "🇻🇪", p: 3, w: 3, d: 0, l: 0, gf: 5, ga: 2, gd: 3, pts: 9, qualified: true },
      { team: "Ecuador",   flag: "🇪🇨", p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 2, gd: 1, pts: 4, qualified: true },
      { team: "Mexico",    flag: "🇲🇽", p: 3, w: 1, d: 1, l: 1, gf: 1, ga: 1, gd: 0, pts: 4 },
      { team: "Jamaica",   flag: "🇯🇲", p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 5, gd: -4, pts: 0 },
    ],
  },
  {
    group: "C",
    rows: [
      { team: "Uruguay",       flag: "🇺🇾", p: 3, w: 3, d: 0, l: 0, gf: 9, ga: 2, gd: 7, pts: 9, qualified: true },
      { team: "United States", flag: "🇺🇸", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 3, gd: 0, pts: 3 },
      { team: "Panama",        flag: "🇵🇦", p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 5, gd: -1, pts: 6, qualified: true },
      { team: "Bolivia",       flag: "🇧🇴", p: 3, w: 0, d: 0, l: 3, gf: 0, ga: 6, gd: -6, pts: 0 },
    ],
  },
  {
    group: "D",
    rows: [
      { team: "Colombia",   flag: "🇨🇴", p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, gd: 4, pts: 7, qualified: true },
      { team: "Brazil",     flag: "🇧🇷", p: 3, w: 1, d: 2, l: 0, gf: 5, ga: 2, gd: 3, pts: 5, qualified: true },
      { team: "Costa Rica", flag: "🇨🇷", p: 3, w: 0, d: 2, l: 1, gf: 0, ga: 3, gd: -3, pts: 2 },
      { team: "Paraguay",   flag: "🇵🇾", p: 3, w: 0, d: 1, l: 2, gf: 2, ga: 6, gd: -4, pts: 1 },
    ],
  },
];

export type Copa2024Match = {
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  score: string;
  winner: string;
};

export type Copa2024Round = {
  round: "QF" | "SF" | "3rd" | "F";
  label: string;
  matches: Copa2024Match[];
};

export const COPA_2024_BRACKET: Copa2024Round[] = [
  {
    round: "QF",
    label: "Quarter-finals",
    matches: [
      { home: "Argentina", away: "Ecuador",   homeFlag: "🇦🇷", awayFlag: "🇪🇨", score: "1–1 (4–2 pens)", winner: "Argentina" },
      { home: "Venezuela", away: "Canada",    homeFlag: "🇻🇪", awayFlag: "🇨🇦", score: "1–1 (3–4 pens)", winner: "Canada" },
      { home: "Colombia",  away: "Panama",    homeFlag: "🇨🇴", awayFlag: "🇵🇦", score: "5–0",           winner: "Colombia" },
      { home: "Uruguay",   away: "Brazil",    homeFlag: "🇺🇾", awayFlag: "🇧🇷", score: "0–0 (4–2 pens)", winner: "Uruguay" },
    ],
  },
  {
    round: "SF",
    label: "Semi-finals",
    matches: [
      { home: "Argentina", away: "Canada",   homeFlag: "🇦🇷", awayFlag: "🇨🇦", score: "2–0", winner: "Argentina" },
      { home: "Uruguay",   away: "Colombia", homeFlag: "🇺🇾", awayFlag: "🇨🇴", score: "0–1", winner: "Colombia" },
    ],
  },
  {
    round: "3rd",
    label: "Third-place",
    matches: [
      { home: "Canada", away: "Uruguay", homeFlag: "🇨🇦", awayFlag: "🇺🇾", score: "2–2 (3–4 pens)", winner: "Uruguay" },
    ],
  },
  {
    round: "F",
    label: "Final",
    matches: [
      { home: "Argentina", away: "Colombia", homeFlag: "🇦🇷", awayFlag: "🇨🇴", score: "1–0 (AET)", winner: "Argentina" },
    ],
  },
];
