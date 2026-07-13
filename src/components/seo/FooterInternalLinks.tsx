import { Link } from "@tanstack/react-router";

/**
 * Sitewide footer internal-linking block. Rendered on every page so that
 * crawlers reaching an orphan or leaf page still have a shallow path to
 * every important entity type. Keep this dense but < 100 links total to
 * avoid link-equity dilution.
 *
 * Column choices are tied to Phase 2.2 evergreen keyword pages + Phase
 * 2.1 entity registries. Update sparingly — link stability matters for
 * SEO trust.
 */

const POPULAR_TOURNAMENTS: Array<{ label: string; href: string }> = [
  { label: "FIFA World Cup 2026", href: "/football" },
  { label: "World Cup Campaigns", href: "/football/campaigns" },
  { label: "2026 Group Stage", href: "/tournaments/fifa-world-cup-2026/group-stage" },
  { label: "2026 Round of 32", href: "/tournaments/fifa-world-cup-2026/round-of-32" },
  { label: "2026 Round of 16", href: "/tournaments/fifa-world-cup-2026/round-of-16" },
  { label: "2026 Quarter-finals", href: "/tournaments/fifa-world-cup-2026/quarter-finals" },
  { label: "2026 Semi-finals", href: "/tournaments/fifa-world-cup-2026/semi-finals" },
  { label: "2026 Third-place", href: "/tournaments/fifa-world-cup-2026/third-place" },
  { label: "2026 Final", href: "/tournaments/fifa-world-cup-2026/final" },
  { label: "World Cup 2022", href: "/football/campaigns/brazil-world-cup-2022" },
  { label: "World Cup 2018", href: "/football/campaigns/france-world-cup-2018" },
  { label: "IPL", href: "/cricket/ipl" },
  { label: "NBA Playoffs", href: "/nba/champions" },
  { label: "Stanley Cup", href: "/nhl/champions" },
  { label: "World Series", href: "/mlb/champions" },
  { label: "MLS Cup", href: "/mls/champions" },
];

const TOP_TEAMS: Array<{ label: string; href: string }> = [
  { label: "Brazil", href: "/football/teams/brazil" },
  { label: "Argentina", href: "/football/teams/argentina" },
  { label: "France", href: "/football/teams/france" },
  { label: "Germany", href: "/football/teams/germany" },
  { label: "England", href: "/football/teams/england" },
  { label: "Spain", href: "/football/teams/spain" },
  { label: "Portugal", href: "/football/teams/portugal" },
  { label: "Netherlands", href: "/football/teams/netherlands" },
  { label: "Italy", href: "/football/teams/italy" },
  { label: "Belgium", href: "/football/teams/belgium" },
  { label: "Croatia", href: "/football/teams/croatia" },
  { label: "Uruguay", href: "/football/teams/uruguay" },
  { label: "Mexico", href: "/football/teams/mexico" },
  { label: "USA", href: "/football/teams/usa" },
  { label: "Japan", href: "/football/teams/japan" },
  { label: "South Korea", href: "/football/teams/south-korea" },
  { label: "Morocco", href: "/football/teams/morocco" },
  { label: "Senegal", href: "/football/teams/senegal" },
  { label: "Poland", href: "/football/teams/poland" },
  { label: "Switzerland", href: "/football/teams/switzerland" },
  { label: "India (Cricket)", href: "/cricket/teams/india" },
];

