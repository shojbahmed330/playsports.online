/**
 * Per-edition summaries for each football competition (excluding World Cup —
 * that lives in `src/data/wc_tournaments.ts` and has its own dedicated
 * `/football/tournaments/$year` route).
 *
 * Hand-curated so `/football/<comp>/history/<year>` renders real content
 * the moment it ships. Extend freely; missing years fall back to a lightweight
 * placeholder card.
 */

export type SquadPick = {
  name: string;
  team?: string;
  /** Position code — GK, DF, MF, FW. */
  position?: "GK" | "DF" | "MF" | "FW";
};

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

  // ---------- Phase 3 richer historical seed ----------
  /** Tournament format description, e.g. "24 teams · groups + knockouts". */
  format?: string;
  /** Number of participating teams / clubs. */
  teams?: number;
  /** Matches played across the edition. */
  matches?: number;
  /** Total goals scored across the edition. */
  goals?: number;
  /** Final venue (stadium, city). */
  finalVenue?: string;
  /** Final attendance if notable. */
  finalAttendance?: number;
  /** Best player award (Golden Ball / MVP / Pichichi-adjacent). */
  bestPlayer?: { name: string; team?: string; award?: string };
  /** Best goalkeeper award. */
  bestKeeper?: { name: string; team?: string; award?: string };
  /** Best young player award. */
  youngPlayer?: { name: string; team?: string; award?: string };
  /** Team/squad of the tournament — condensed pick list. */
  squadOfTournament?: SquadPick[];
  /** Notable moments / storylines for the edition (bulleted). */
  notableMoments?: string[];
  /** Head coach of the winning side. */
  winningCoach?: string;
  /** Captain of the winning side. */
  winningCaptain?: string;
  /** ISO date (YYYY-MM-DD) of the final. Used for "on this day" surfaces. */
  finalDate?: string;
};

