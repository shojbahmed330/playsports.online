import { errorMessage } from "@/lib/error-message";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findTeam, teamStats, listTeams, slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsTeam, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForFootballTeam } from "@/lib/seo/related";
import { flagOf } from "@/lib/flags";
import { EmptyState, ErrorState } from "@/components/ui/state";

function formatMatchDate(value?: string): string {
  if (!value) return "";
  const d = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const Route = createFileRoute("/football/teams/$slug")({
  loader: async ({ params }) => {
    const team = findTeam("football_wc", params.slug);
    if (!team) throw notFound();
    const aiFaqs = await readCachedFaqs("football_team", params.slug);
    return { team, stats: teamStats(team.name), aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Team not found" }, { name: "robots", content: "noindex" }] };
    }
    const { team, stats, aiFaqs } = loaderData;
    const path = `/football/teams/${params.slug}`;
    const title = `${team.name} â€” FIFA World Cup History, Stats & Top Scorers | PlaySports`;
    const desc = `${team.name} at the FIFA World Cup: ${stats.matchesPlayed} matches, ${stats.w}W-${stats.d}D-${stats.l}L, ${stats.goalsTotal} goals. Appearances, top scorers, recent results.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          sportsTeam({ name: team.name, path, sport: "Football", league: "FIFA World Cup" }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Teams", path: "/football" },
            { name: team.name, path },
          ]),
        ),
        ldScript(
          itemList({
            name: `${team.name} top World Cup scorers`,
            path,
            items: stats.topScorers.slice(0, 10).map((p: { name: string; goals: number }) => ({
              name: `${p.name} (${p.goals} goals)`,
              path: `/football/players/${slugify(p.name)}`,
            })),
          }),
        ),
        ldScript(
          faqPage(
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  {
                    q: `How many World Cup matches has ${team.name} played?`,
                    a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournament appearances (${stats.w}W-${stats.d}D-${stats.l}L).`,
                  },
                  {
                    q: `Who is ${team.name}'s all-time top World Cup scorer?`,
                    a: stats.topScorers[0]
                      ? `${stats.topScorers[0].name} leads with ${stats.topScorers[0].goals} World Cup goals for ${team.name}.`
                      : `${team.name} does not have a recorded leading World Cup scorer yet.`,
                  },
                  {
                    q: `How many World Cup goals has ${team.name} scored?`,
                    a: `${team.name} has scored ${stats.gf} goals and conceded ${stats.ga}.`,
                  },
                  {
                    q: `When did ${team.name} appear at the World Cup?`,
                    a: stats.years.length
                      ? `${team.name} appeared in ${stats.years.join(", ")}.`
                      : `No World Cup appearances on record.`,
                  },
                ],
          ),
        ),
      ],
    };
  },
  component: FootballTeamPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load this team" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Team not found"
        description="This national team is not in the World Cup archive."
      />
    </div>
  ),
});