const STAR_PLAYERS: Array<{ label: string; href: string }> = [
  { label: "Lionel Messi", href: "/football/players/lionel-messi" },
  { label: "Messi goals", href: "/football/players/lionel-messi/world-cup-goals" },
  { label: "Messi cards", href: "/football/players/lionel-messi/world-cup-cards" },
  { label: "Cristiano Ronaldo", href: "/football/players/cristiano-ronaldo" },
  { label: "Ronaldo goals", href: "/football/players/cristiano-ronaldo/world-cup-goals" },
  { label: "Ronaldo cards", href: "/football/players/cristiano-ronaldo/world-cup-cards" },
  { label: "Kylian Mbappé", href: "/football/players/kylian-mbappe" },
  { label: "Mbappé goals", href: "/football/players/kylian-mbappe/world-cup-goals" },
  { label: "Mbappé cards", href: "/football/players/kylian-mbappe/world-cup-cards" },
  { label: "Neymar", href: "/football/players/neymar" },
  { label: "Neymar goals", href: "/football/players/neymar/world-cup-goals" },
  { label: "Neymar cards", href: "/football/players/neymar/world-cup-cards" },
  { label: "Vinícius Júnior", href: "/football/players/vinicius-junior" },
  { label: "Vinícius goals", href: "/football/players/vinicius-junior/world-cup-goals" },
  { label: "Vinícius cards", href: "/football/players/vinicius-junior/world-cup-cards" },
  { label: "Jude Bellingham", href: "/football/players/jude-bellingham" },
  { label: "Bellingham goals", href: "/football/players/jude-bellingham/world-cup-goals" },
  { label: "Bellingham cards", href: "/football/players/jude-bellingham/world-cup-cards" },
  // Extra top-searched player stat pages
  { label: "Erling Haaland goals", href: "/football/players/erling-haaland/world-cup-goals" },
  { label: "Harry Kane goals", href: "/football/players/harry-kane/world-cup-goals" },
  { label: "Julián Álvarez goals", href: "/football/players/julian-alvarez/world-cup-goals" },
  { label: "Luis Suárez goals", href: "/football/players/luis-suarez/world-cup-goals" },
  { label: "James Rodríguez goals", href: "/football/players/james-rodriguez/world-cup-goals" },
  { label: "Romelu Lukaku goals", href: "/football/players/romelu-lukaku/world-cup-goals" },
  { label: "Thomas Müller goals", href: "/football/players/thomas-muller/world-cup-goals" },
  { label: "Pelé goals", href: "/football/players/pele/world-cup-goals" },
  { label: "Maradona goals", href: "/football/players/diego-maradona/world-cup-goals" },
  { label: "Ronaldo (R9) goals", href: "/football/players/ronaldo/world-cup-goals" },
  { label: "Miroslav Klose goals", href: "/football/players/miroslav-klose/world-cup-goals" },
  { label: "Gerd Müller goals", href: "/football/players/gerd-muller/world-cup-goals" },
  { label: "Just Fontaine goals", href: "/football/players/just-fontaine/world-cup-goals" },
  { label: "Gary Lineker goals", href: "/football/players/gary-lineker/world-cup-goals" },
  { label: "Batistuta goals", href: "/football/players/gabriel-batistuta/world-cup-goals" },
  { label: "Paolo Rossi goals", href: "/football/players/paolo-rossi/world-cup-goals" },
  { label: "Roberto Baggio goals", href: "/football/players/roberto-baggio/world-cup-goals" },
  { label: "Rivaldo goals", href: "/football/players/rivaldo/world-cup-goals" },
  { label: "Thierry Henry goals", href: "/football/players/thierry-henry/world-cup-goals" },
  { label: "Van Persie goals", href: "/football/players/robin-van-persie/world-cup-goals" },
  { label: "Arjen Robben goals", href: "/football/players/arjen-robben/world-cup-goals" },
  { label: "Sneijder goals", href: "/football/players/wesley-sneijder/world-cup-goals" },
  { label: "David Villa goals", href: "/football/players/david-villa/world-cup-goals" },
  { label: "Forlán goals", href: "/football/players/diego-forlan/world-cup-goals" },
  { label: "Mandžukić goals", href: "/football/players/mario-mandzukic/world-cup-goals" },
  { label: "En-Nesyri goals", href: "/football/players/youssef-en-nesyri/world-cup-goals" },
];

const GUIDES: Array<{ label: string; href: string }> = [
  { label: "Live sports today", href: "/live/today" },
  { label: "Player stats hub", href: "/players" },
  { label: "Football highlights", href: "/highlights" },
  { label: "Cricket players", href: "/cricket/players" },
  { label: "Cricket tournaments", href: "/cricket/tournaments" },
  { label: "ICC Cricket World Cup", href: "/cricket/tournaments/icc-world-cup" },
  { label: "T20 World Cup", href: "/cricket/tournaments/t20-world-cup" },
  { label: "Champions Trophy", href: "/cricket/tournaments/champions-trophy" },
  { label: "Cricket history", href: "/cricket/history" },
  { label: "MLB teams", href: "/mlb/teams" },
  { label: "NBA teams", href: "/nba/teams" },
  { label: "NBA leaders", href: "/nba/leaders" },
  { label: "NHL teams", href: "/nhl/teams" },
  { label: "NHL leaders", href: "/nhl/leaders" },
  { label: "MLS teams", href: "/mls/teams" },
  { label: "MLS leaders", href: "/mls/leaders" },
  { label: "How World Cup knockouts work", href: "/guides/how-fifa-world-cup-knockouts-work" },
  { label: "How many teams in WC 2026", href: "/guides/how-many-teams-fifa-world-cup-2026" },
  { label: "FIFA World Cup 2026 format", href: "/guides/fifa-world-cup-2026-format" },
  { label: "Understanding VAR", href: "/guides/what-is-var" },
  { label: "IPL format explained", href: "/guides/ipl-format" },
  { label: "NBA Playoffs bracket", href: "/guides/nba-playoffs-format" },
];

function Col({ title, items }: { title: string; items: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className="block text-[13px] text-foreground/75 transition hover:text-indigo-400"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterInternalLinks() {
  return (
    <section
      aria-label="Explore across the site"
      className="mx-auto w-full max-w-7xl border-t border-border/60 px-4 py-8 sm:px-6"
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Col title="Popular Tournaments" items={POPULAR_TOURNAMENTS} />
        <Col title="Top Teams" items={TOP_TEAMS} />
        <Col title="Star Players" items={STAR_PLAYERS} />
        <Col title="Guides" items={GUIDES} />
      </div>
      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Cross-league coverage — jump between football, cricket, NBA, MLB, NHL, MLS from any page.{" "}
        <Link to="/" className="underline hover:text-indigo-400">
          Return home
        </Link>
        .
      </p>
    </section>
  );
}
