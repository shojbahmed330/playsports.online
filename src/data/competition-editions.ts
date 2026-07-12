/**
 * Per-edition summaries for each football competition (excluding World Cup —
 * that lives in `src/data/wc_tournaments.ts` and has its own dedicated
 * `/football/tournaments/$year` route).
 *
 * Hand-curated so `/football/<comp>/history/<year>` renders real content
 * the moment it ships. Extend freely; missing years fall back to a lightweight
 * placeholder card.
 */

export type EditionSummary = {
  year: number;
  /** Winning team/nation/club. */
  winner: string;
  /** Runner-up. */
  runnerUp?: string;
  /** Host country / hosts, or "—" for leagues. */
  host?: string;
  /** Final score if a tournament. */
  finalScore?: string;
  /** Top scorer of the edition. */
  topScorer?: { name: string; goals: number };
  /** One-line story of the edition. */
  blurb?: string;
};

export const COMPETITION_EDITIONS: Record<string, EditionSummary[]> = {
  euro: [
    { year: 2024, winner: "Spain", runnerUp: "England", host: "Germany", finalScore: "2–1", topScorer: { name: "Dani Olmo / Harry Kane / Jamal Musiala (tied)", goals: 3 }, blurb: "Spain's fourth Euro — a record — with a young side led by Rodri, Yamal and Nico Williams." },
    { year: 2020, winner: "Italy", runnerUp: "England", host: "Pan-Europe", finalScore: "1–1 (3–2 pens)", topScorer: { name: "Cristiano Ronaldo / Patrik Schick", goals: 5 }, blurb: "Delayed by a year, Italy beat England on penalties at Wembley." },
    { year: 2016, winner: "Portugal", runnerUp: "France", host: "France", finalScore: "1–0 (a.e.t.)", topScorer: { name: "Antoine Griezmann", goals: 6 }, blurb: "Éder's extra-time winner sealed Portugal's first major trophy." },
    { year: 2012, winner: "Spain", runnerUp: "Italy", host: "Poland / Ukraine", finalScore: "4–0", topScorer: { name: "Fernando Torres", goals: 3 }, blurb: "Spain's tiki-taka side became the first to win consecutive Euros." },
    { year: 2008, winner: "Spain", runnerUp: "Germany", host: "Austria / Switzerland", finalScore: "1–0", topScorer: { name: "David Villa", goals: 4 }, blurb: "Torres' Vienna winner ended Spain's 44-year trophy drought." },
    { year: 2004, winner: "Greece", runnerUp: "Portugal", host: "Portugal", finalScore: "1–0", topScorer: { name: "Milan Baroš", goals: 5 }, blurb: "The greatest upset in Euros history — Otto Rehhagel's Greece stunned the hosts." },
    { year: 2000, winner: "France", runnerUp: "Italy", host: "Belgium / Netherlands", finalScore: "2–1 (Golden Goal)", topScorer: { name: "Patrick Kluivert / Savo Milošević", goals: 5 }, blurb: "France added the Euro to their World Cup with Trezeguet's golden goal." },
    { year: 1996, winner: "Germany", runnerUp: "Czech Republic", host: "England", finalScore: "2–1 (Golden Goal)", topScorer: { name: "Alan Shearer", goals: 5 }, blurb: "Oliver Bierhoff's golden goal delivered Germany's third Euro." },
    { year: 1992, winner: "Denmark", runnerUp: "Germany", host: "Sweden", finalScore: "2–0", topScorer: { name: "Henrik Larsen / Karl-Heinz Riedle / Dennis Bergkamp / Tomas Brolin", goals: 3 }, blurb: "Called in as late replacements for Yugoslavia, Denmark won it all." },
    { year: 1988, winner: "Netherlands", runnerUp: "USSR", host: "West Germany", finalScore: "2–0", topScorer: { name: "Marco van Basten", goals: 5 }, blurb: "Van Basten's volley remains one of the great goals in football history." },
    { year: 1984, winner: "France", runnerUp: "Spain", host: "France", finalScore: "2–0", topScorer: { name: "Michel Platini", goals: 9 }, blurb: "Platini scored in every match — a record nine goals in five games." },
    { year: 1980, winner: "West Germany", runnerUp: "Belgium", host: "Italy", finalScore: "2–1", topScorer: { name: "Klaus Allofs", goals: 3 } },
    { year: 1976, winner: "Czechoslovakia", runnerUp: "West Germany", host: "Yugoslavia", finalScore: "2–2 (5–3 pens)", topScorer: { name: "Dieter Müller", goals: 4 }, blurb: "Panenka's chip introduced the world to a new penalty." },
    { year: 1972, winner: "West Germany", runnerUp: "USSR", host: "Belgium", finalScore: "3–0", topScorer: { name: "Gerd Müller", goals: 4 } },
    { year: 1968, winner: "Italy", runnerUp: "Yugoslavia", host: "Italy", finalScore: "2–0 (replay)" },
    { year: 1964, winner: "Spain", runnerUp: "USSR", host: "Spain", finalScore: "2–1" },
    { year: 1960, winner: "USSR", runnerUp: "Yugoslavia", host: "France", finalScore: "2–1 (a.e.t.)", blurb: "The inaugural European Nations' Cup." },
  ],
  "copa-america": [
    { year: 2024, winner: "Argentina", runnerUp: "Colombia", host: "United States", finalScore: "1–0 (a.e.t.)", topScorer: { name: "Lautaro Martínez", goals: 5 }, blurb: "Argentina became the first back-to-back Copa champions since 1993–95." },
    { year: 2021, winner: "Argentina", runnerUp: "Brazil", host: "Brazil", finalScore: "1–0", topScorer: { name: "Lionel Messi / Luis Díaz", goals: 4 }, blurb: "Messi's first major trophy with Argentina — 28 years after their last Copa." },
    { year: 2019, winner: "Brazil", runnerUp: "Peru", host: "Brazil", finalScore: "3–1", topScorer: { name: "Everton / Paolo Guerrero", goals: 3 } },
    { year: 2016, winner: "Chile", runnerUp: "Argentina", host: "United States", finalScore: "0–0 (4–2 pens)", topScorer: { name: "Eduardo Vargas", goals: 6 }, blurb: "Centenario edition — Chile beat Argentina on penalties for the second year running." },
    { year: 2015, winner: "Chile", runnerUp: "Argentina", host: "Chile", finalScore: "0–0 (4–1 pens)", topScorer: { name: "Eduardo Vargas / Paolo Guerrero", goals: 4 } },
    { year: 2011, winner: "Uruguay", runnerUp: "Paraguay", host: "Argentina", finalScore: "3–0", topScorer: { name: "Paolo Guerrero", goals: 5 }, blurb: "Uruguay's record 15th Copa América title." },
    { year: 2007, winner: "Brazil", runnerUp: "Argentina", host: "Venezuela", finalScore: "3–0" },
    { year: 2004, winner: "Brazil", runnerUp: "Argentina", host: "Peru", finalScore: "2–2 (4–2 pens)" },
    { year: 2001, winner: "Colombia", runnerUp: "Mexico", host: "Colombia", finalScore: "1–0", blurb: "Colombia unbeaten and unscored-upon — the only host to complete the feat." },
    { year: 1999, winner: "Brazil", runnerUp: "Uruguay", host: "Paraguay", finalScore: "3–0", topScorer: { name: "Rivaldo / Ronaldo", goals: 5 } },
    { year: 1997, winner: "Brazil", runnerUp: "Bolivia", host: "Bolivia", finalScore: "3–1" },
    { year: 1995, winner: "Uruguay", runnerUp: "Brazil", host: "Uruguay", finalScore: "1–1 (5–3 pens)" },
    { year: 1993, winner: "Argentina", runnerUp: "Mexico", host: "Ecuador", finalScore: "2–1" },
    { year: 1991, winner: "Argentina", runnerUp: "Brazil", host: "Chile" },
    { year: 1989, winner: "Brazil", runnerUp: "Uruguay", host: "Brazil" },
    { year: 1987, winner: "Uruguay", runnerUp: "Chile", host: "Argentina", finalScore: "1–0" },
  ],
  laliga: [
    { year: 2026, winner: "TBD", host: "—", blurb: "Season in progress." },
    { year: 2025, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Kylian Mbappé", goals: 31 }, blurb: "Barça reclaimed the title under Hansi Flick." },
    { year: 2024, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Artem Dovbyk", goals: 24 }, blurb: "Bellingham's debut season — Madrid's 36th title." },
    { year: 2023, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Robert Lewandowski", goals: 23 } },
    { year: 2022, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Karim Benzema", goals: 27 }, blurb: "Benzema's Ballon d'Or season." },
    { year: 2021, winner: "Atlético Madrid", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Lionel Messi", goals: 30 } },
    { year: 2020, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Lionel Messi", goals: 25 } },
    { year: 2019, winner: "Barcelona", runnerUp: "Atlético Madrid", host: "—", topScorer: { name: "Lionel Messi", goals: 36 } },
    { year: 2018, winner: "Barcelona", runnerUp: "Atlético Madrid", host: "—", topScorer: { name: "Lionel Messi", goals: 34 } },
    { year: 2017, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Lionel Messi", goals: 37 } },
    { year: 2016, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Luis Suárez", goals: 40 } },
    { year: 2015, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Cristiano Ronaldo", goals: 48 } },
    { year: 2014, winner: "Atlético Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Cristiano Ronaldo", goals: 31 }, blurb: "Simeone's Atleti broke the Barça–Madrid duopoly." },
    { year: 2013, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Lionel Messi", goals: 46 } },
    { year: 2012, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Lionel Messi", goals: 50 }, blurb: "Madrid hit a record 100 points; Messi's 50-goal LaLiga." },
    { year: 2011, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Cristiano Ronaldo", goals: 40 } },
    { year: 2010, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Lionel Messi", goals: 34 } },
  ],
};

export function getEdition(compSlug: string, year: number): EditionSummary | null {
  return COMPETITION_EDITIONS[compSlug]?.find((e) => e.year === year) ?? null;
}
