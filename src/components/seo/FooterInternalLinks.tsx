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
  { label: "India (Cricket)", href: "/cricket/teams/india" },
];

const STAR_PLAYERS: Array<{ label: string; href: string }> = [
  { label: "Lionel Messi", href: "/football/players/lionel-messi" },
  { label: "Cristiano Ronaldo", href: "/football/players/cristiano-ronaldo" },
  { label: "Kylian Mbappé", href: "/football/players/kylian-mbappe" },
  { label: "Erling Haaland", href: "/football/players/erling-haaland" },
  { label: "Neymar Jr", href: "/football/players/neymar-jr" },
  { label: "Vinícius Júnior", href: "/football/players/vinicius-junior" },
  { label: "Jude Bellingham", href: "/football/players/jude-bellingham" },
];

const GUIDES: Array<{ label: string; href: string }> = [
  { label: "Live sports today", href: "/live/today" },
  { label: "Player stats hub", href: "/players" },
  { label: "Football highlights", href: "/highlights" },
  { label: "How the World Cup works", href: "/guides/how-world-cup-works" },
  { label: "Watch football live", href: "/guides/watch-football-live" },
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
