/**
 * Per-competition record seed data. All values are hand-curated so pages render
 * with real content the moment they ship. Wire ESPN/other feeds later if we get
 * an authoritative live source; for now records are inherently historical.
 *
 * Add a competition's slug as a top-level key. Categories are optional per comp;
 * missing categories render a scoped "coming soon" state.
 */

export type RecordRow = {
  rank?: number;
  title: string;
  value: string;
  context?: string;
  /** Optional headshot URL. Component falls back to ui-avatars when omitted. */
  image?: string;
};


export type RecordCategoryKey =
  | "top-scorers-all-time"
  | "most-titles"
  | "most-appearances"
  | "records-and-firsts";

export type CompetitionRecords = Partial<Record<RecordCategoryKey, RecordRow[]>>;

export const COMPETITION_RECORDS: Record<string, CompetitionRecords> = {
  "world-cup": {
    "top-scorers-all-time": [
      { rank: 1, title: "Miroslav Klose", value: "16 goals", context: "Germany · 2002–2014 (4 tournaments)", image: "https://a.espncdn.com/i/headshots/soccer/players/full/45843.png" },
      { rank: 2, title: "Ronaldo", value: "15 goals", context: "Brazil · 1998–2006", image: "https://a.espncdn.com/i/headshots/soccer/players/full/13.png" },
      { rank: 3, title: "Gerd Müller", value: "14 goals", context: "West Germany · 1970–1974" },
      { rank: 4, title: "Lionel Messi", value: "13 goals", context: "Argentina · 2006–2026 (incl. WC 2026 to date)", image: "https://a.espncdn.com/i/headshots/soccer/players/full/45843.png" },
      { rank: 4, title: "Just Fontaine", value: "13 goals", context: "France · 1958 (one tournament)" },
      { rank: 6, title: "Kylian Mbappé", value: "13 goals", context: "France · 2018–2026 (incl. WC 2026 to date)", image: "https://a.espncdn.com/i/headshots/soccer/players/full/241668.png" },
      { rank: 6, title: "Pelé", value: "12 goals", context: "Brazil · 1958–1970" },
      { rank: 8, title: "Sándor Kocsis", value: "11 goals", context: "Hungary · 1954" },
      { rank: 8, title: "Jürgen Klinsmann", value: "11 goals", context: "West Germany / Germany" },
      { rank: 10, title: "Gabriel Batistuta", value: "10 goals", context: "Argentina" },
    ],

    "most-titles": [
      { rank: 1, title: "Brazil", value: "5 titles", context: "1958, 1962, 1970, 1994, 2002" },
      { rank: 2, title: "Germany / West Germany", value: "4 titles", context: "1954, 1974, 1990, 2014" },
      { rank: 2, title: "Italy", value: "4 titles", context: "1934, 1938, 1982, 2006" },
      { rank: 4, title: "Argentina", value: "3 titles", context: "1978, 1986, 2022" },
      { rank: 5, title: "France", value: "2 titles", context: "1998, 2018" },
      { rank: 5, title: "Uruguay", value: "2 titles", context: "1930, 1950" },
      { rank: 7, title: "England", value: "1 title", context: "1966" },
      { rank: 7, title: "Spain", value: "1 title", context: "2010" },
    ],
    "most-appearances": [
      { rank: 1, title: "Lionel Messi", value: "26 matches", context: "Argentina · 5 tournaments" },
      { rank: 2, title: "Lothar Matthäus", value: "25 matches", context: "West Germany / Germany · 5 tournaments" },
      { rank: 3, title: "Miroslav Klose", value: "24 matches", context: "Germany · 4 tournaments" },
      { rank: 4, title: "Paolo Maldini", value: "23 matches", context: "Italy · 4 tournaments" },
      { rank: 4, title: "Diego Maradona", value: "21 matches", context: "Argentina · 4 tournaments" },
    ],
    "records-and-firsts": [
      { title: "First edition", value: "1930 · Uruguay", context: "Uruguay beat Argentina 4–2 in the first final" },
      { title: "Most goals in one tournament", value: "13 — Just Fontaine", context: "France · 1958" },
      { title: "Youngest scorer", value: "Pelé — 17y 239d", context: "Brazil vs Wales · 1958 quarter-final" },
      { title: "Fastest goal", value: "Hakan Şükür — 10.8s", context: "Turkey vs South Korea · 2002 third-place" },
      { title: "Biggest win", value: "Hungary 10–1 El Salvador", context: "1982 group stage" },
      { title: "Most matches as head coach", value: "Helmut Schön — 25", context: "West Germany" },
    ],
  },

  euro: {
    "top-scorers-all-time": [
      { rank: 1, title: "Cristiano Ronaldo", value: "14 goals", context: "Portugal · 2004–2024", image: "https://a.espncdn.com/i/headshots/soccer/players/full/44877.png" },
      { rank: 2, title: "Michel Platini", value: "9 goals", context: "France · 1984 (single tournament)" },
      { rank: 3, title: "Alan Shearer", value: "7 goals", context: "England · 1992–2000" },
      { rank: 3, title: "Antoine Griezmann", value: "7 goals", context: "France · 2016–2024", image: "https://a.espncdn.com/i/headshots/soccer/players/full/150211.png" },
      { rank: 5, title: "Ruud van Nistelrooy", value: "6 goals", context: "Netherlands · 2004–2008" },
      { rank: 5, title: "Álvaro Morata", value: "6 goals", context: "Spain · 2016–2024" },
      { rank: 5, title: "Wayne Rooney", value: "6 goals", context: "England · 2004–2016" },
      { rank: 5, title: "Zlatan Ibrahimović", value: "6 goals", context: "Sweden · 2004–2016" },
      { rank: 5, title: "Thierry Henry", value: "6 goals", context: "France · 2000–2008" },
      { rank: 5, title: "Nuno Gomes", value: "6 goals", context: "Portugal · 2000–2008" },
    ],
    "most-titles": [
      { rank: 1, title: "Spain", value: "4 titles", context: "1964, 2008, 2012, 2024" },
      { rank: 2, title: "Germany", value: "3 titles", context: "1972, 1980, 1996" },
      { rank: 3, title: "France", value: "2 titles", context: "1984, 2000" },
      { rank: 3, title: "Italy", value: "2 titles", context: "1968, 2020" },
    ],
    "most-appearances": [
      { rank: 1, title: "Cristiano Ronaldo", value: "30 matches", context: "Portugal · 6 tournaments" },
      { rank: 2, title: "Bastian Schweinsteiger", value: "18 matches", context: "Germany" },
      { rank: 3, title: "Pepe", value: "18 matches", context: "Portugal" },
    ],
    "records-and-firsts": [
      { title: "First edition", value: "1960 · France", context: "Soviet Union won 2–1 vs Yugoslavia (a.e.t.)" },
      { title: "Youngest goalscorer", value: "Lamine Yamal — 16y 362d", context: "Spain vs France · 2024 semi-final" },
      { title: "Fastest goal", value: "Dmitri Kirichenko — 1m 07s", context: "Russia vs Greece · 2004" },
      { title: "Biggest win", value: "Netherlands 6–1 Yugoslavia", context: "Euro 2000 quarter-final" },
      { title: "Most goals in a single edition", value: "Michel Platini — 9", context: "France · Euro 1984 (in 5 games)" },
    ],
    "iconic-moments": [
      { title: "Panenka's chip", value: "1976", context: "Antonín Panenka's audacious final penalty vs West Germany — introduced the world to a new spot-kick." },
      { title: "Van Basten volley", value: "1988", context: "Marco van Basten's near-impossible volley from the byline in the Final vs USSR — often called the greatest goal in Euros history." },
      { title: "Bierhoff Golden Goal", value: "1996", context: "First Golden Goal in a major final — Germany 2–1 Czech Republic." },
      { title: "Greece 2004", value: "2004", context: "The greatest upset in international football — Otto Rehhagel's Greece beat hosts Portugal 1–0 in the final." },
      { title: "Éder wins it for Portugal", value: "2016", context: "Ronaldo went off injured in the 25th minute — Éder scored a 109th-minute worldie to beat France." },
      { title: "Schick from 45 metres", value: "2020", context: "Patrik Schick lobbed David Marshall from beyond halfway — goal of the tournament." },
      { title: "Yamal at 16", value: "2024", context: "Lamine Yamal's semi-final wonder-strike vs France — youngest Euros scorer ever (16y 362d)." },
    ],
  },

  "copa-america": {
    "top-scorers-all-time": [
      { rank: 1, title: "Norberto Méndez", value: "17 goals", context: "Argentina · 1945–1947" },
      { rank: 1, title: "Zizinho", value: "17 goals", context: "Brazil · 1942–1957" },
      { rank: 3, title: "Teodoro Fernández", value: "15 goals", context: "Peru · 1935–1947" },
      { rank: 4, title: "Severino Varela", value: "15 goals", context: "Uruguay · 1939–1942" },
      { rank: 5, title: "Lionel Messi", value: "14 goals", context: "Argentina · 2007–2024" },
    ],
    "most-titles": [
      { rank: 1, title: "Uruguay", value: "15 titles", context: "1916 – 2011" },
      { rank: 1, title: "Argentina", value: "16 titles", context: "1921 – 2024" },
      { rank: 3, title: "Brazil", value: "9 titles", context: "1919 – 2019" },
      { rank: 4, title: "Paraguay", value: "2 titles", context: "1953, 1979" },
      { rank: 4, title: "Peru", value: "2 titles", context: "1939, 1975" },
    ],
    "most-appearances": [
      { rank: 1, title: "Sergio Livingstone", value: "34 matches", context: "Chile" },
      { rank: 2, title: "Zizinho", value: "33 matches", context: "Brazil" },
      { rank: 3, title: "Lionel Messi", value: "39 matches", context: "Argentina (all-time record)" },
    ],
    "records-and-firsts": [
      { title: "First edition", value: "1916 · Argentina", context: "Uruguay champions — oldest continental trophy in football" },
      { title: "Most recent champion", value: "Argentina 2024", context: "1–0 vs Colombia (a.e.t.) · Hard Rock Stadium, Miami" },
      { title: "Biggest win", value: "Argentina 12–0 Ecuador", context: "1942 edition" },
    ],
  },
  laliga: {
    "top-scorers-all-time": [
      { rank: 1, title: "Lionel Messi", value: "474 goals", context: "Barcelona · 2004–2021" },
      { rank: 2, title: "Cristiano Ronaldo", value: "311 goals", context: "Real Madrid · 2009–2018" },
      { rank: 3, title: "Telmo Zarra", value: "251 goals", context: "Athletic Bilbao · 1940s–50s" },
      { rank: 4, title: "Karim Benzema", value: "238 goals", context: "Real Madrid · 2009–2023" },
      { rank: 5, title: "Hugo Sánchez", value: "234 goals", context: "Atlético / Real Madrid" },
    ],
    "most-titles": [
      { rank: 1, title: "Real Madrid", value: "36 titles", context: "First: 1931–32 · Most recent: 2023–24" },
      { rank: 2, title: "Barcelona", value: "27 titles", context: "First: 1928–29 · Most recent: 2022–23" },
      { rank: 3, title: "Atlético Madrid", value: "11 titles", context: "Most recent: 2020–21" },
      { rank: 4, title: "Athletic Bilbao", value: "8 titles" },
      { rank: 4, title: "Valencia", value: "6 titles" },
    ],
    "most-appearances": [
      { rank: 1, title: "Andoni Zubizarreta", value: "622 matches", context: "Athletic / Barcelona / Valencia" },
      { rank: 2, title: "Joaquín", value: "622 matches", context: "Betis / Valencia" },
      { rank: 3, title: "Raúl", value: "550 matches", context: "Real Madrid" },
    ],
    "records-and-firsts": [
      { title: "First season", value: "1928–29", context: "Barcelona won the inaugural title" },
      { title: "Most goals in a season", value: "50 — Lionel Messi", context: "2011–12 · still stands" },
      { title: "Most Pichichi awards", value: "8 — Lionel Messi", context: "2010, 2012, 2013, 2017–2021" },
      { title: "Longest unbeaten run", value: "43 matches — Real Sociedad", context: "1978–1980" },
    ],
  },
};

export function getCompetitionRecords(slug: string): CompetitionRecords {
  return COMPETITION_RECORDS[slug] ?? {};
}