// Team-specific gradient palettes. Keyed by team name; falls back to a neutral
// but rich gradient so every team page still feels designed.
const TEAM_GRADIENT: Record<string, string> = {
  Brazil: "from-[#009c3b] via-[#ffdf00] to-[#002776]",
  Argentina: "from-[#74acdf] via-[#ffffff] to-[#74acdf]",
  Germany: "from-[#000000] via-[#dd0000] to-[#ffce00]",
  "West Germany": "from-[#000000] via-[#dd0000] to-[#ffce00]",
  Italy: "from-[#008c45] via-[#f4f5f0] to-[#cd212a]",
  France: "from-[#002395] via-[#ffffff] to-[#ed2939]",
  Spain: "from-[#aa151b] via-[#f1bf00] to-[#aa151b]",
  England: "from-[#012169] via-[#ffffff] to-[#c8102e]",
  Portugal: "from-[#006600] via-[#ffcc29] to-[#ff0000]",
  Netherlands: "from-[#ae1c28] via-[#ffffff] to-[#21468b]",
  Uruguay: "from-[#0038a8] via-[#ffffff] to-[#fcd116]",
  Belgium: "from-[#000000] via-[#fdda24] to-[#ef3340]",
  Croatia: "from-[#171796] via-[#ffffff] to-[#ff0000]",
  Mexico: "from-[#006847] via-[#ffffff] to-[#ce1126]",
  "United States": "from-[#3c3b6e] via-[#ffffff] to-[#b22234]",
  USA: "from-[#3c3b6e] via-[#ffffff] to-[#b22234]",
  Japan: "from-[#bc002d] via-[#ffffff] to-[#bc002d]",
  "Korea Republic": "from-[#003478] via-[#ffffff] to-[#c60c30]",
  "South Korea": "from-[#003478] via-[#ffffff] to-[#c60c30]",
  Morocco: "from-[#c1272d] via-[#006233] to-[#c1272d]",
  Ghana: "from-[#006b3f] via-[#fcd116] to-[#ce1126]",
  Senegal: "from-[#00853f] via-[#fdef42] to-[#e31b23]",
  Poland: "from-[#ffffff] via-[#ffffff] to-[#dc143c]",
  Sweden: "from-[#004b87] via-[#ffcd00] to-[#004b87]",
  Denmark: "from-[#c60c30] via-[#ffffff] to-[#c60c30]",
  Switzerland: "from-[#da291c] via-[#ffffff] to-[#da291c]",
  Colombia: "from-[#fcd116] via-[#003893] to-[#ce1126]",
  Chile: "from-[#0039a6] via-[#ffffff] to-[#d52b1e]",
  Peru: "from-[#d91023] via-[#ffffff] to-[#d91023]",
  Ecuador: "from-[#ffdd00] via-[#0072ce] to-[#ef3340]",
  Nigeria: "from-[#008751] via-[#ffffff] to-[#008751]",
  Cameroon: "from-[#007a5e] via-[#ce1126] to-[#fcd116]",
  Australia: "from-[#00843d] via-[#ffcd00] to-[#00843d]",
  Canada: "from-[#ff0000] via-[#ffffff] to-[#ff0000]",
  "Saudi Arabia": "from-[#006c35] via-[#ffffff] to-[#006c35]",
  Iran: "from-[#239f40] via-[#ffffff] to-[#da0000]",
  "Costa Rica": "from-[#002b7f] via-[#ffffff] to-[#ce1126]",
  Serbia: "from-[#c6363c] via-[#0c4076] to-[#ffffff]",
  Russia: "from-[#ffffff] via-[#0039a6] to-[#d52b1e]",
  "Soviet Union": "from-[#cc0000] via-[#ffcc00] to-[#cc0000]",
  Hungary: "from-[#cd2a3e] via-[#ffffff] to-[#436f4d]",
  Austria: "from-[#ed2939] via-[#ffffff] to-[#ed2939]",
  Czechoslovakia: "from-[#11457e] via-[#ffffff] to-[#d7141a]",
  "Czech Republic": "from-[#11457e] via-[#ffffff] to-[#d7141a]",
  Turkey: "from-[#e30a17] via-[#ffffff] to-[#e30a17]",
  Bulgaria: "from-[#ffffff] via-[#00966e] to-[#d62612]",
  Romania: "from-[#002b7f] via-[#fcd116] to-[#ce1126]",
  Norway: "from-[#ef2b2d] via-[#ffffff] to-[#002868]",
  Wales: "from-[#00b140] via-[#ffffff] to-[#d30731]",
  Scotland: "from-[#005eb8] via-[#ffffff] to-[#005eb8]",
  "Republic of Ireland": "from-[#009a49] via-[#ffffff] to-[#ff7900]",
  Ireland: "from-[#009a49] via-[#ffffff] to-[#ff7900]",
  Paraguay: "from-[#d52b1e] via-[#ffffff] to-[#0038a8]",
  Bolivia: "from-[#da291c] via-[#f4e400] to-[#007a33]",
  Tunisia: "from-[#e70013] via-[#ffffff] to-[#e70013]",
  Algeria: "from-[#006233] via-[#ffffff] to-[#d21034]",
  Egypt: "from-[#c8102e] via-[#ffffff] to-[#000000]",
  Qatar: "from-[#8a1538] via-[#ffffff] to-[#8a1538]",
  Panama: "from-[#005293] via-[#ffffff] to-[#d21034]",
  Honduras: "from-[#0073cf] via-[#ffffff] to-[#0073cf]",
  Slovenia: "from-[#005ce6] via-[#ffffff] to-[#e2001a]",
  Slovakia: "from-[#0b4ea2] via-[#ffffff] to-[#ee1c25]",
  Ukraine: "from-[#0057b8] via-[#ffd700] to-[#0057b8]",
  Greece: "from-[#0d5eaf] via-[#ffffff] to-[#0d5eaf]",
};

function gradientFor(name: string) {
  return TEAM_GRADIENT[name] ?? "from-[var(--color-accent-cricket)] via-[var(--color-gold)] to-[var(--color-live)]";
}

