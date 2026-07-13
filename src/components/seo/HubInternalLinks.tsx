// Semantic "explore this hub" internal-link block for every sport hub &
// sub-hub. Renders (1) contextual sibling-hub links for the current sport
// and (2) a Popular Searches chip strip. Adds ~8-12 crawl paths and
// spreads PageRank without changing visual weight of the page.

import { Link } from "@tanstack/react-router";
import { LastUpdated } from "./LastUpdated";
import { PopularSearches } from "./PopularSearches";

type HubLink = { label: string; to: string; hint?: string };

type SportKey = "nba" | "mlb" | "nhl" | "mls" | "cricket" | "football" | "ipl" | "live";

const HUBS: Record<SportKey, { name: string; links: HubLink[] }> = {
  nba: {
    name: "NBA",
    links: [
      { label: "NBA scoreboard", to: "/nba/scores", hint: "Today's games" },
      { label: "NBA standings", to: "/nba/standings", hint: "East & West" },
      { label: "NBA stat leaders", to: "/nba/leaders", hint: "PTS · AST · REB" },
      { label: "NBA teams", to: "/nba/teams", hint: "All 30 franchises" },
      { label: "NBA news", to: "/nba/news", hint: "Latest headlines" },
      { label: "NBA history", to: "/nba/history", hint: "All-time records" },
      { label: "NBA Finals champions", to: "/nba/champions", hint: "Every winner" },
    ],
  },
  mlb: {
    name: "MLB",
    links: [
      { label: "MLB scores", to: "/mlb/scores", hint: "Today's schedule" },
      { label: "MLB standings", to: "/mlb/standings", hint: "AL · NL · Wild Card" },
      { label: "MLB leaders", to: "/mlb/players", hint: "Batting & pitching" },
      { label: "MLB teams", to: "/mlb/teams", hint: "All 30 franchises" },
      { label: "Postseason bracket", to: "/mlb/postseason", hint: "WC → World Series" },
      { label: "MLB news", to: "/mlb/news", hint: "Latest headlines" },
      { label: "MLB history", to: "/mlb/history", hint: "Records & awards" },
      { label: "World Series champions", to: "/mlb/champions", hint: "Every winner" },
    ],
  },
  nhl: {
    name: "NHL",
    links: [
      { label: "NHL scores", to: "/nhl/scores", hint: "Today's games" },
      { label: "NHL standings", to: "/nhl/standings", hint: "East & West" },
      { label: "NHL leaders", to: "/nhl/leaders", hint: "G · A · PTS" },
      { label: "NHL teams", to: "/nhl/teams", hint: "All 32 franchises" },
      { label: "NHL news", to: "/nhl/news", hint: "Latest headlines" },
      { label: "NHL history", to: "/nhl/history", hint: "Records & awards" },
      { label: "Stanley Cup champions", to: "/nhl/champions", hint: "Every winner" },
    ],
  },
  mls: {
    name: "MLS",
    links: [
      { label: "MLS scores", to: "/mls/scores", hint: "Today's schedule" },
      { label: "MLS standings", to: "/mls/standings", hint: "East & West" },
      { label: "MLS leaders", to: "/mls/leaders", hint: "Goals · Assists" },
      { label: "MLS teams", to: "/mls/teams", hint: "All clubs" },
      { label: "MLS news", to: "/mls/news", hint: "Latest headlines" },
      { label: "MLS history", to: "/mls/history", hint: "Records & awards" },
      { label: "MLS Cup champions", to: "/mls/champions", hint: "Every winner" },
    ],
  },
  cricket: {
    name: "Cricket",
    links: [
      { label: "Cricket scores", to: "/cricket/scores", hint: "Live scorecards" },
      { label: "ICC rankings", to: "/cricket/rankings", hint: "Batting · Bowling" },
      { label: "Cricket teams", to: "/cricket/teams", hint: "Nations & clubs" },
      { label: "Cricket players", to: "/cricket/players", hint: "Legends & stars" },
      { label: "Cricket records", to: "/cricket/records", hint: "Highest scores" },
      { label: "Cricket history", to: "/cricket/history", hint: "Landmark tournaments" },
      { label: "IPL hub", to: "/cricket/ipl", hint: "Indian Premier League" },
      { label: "Cricket highlights", to: "/cricket/highlights", hint: "Video recaps" },
    ],
  },
  ipl: {
    name: "IPL",
    links: [
      { label: "IPL scores", to: "/cricket/ipl/scores", hint: "Today's games" },
      { label: "IPL standings", to: "/cricket/ipl/standings", hint: "Points table" },
      { label: "IPL players", to: "/cricket/ipl/players", hint: "Orange & Purple Cap" },
      { label: "IPL teams", to: "/cricket/ipl/teams", hint: "All 10 franchises" },
      { label: "IPL records", to: "/cricket/ipl/records", hint: "All-time stats" },
      { label: "IPL history", to: "/cricket/ipl/history", hint: "Every season" },
    ],
  },
  football: {
    name: "Football",
    links: [
      { label: "Top scorers", to: "/football/top-scorers", hint: "By season" },
      { label: "Football players", to: "/football/players", hint: "Player index" },
      { label: "Football countries", to: "/football/countries", hint: "National teams" },
      { label: "Campaigns", to: "/football/campaigns", hint: "Tournament runs" },
      { label: "Live football today", to: "/live/football", hint: "Real-time matches" },
      { label: "Football hub", to: "/football", hint: "Home" },
    ],
  },
  live: {
    name: "Live sports",
    links: [
      { label: "Live football", to: "/live/football", hint: "All matches now" },
      { label: "Live cricket", to: "/live/cricket", hint: "Live scorecards" },
      { label: "Live NBA", to: "/live/nba", hint: "Tonight's games" },
      { label: "Live MLB", to: "/live/mlb", hint: "Today's games" },
      { label: "Live NHL", to: "/live/nhl", hint: "Tonight's games" },
      { label: "Live MLS", to: "/live/mls", hint: "Match centre" },
    ],
  },
};

export function HubInternalLinks({
  sport,
  currentPath,
  title,
  showPopular = true,
  className = "",
}: {
  sport: SportKey;
  currentPath?: string; // e.g. "/nba/scores" — filtered out of sibling list
  title?: string;
  showPopular?: boolean;
  className?: string;
}) {
  const hub = HUBS[sport];
  const links = hub.links.filter((l) => l.to !== currentPath);
  return (
    <section aria-label={`Explore ${hub.name}`} className={`mt-10 space-y-6 ${className}`}>
      <nav
        aria-label={title ?? `Explore ${hub.name}`}
        className="rounded-2xl border border-border bg-card/40 p-5"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title ?? `Explore ${hub.name}`}</h2>
          <LastUpdated />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="group block rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm transition hover:border-gold/60 hover:bg-accent"
              >
                <span className="font-medium group-hover:text-gold">{l.label}</span>
                {l.hint && (
                  <span className="ml-1 text-xs text-muted-foreground">— {l.hint}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {showPopular && <PopularSearches limit={10} />}
    </section>
  );
}