export const COMPETITION_EDITIONS: Record<string, EditionSummary[]> = {
  euro: [
    {
      year: 2024,
      winner: "Spain",
      runnerUp: "England",
      host: "Germany",
      finalScore: "2–1",
      topScorer: { name: "Dani Olmo / Harry Kane / Jamal Musiala (tied)", goals: 3 },
      blurb: "Spain's fourth Euro — a record — with a young side led by Rodri, Yamal and Nico Williams.",
      format: "24 teams · 6 groups of 4 + knockouts",
      teams: 24,
      matches: 51,
      goals: 117,
      finalVenue: "Olympiastadion, Berlin",
      finalAttendance: 65600,
      bestPlayer: { name: "Rodri", team: "Spain", award: "Player of the Tournament" },
      youngPlayer: { name: "Lamine Yamal", team: "Spain", award: "Young Player of the Tournament" },
      winningCoach: "Luis de la Fuente",
      winningCaptain: "Álvaro Morata",
      squadOfTournament: [
        { name: "Mike Maignan", team: "France", position: "GK" },
        { name: "Marc Cucurella", team: "Spain", position: "DF" },
        { name: "William Saliba", team: "France", position: "DF" },
        { name: "Dani Olmo", team: "Spain", position: "MF" },
        { name: "Rodri", team: "Spain", position: "MF" },
        { name: "Jude Bellingham", team: "England", position: "MF" },
        { name: "Lamine Yamal", team: "Spain", position: "FW" },
        { name: "Nico Williams", team: "Spain", position: "FW" },
        { name: "Harry Kane", team: "England", position: "FW" },
      ],
      notableMoments: [
        "Yamal's Semi-final wonder-strike vs France — youngest Euros scorer ever (16y 362d).",
        "Turkey's Merih Demiral scored both goals in a 2–1 win over Austria — first Euros brace by a Turkey defender.",
        "Cole Palmer's 73rd-minute equaliser in the final — before Oyarzabal won it late for Spain.",
      ],
      finalDate: "2024-07-14",
    },
    {
      year: 2020,
      winner: "Italy",
      runnerUp: "England",
      host: "Pan-Europe",
      finalScore: "1–1 (3–2 pens)",
      topScorer: { name: "Cristiano Ronaldo / Patrik Schick", goals: 5 },
      blurb: "Delayed by a year, Italy beat England on penalties at Wembley.",
      format: "24 teams · played across 11 host cities",
      teams: 24,
      matches: 51,
      goals: 142,
      finalVenue: "Wembley Stadium, London",
      finalAttendance: 67173,
      bestPlayer: { name: "Gianluigi Donnarumma", team: "Italy", award: "Player of the Tournament" },
      winningCoach: "Roberto Mancini",
      winningCaptain: "Giorgio Chiellini",
      notableMoments: [
        "Christian Eriksen collapsed on the pitch during Denmark vs Finland — resuscitated and recovered.",
        "Patrik Schick's 45-metre lob against Scotland — goal of the tournament.",
        "Donnarumma saved Saka's penalty to seal Italy's second Euro.",
      ],
      finalDate: "2021-07-11",
    },
    {
      year: 2016,
      winner: "Portugal",
      runnerUp: "France",
      host: "France",
      finalScore: "1–0 (a.e.t.)",
      topScorer: { name: "Antoine Griezmann", goals: 6 },
      blurb: "Éder's extra-time winner sealed Portugal's first major trophy.",
      format: "First 24-team Euro · expanded from 16",
      teams: 24,
      matches: 51,
      goals: 108,
      finalVenue: "Stade de France, Saint-Denis",
      finalAttendance: 75868,
      bestPlayer: { name: "Antoine Griezmann", team: "France", award: "Player of the Tournament" },
      winningCoach: "Fernando Santos",
      winningCaptain: "Cristiano Ronaldo",
      notableMoments: [
        "Ronaldo went off injured in the final at 25' — coached from the touchline until Éder's 109th-minute winner.",
        "Iceland's fairytale run to the quarter-finals, knocking out England 2–1.",
      ],
      finalDate: "2016-07-10",
    },
    { year: 2012, winner: "Spain", runnerUp: "Italy", host: "Poland / Ukraine", finalScore: "4–0", topScorer: { name: "Fernando Torres", goals: 3 }, blurb: "Spain's tiki-taka side became the first to win consecutive Euros.", finalDate: "2012-07-01" },
    {
      year: 2008,
      winner: "Spain",
      runnerUp: "Germany",
      host: "Austria / Switzerland",
      finalScore: "1–0",
      topScorer: { name: "David Villa", goals: 4 },
      blurb: "Torres' Vienna winner ended Spain's 44-year trophy drought.",
      format: "16 teams · 4 groups of 4 + knockouts",
      teams: 16,
      matches: 31,
      goals: 77,
      finalVenue: "Ernst-Happel-Stadion, Vienna",
      bestPlayer: { name: "Xavi", team: "Spain", award: "Player of the Tournament" },
      winningCoach: "Luis Aragonés",
      winningCaptain: "Iker Casillas",
      finalDate: "2008-06-29",
    },
    { year: 2004, winner: "Greece", runnerUp: "Portugal", host: "Portugal", finalScore: "1–0", topScorer: { name: "Milan Baroš", goals: 5 }, blurb: "The greatest upset in Euros history — Otto Rehhagel's Greece stunned the hosts.", finalDate: "2004-07-04" },
    { year: 2000, winner: "France", runnerUp: "Italy", host: "Belgium / Netherlands", finalScore: "2–1 (Golden Goal)", topScorer: { name: "Patrick Kluivert / Savo Milošević", goals: 5 }, blurb: "France added the Euro to their World Cup with Trezeguet's golden goal.", finalDate: "2000-07-02" },
    { year: 1996, winner: "Germany", runnerUp: "Czech Republic", host: "England", finalScore: "2–1 (Golden Goal)", topScorer: { name: "Alan Shearer", goals: 5 }, blurb: "Oliver Bierhoff's golden goal delivered Germany's third Euro.", finalDate: "1996-06-30" },
    { year: 1992, winner: "Denmark", runnerUp: "Germany", host: "Sweden", finalScore: "2–0", topScorer: { name: "Henrik Larsen / Karl-Heinz Riedle / Dennis Bergkamp / Tomas Brolin", goals: 3 }, blurb: "Called in as late replacements for Yugoslavia, Denmark won it all.", finalDate: "1992-06-26" },
    { year: 1988, winner: "Netherlands", runnerUp: "USSR", host: "West Germany", finalScore: "2–0", topScorer: { name: "Marco van Basten", goals: 5 }, blurb: "Van Basten's volley remains one of the great goals in football history.", finalDate: "1988-06-25" },
    { year: 1984, winner: "France", runnerUp: "Spain", host: "France", finalScore: "2–0", topScorer: { name: "Michel Platini", goals: 9 }, blurb: "Platini scored in every match — a record nine goals in five games.", finalDate: "1984-06-27" },
    { year: 1980, winner: "West Germany", runnerUp: "Belgium", host: "Italy", finalScore: "2–1", topScorer: { name: "Klaus Allofs", goals: 3 }, finalDate: "1980-06-22" },
    { year: 1976, winner: "Czechoslovakia", runnerUp: "West Germany", host: "Yugoslavia", finalScore: "2–2 (5–3 pens)", topScorer: { name: "Dieter Müller", goals: 4 }, blurb: "Panenka's chip introduced the world to a new penalty.", finalDate: "1976-06-20" },
    { year: 1972, winner: "West Germany", runnerUp: "USSR", host: "Belgium", finalScore: "3–0", topScorer: { name: "Gerd Müller", goals: 4 }, finalDate: "1972-06-18" },
    { year: 1968, winner: "Italy", runnerUp: "Yugoslavia", host: "Italy", finalScore: "2–0 (replay)", finalDate: "1968-06-10" },
    { year: 1964, winner: "Spain", runnerUp: "USSR", host: "Spain", finalScore: "2–1", finalDate: "1964-06-21" },
    { year: 1960, winner: "USSR", runnerUp: "Yugoslavia", host: "France", finalScore: "2–1 (a.e.t.)", blurb: "The inaugural European Nations' Cup.", finalDate: "1960-07-10" },
  ],
  "copa-america": [
    {
      year: 2024,
      winner: "Argentina",
      runnerUp: "Colombia",
      host: "United States",
      finalScore: "1–0 (a.e.t.)",
      topScorer: { name: "Lautaro Martínez", goals: 5 },
      blurb: "Argentina became the first back-to-back Copa champions since 1993–95.",
      format: "16 teams · 4 groups of 4 + knockouts",
      teams: 16,
      matches: 32,
      goals: 60,
      finalVenue: "Hard Rock Stadium, Miami Gardens",
      finalAttendance: 65300,
      bestPlayer: { name: "James Rodríguez", team: "Colombia", award: "Best Player" },
      bestKeeper: { name: "Emiliano Martínez", team: "Argentina", award: "Golden Glove" },
      winningCoach: "Lionel Scaloni",
      winningCaptain: "Lionel Messi",
      notableMoments: [
        "Final delayed 82 minutes after crowd-control chaos at gates.",
        "Messi injured in the first half, watched from the bench as Lautaro scored the 112th-minute winner.",
        "Argentina's 16th Copa — sole record holder ahead of Uruguay.",
      ],
      finalDate: "2024-07-14",
    },
    {
      year: 2021,
      winner: "Argentina",
      runnerUp: "Brazil",
      host: "Brazil",
      finalScore: "1–0",
      topScorer: { name: "Lionel Messi / Luis Díaz", goals: 4 },
      blurb: "Messi's first major trophy with Argentina — 28 years after their last Copa.",
      format: "10 teams · single group phase + knockouts (COVID-era)",
      teams: 10,
      matches: 28,
      goals: 65,
      finalVenue: "Maracanã, Rio de Janeiro",
      bestPlayer: { name: "Lionel Messi", team: "Argentina", award: "Best Player" },
      bestKeeper: { name: "Emiliano Martínez", team: "Argentina", award: "Golden Glove" },
      winningCoach: "Lionel Scaloni",
      winningCaptain: "Lionel Messi",
      notableMoments: [
        "Ángel Di María's chip over Ederson decided the final.",
        "Argentina ended a 28-year international trophy drought.",
      ],
      finalDate: "2021-07-10",
    },
    { year: 2019, winner: "Brazil", runnerUp: "Peru", host: "Brazil", finalScore: "3–1", topScorer: { name: "Everton / Paolo Guerrero", goals: 3 }, finalDate: "2019-07-07" },
    { year: 2016, winner: "Chile", runnerUp: "Argentina", host: "United States", finalScore: "0–0 (4–2 pens)", topScorer: { name: "Eduardo Vargas", goals: 6 }, blurb: "Centenario edition — Chile beat Argentina on penalties for the second year running.", finalDate: "2016-06-26" },
    { year: 2015, winner: "Chile", runnerUp: "Argentina", host: "Chile", finalScore: "0–0 (4–1 pens)", topScorer: { name: "Eduardo Vargas / Paolo Guerrero", goals: 4 }, finalDate: "2015-07-04" },
    { year: 2011, winner: "Uruguay", runnerUp: "Paraguay", host: "Argentina", finalScore: "3–0", topScorer: { name: "Paolo Guerrero", goals: 5 }, blurb: "Uruguay's record 15th Copa América title.", finalDate: "2011-07-24" },
    { year: 2007, winner: "Brazil", runnerUp: "Argentina", host: "Venezuela", finalScore: "3–0", finalDate: "2007-07-15" },
    { year: 2004, winner: "Brazil", runnerUp: "Argentina", host: "Peru", finalScore: "2–2 (4–2 pens)" },
    { year: 2001, winner: "Colombia", runnerUp: "Mexico", host: "Colombia", finalScore: "1–0", blurb: "Colombia unbeaten and unscored-upon — the only host to complete the feat." },
    { year: 1999, winner: "Brazil", runnerUp: "Uruguay", host: "Paraguay", finalScore: "3–0", topScorer: { name: "Rivaldo / Ronaldo", goals: 5 } },
    { year: 1997, winner: "Brazil", runnerUp: "Bolivia", host: "Bolivia", finalScore: "3–1" },
    { year: 1995, winner: "Uruguay", runnerUp: "Brazil", host: "Uruguay", finalScore: "1–1 (5–3 pens)" },
    { year: 1993, winner: "Argentina", runnerUp: "Mexico", host: "Ecuador", finalScore: "2–1" },
    { year: 1991, winner: "Argentina", runnerUp: "Brazil", host: "Chile" },
    { year: 1989, winner: "Brazil", runnerUp: "Uruguay", host: "Brazil" },
    { year: 1987, winner: "Uruguay", runnerUp: "Chile", host: "Argentina", finalScore: "1–0" },
    { year: 1983, winner: "Uruguay", runnerUp: "Brazil", host: "Home-and-away", blurb: "First home-and-away edition after eight years without the tournament." },
    { year: 1979, winner: "Paraguay", runnerUp: "Chile", host: "Home-and-away" },
    { year: 1975, winner: "Peru", runnerUp: "Colombia", host: "Home-and-away", blurb: "Renamed Copa América — first edition under the new name." },
    { year: 1967, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
    { year: 1963, winner: "Bolivia", runnerUp: "Paraguay", host: "Bolivia", blurb: "Bolivia's only Copa title, on home altitude." },
    { year: 1959, winner: "Uruguay", runnerUp: "Argentina", host: "Ecuador" },
    { year: 1957, winner: "Argentina", runnerUp: "Brazil", host: "Peru", topScorer: { name: "Humberto Maschio", goals: 9 } },
    { year: 1956, winner: "Uruguay", runnerUp: "Chile", host: "Uruguay" },
    { year: 1955, winner: "Argentina", runnerUp: "Chile", host: "Chile" },
    { year: 1953, winner: "Paraguay", runnerUp: "Brazil", host: "Peru" },
    { year: 1949, winner: "Brazil", runnerUp: "Paraguay", host: "Brazil", finalScore: "7–0", topScorer: { name: "Jair Rosa Pinto", goals: 9 } },
    { year: 1947, winner: "Argentina", runnerUp: "Paraguay", host: "Ecuador" },
    { year: 1946, winner: "Argentina", runnerUp: "Brazil", host: "Argentina" },
    { year: 1945, winner: "Argentina", runnerUp: "Brazil", host: "Chile" },
    { year: 1942, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
    { year: 1941, winner: "Argentina", runnerUp: "Uruguay", host: "Chile" },
    { year: 1939, winner: "Peru", runnerUp: "Uruguay", host: "Peru", blurb: "Peru's first Copa title, at home." },
    { year: 1937, winner: "Argentina", runnerUp: "Brazil", host: "Argentina" },
    { year: 1935, winner: "Uruguay", runnerUp: "Argentina", host: "Peru" },
    { year: 1929, winner: "Argentina", runnerUp: "Paraguay", host: "Argentina" },
    { year: 1927, winner: "Argentina", runnerUp: "Uruguay", host: "Peru" },
    { year: 1926, winner: "Uruguay", runnerUp: "Argentina", host: "Chile" },
    { year: 1925, winner: "Argentina", runnerUp: "Brazil", host: "Argentina" },
    { year: 1924, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
    { year: 1923, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
    { year: 1922, winner: "Brazil", runnerUp: "Paraguay", host: "Brazil" },
    { year: 1921, winner: "Argentina", runnerUp: "Brazil", host: "Argentina" },
    { year: 1920, winner: "Uruguay", runnerUp: "Argentina", host: "Chile" },
    { year: 1919, winner: "Brazil", runnerUp: "Uruguay", host: "Brazil", finalScore: "1–0 (a.e.t.)", blurb: "Brazil's first continental title, decided by an Arthur Friedenreich playoff goal." },
    { year: 1917, winner: "Uruguay", runnerUp: "Argentina", host: "Uruguay" },
    { year: 1916, winner: "Uruguay", runnerUp: "Argentina", host: "Argentina", blurb: "The inaugural South American Championship — oldest continental football tournament in the world." },
  ],

  laliga: [
    { year: 2026, winner: "TBD", host: "—", blurb: "Season in progress." },
    {
      year: 2025,
      winner: "Barcelona",
      runnerUp: "Real Madrid",
      host: "—",
      topScorer: { name: "Kylian Mbappé", goals: 31 },
      blurb: "Barça reclaimed the title under Hansi Flick.",
      format: "20 clubs · 38 matchdays · double round-robin",
      teams: 20,
      matches: 380,
      bestPlayer: { name: "Lamine Yamal", team: "Barcelona", award: "LaLiga MVP" },
      bestKeeper: { name: "Joan García", team: "Espanyol → Barcelona", award: "Zamora Trophy" },
      winningCoach: "Hansi Flick",
      winningCaptain: "Marc-André ter Stegen",
      notableMoments: [
        "Barcelona clinched with four matchdays to spare, ending Madrid's title defence.",
        "Mbappé's debut season saw him win the Pichichi with 31 goals.",
      ],
    },
    {
      year: 2024,
      winner: "Real Madrid",
      runnerUp: "Barcelona",
      host: "—",
      topScorer: { name: "Artem Dovbyk", goals: 24 },
      blurb: "Bellingham's debut season — Madrid's 36th title.",
      format: "20 clubs · 38 matchdays",
      teams: 20,
      matches: 380,
      bestPlayer: { name: "Jude Bellingham", team: "Real Madrid", award: "LaLiga MVP" },
      winningCoach: "Carlo Ancelotti",
      winningCaptain: "Nacho Fernández",
      notableMoments: [
        "Bellingham scored 19 LaLiga goals as a midfielder in his first Spanish season.",
        "Girona finished 3rd — their best-ever LaLiga campaign.",
      ],
    },
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
    { year: 2009, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Diego Forlán", goals: 32 }, blurb: "Guardiola's first season — the sextuple year began here." },
    { year: 2008, winner: "Real Madrid", runnerUp: "Villarreal", host: "—", topScorer: { name: "Daniel Güiza", goals: 27 } },
    { year: 2007, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Ruud van Nistelrooy", goals: 25 }, blurb: "Capello's Madrid pipped Barça on head-to-head." },
    { year: 2006, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Samuel Eto'o", goals: 26 }, blurb: "Rijkaard's Barça added the league to their Champions League." },
    { year: 2005, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Diego Forlán", goals: 25 } },
    { year: 2004, winner: "Valencia", runnerUp: "Barcelona", host: "—", topScorer: { name: "Ronaldo", goals: 24 }, blurb: "Rafa Benítez's Valencia won LaLiga and the UEFA Cup." },
    { year: 2003, winner: "Real Madrid", runnerUp: "Real Sociedad", host: "—", topScorer: { name: "Roy Makaay", goals: 29 }, blurb: "Galácticos' peak — Zidane, Figo, Raúl, Ronaldo." },
    { year: 2002, winner: "Valencia", runnerUp: "Deportivo La Coruña", host: "—", topScorer: { name: "Diego Tristán", goals: 21 }, blurb: "Valencia's first title in 31 years." },
    { year: 2001, winner: "Real Madrid", runnerUp: "Deportivo La Coruña", host: "—", topScorer: { name: "Raúl", goals: 24 } },
    { year: 2000, winner: "Deportivo La Coruña", runnerUp: "Barcelona", host: "—", topScorer: { name: "Salva Ballesta", goals: 27 }, blurb: "SuperDepor stunned the giants for their only LaLiga title." },
    { year: 1999, winner: "Barcelona", runnerUp: "Real Madrid", host: "—", topScorer: { name: "Raúl", goals: 25 } },
    { year: 1998, winner: "Barcelona", runnerUp: "Athletic Bilbao", host: "—", topScorer: { name: "Christian Vieri", goals: 24 }, blurb: "Van Gaal's first Barça title." },
    { year: 1997, winner: "Real Madrid", runnerUp: "Barcelona", host: "—", topScorer: { name: "Ronaldo", goals: 34 }, blurb: "Ronaldo Nazário's iconic Barça season before leaving for Inter." },
    { year: 1996, winner: "Atlético Madrid", runnerUp: "Valencia", host: "—", topScorer: { name: "Iván Zamorano", goals: 28 }, blurb: "Radomir Antić's Atleti won the league and cup double." },
  ],
};


export function getEdition(compSlug: string, year: number): EditionSummary | null {
  return COMPETITION_EDITIONS[compSlug]?.find((e) => e.year === year) ?? null;
}