function FootballTeamPage() {
  const { team, stats, aiFaqs } = Route.useLoaderData();
  const params = Route.useParams();

  const flag = flagOf(team.name);
  const gradient = gradientFor(team.name);
  const winPct = stats.matchesPlayed ? Math.round((stats.w / stats.matchesPlayed) * 100) : 0;
  const gd = stats.gf - stats.ga;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative container mx-auto px-4 pt-6 pb-8 max-w-5xl">
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] uppercase tracking-widest font-semibold text-foreground mb-5 flex items-center gap-1.5"
          >
            <Link
              to="/"
              className="inline-flex min-h-11 items-center hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
            >
              Home
            </Link>
            <span className="opacity-60" aria-hidden="true">
              /
            </span>
            <Link
              to="/football"
              className="inline-flex min-h-11 items-center hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
            >
              Football
            </Link>
            <span className="opacity-60" aria-hidden="true">
              /
            </span>
            <span className="text-foreground" aria-current="page">
              Teams
            </span>
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className="shrink-0 grid place-items-center h-20 w-20 sm:h-28 sm:w-28 rounded-3xl bg-muted backdrop-blur-md ring-2 ring-border text-5xl sm:text-7xl shadow-2xl"
              aria-hidden
            >
              {flag}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold text-foreground">
                FIFA World Cup Â· National Team
              </div>
              <h1 className="mt-1 text-3xl sm:text-5xl font-black text-foreground drop-shadow-lg truncate">
                {team.name}
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-foreground font-medium">
                <span className="tabular-nums">{stats.matchesPlayed}</span> matches Â·{" "}
                <span className="tabular-nums">{stats.years.length}</span> tournaments Â·{" "}
                <span className="tabular-nums">{winPct}%</span> win rate
              </p>
            </div>
          </div>

          {/* Stat pills â€” mobile scroll, desktop grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            <StatCard label="Played" value={stats.matchesPlayed} tone="slate" />
            <StatCard label="Wins" value={stats.w} tone="emerald" />
            <StatCard label="Draws" value={stats.d} tone="amber" />
            <StatCard label="Losses" value={stats.l} tone="rose" />
            <StatCard
              label="Goal Diff"
              value={`${gd >= 0 ? "+" : ""}${gd}`}
              sub={`${stats.gf}â€“${stats.ga}`}
              tone={gd >= 0 ? "sky" : "rose"}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl space-y-8 mt-8">
        {/* TOP SCORERS */}
        <Section eyebrow="Legends" title={`Top Scorers for ${team.name}`} accent={gradient}>
          {stats.topScorers.length === 0 ? (
            <EmptyState
              title="No scorers on record"
              description={`No World Cup goals are recorded for ${team.name} players.`}
            />
          ) : (
            <ol className="grid gap-2">
              {stats.topScorers.map((p: { name: string; goals: number }, i: number) => (
                <li key={p.name}>
                  <Link
                    to="/football/players/$slug"
                    params={{ slug: slugify(p.name) }}
                    className="group flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 hover:border-primary/60 hover:bg-accent/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={`grid place-items-center h-9 w-9 shrink-0 rounded-full font-black text-sm ${
                        i === 0
                          ? "bg-[var(--color-gold)] text-background"
                          : i === 1
                            ? "bg-muted text-background"
                            : i === 2
                              ? "bg-[var(--color-gold)] text-background"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 font-semibold truncate group-hover:text-primary">
                      {p.name}
                    </span>
                    <span className="shrink-0 flex items-baseline gap-1">
                      <span className="text-2xl font-black tabular-nums">{p.goals}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        goals
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Section>

        <AdSlot slot="in_content" />

        {/* RECENT MATCHES */}
        <Section eyebrow="Form" title="Recent World Cup Matches" accent={gradient}>
          {stats.recentMatches.length === 0 ? (
            <EmptyState
              title="No recent matches"
              description={`No match results are recorded for ${team.name} in the archive.`}
            />
          ) : (
            <ul className="space-y-2">
              {stats.recentMatches.map(
                (
                  m: {
                    match_date?: string;
                    round?: string;
                    home_team: string;
                    home_score: number;
                    away_score: number;
                    away_team: string;
                  },
                  i: number,
                ) => {
                  const isHome = m.home_team === team.name;
                  const teamScore = isHome ? m.home_score : m.away_score;
                  const oppScore = isHome ? m.away_score : m.home_score;
                  const opp = isHome ? m.away_team : m.home_team;
                  const result = teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
                  const resultColor =
                    result === "W"
                      ? "bg-[var(--color-accent-cricket)]/20 text-[var(--color-accent-cricket)] ring-[var(--color-accent-cricket)]/40"
                      : result === "L"
                        ? "bg-[var(--color-live)]/20 text-[var(--color-live)] ring-[var(--color-live)]/40"
                        : "bg-[var(--color-gold)]/20 text-[var(--color-gold)] ring-[var(--color-gold)]/40";
                  return (
                    <li
                      key={i}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <span
                        className={`grid place-items-center h-9 w-9 shrink-0 rounded-lg font-black text-sm ring-1 ${resultColor}`}
                      >
                        <span aria-hidden="true">{result}</span>
                        <span className="sr-only">
                          {result === "W" ? "Win" : result === "L" ? "Loss" : "Draw"}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {[formatMatchDate(m.match_date), m.round].filter(Boolean).join(" Â· ")}
                        </div>
                        <div className="text-sm font-semibold truncate">
                          {isHome ? "vs" : "@"}{" "}
                          <span className="mr-1" aria-hidden="true">
                            {flagOf(opp)}
                          </span>
                          {opp}
                        </div>
                      </div>
                      <div className="shrink-0 font-mono font-black text-lg tabular-nums">
                        {teamScore}
                        <span className="mx-0.5 text-muted-foreground">â€“</span>
                        {oppScore}
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </Section>

        {/* APPEARANCES */}
        <Section eyebrow="History" title="Tournament Appearances" accent={gradient}>
          <div className="flex flex-wrap gap-2">
            {stats.years.map((y: number) => (
              <Link
                key={y}
                to="/football/countries/$slug/world-cup-{$year}"
                params={{ slug: params.slug, year: String(y) }}
                className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-br from-card to-muted border border-border px-3 font-mono text-sm font-bold hover:border-primary hover:text-primary hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {y}
              </Link>
            ))}
          </div>
        </Section>

        {/* ALL SCORERS */}
        {stats.allScorers && stats.allScorers.length > stats.topScorers.length && (
          <Section
            eyebrow="Complete list"
            title={`All ${team.name} World Cup Scorers`}
            accent={gradient}
          >
            <div className="flex flex-wrap gap-1.5">
              {stats.allScorers.map((p: { name: string; goals: number }) => (
                <Link
                  key={p.name}
                  to="/football/players/$slug"
                  params={{ slug: slugify(p.name) }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-card border border-border px-2.5 text-xs hover:border-primary hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="tabular-nums font-black text-primary">{p.goals}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <FaqSection
          title={`Frequently asked about ${team.name}`}
          items={
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  {
                    q: `How many World Cup matches has ${team.name} played?`,
                    a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournament appearances, with a record of ${stats.w} wins, ${stats.d} draws, and ${stats.l} losses.`,
                  },
                  {
                    q: `Who is ${team.name}'s all-time top World Cup scorer?`,
                    a: stats.topScorers[0]
                      ? `${stats.topScorers[0].name} is the leading World Cup scorer for ${team.name} with ${stats.topScorers[0].goals} goals.`
                      : `${team.name} does not have a recorded leading World Cup scorer yet.`,
                  },
                  {
                    q: `How many World Cup goals has ${team.name} scored in total?`,
                    a: `${team.name} has scored ${stats.gf} goals and conceded ${stats.ga} in their World Cup history, resulting in a goal difference of ${stats.gf - stats.ga}.`,
                  },
                  {
                    q: `When was ${team.name}'s last World Cup appearance?`,
                    a: stats.years.length
                      ? `${team.name} last appeared in the FIFA World Cup in ${stats.years[stats.years.length - 1]}.`
                      : `No World Cup appearances on record for ${team.name}.`,
                  },
                ]
          }
        />

        {/* EXPLORE OTHER TEAMS */}
        <Section eyebrow="Discover" title="Explore more teams" accent={gradient}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {listTeams()
              .filter((t) => t.slug !== team.slug)
              .slice(0, 24)
              .map((t) => (
                <Link
                  key={t.slug}
                  to="/football/teams/$slug"
                  params={{ slug: t.slug }}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:border-primary hover:bg-accent transition-all min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-xl shrink-0" aria-hidden>
                    {flagOf(t.name)}
                  </span>
                  <span className="text-sm font-semibold truncate">{t.name}</span>
                </Link>
              ))}
          </div>
        </Section>

        <RelatedLinks
          title={`More World Cup pages for ${team.name}`}
          links={relatedForFootballTeam(team.name, 18)}
        />
      </main>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${accent}`} />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            {eyebrow}
          </div>
          <h2 className="text-lg sm:text-xl font-black leading-tight truncate">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
  className = "",
}: {
  label: string;
  value: number | string;
  sub?: string;
  tone: "slate" | "emerald" | "amber" | "rose" | "sky";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "from-background to-background text-foreground",
    emerald: "from-[var(--color-accent-cricket)]/40 to-[var(--color-accent-cricket)]/10 text-[var(--color-accent-cricket)]",
    amber: "from-[var(--color-gold)]/40 to-[var(--color-gold)]/10 text-[var(--color-gold)]",
    rose: "from-[var(--color-live)]/40 to-[var(--color-live)]/10 text-[var(--color-live)]",
    sky: "from-[var(--color-accent-mlb)]/40 to-[var(--color-accent-mlb)]/10 text-[var(--color-accent-mlb)]",
  };
  return (
    <div
      className={`relative rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${tones[tone]} ring-1 ring-border backdrop-blur-sm shadow-lg ${className}`}
    >
      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold opacity-80">
        {label}
      </div>
      <div className="mt-0.5 text-2xl sm:text-3xl font-black tabular-nums leading-tight">
        {value}
      </div>
      {sub && <div className="text-[10px] font-mono opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}
