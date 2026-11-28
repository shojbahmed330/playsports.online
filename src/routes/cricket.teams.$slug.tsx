import { errorMessage } from "@/lib/error-message";
// Phase 2.1 (cricket) â€” SSR-friendly team profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { getCricketTeamBySlug, listCricketTeams } from "@/lib/seo/cricket-entities";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { EmptyState, ErrorState } from "@/components/ui/state";

export const Route = createFileRoute("/cricket/teams/$slug")({
  loader: async ({ params }) => {
    const team = getCricketTeamBySlug(params.slug);
    if (!team) throw notFound();
    const aiFaqs = await readCachedFaqs("cricket_team", params.slug);
    return { team, aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Team not found â€” Cricket" }, { name: "robots", content: "noindex" }],
      };
    }
    const { team } = loaderData;
    const url = canonical(`/cricket/teams/${params.slug}`);
    const image = team.logo ?? "https://www.playsports.online/og-default.png";
    const title = team.isFranchise
      ? `${team.name} â€” IPL squad, captains, titles & home ground`
      : `${team.name} Cricket â€” ICC rankings, squad & recent form`;
    const desc =
      team.isFranchise && team.franchise
        ? `${team.name}: ${team.franchise.titles} IPL title${team.franchise.titles === 1 ? "" : "s"}, captained by ${team.franchise.captain}, home ground ${team.franchise.homeGround}.`
        : `${team.name} â€” current ICC rankings across T20I, ODI and Test formats plus recent form.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          sportsTeam({
            name: team.name,
            path: `/cricket/teams/${params.slug}`,
            sport: "Cricket",
            league: team.isFranchise ? "Indian Premier League" : "ICC",
            logo: team.logo,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Teams", path: "/cricket/teams" },
            { name: team.name, path: `/cricket/teams/${params.slug}` },
          ]),
        ),
        ldScript(
          faqPage(
            loaderData.aiFaqs && loaderData.aiFaqs.length
              ? loaderData.aiFaqs
              : loaderData.team.faqs,
          ),
        ),
      ],
    };
  },
  component: CricketTeamProfile,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Could not load this team"
          message={errorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Team not found"
          description="This team profile is not in the cricket registry yet."
          action={
            <>
              <Link
                to="/cricket/teams"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
              >
                Browse all teams
              </Link>
              <Link
                to="/cricket"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground"
              >
                Cricket hub
              </Link>
            </>
          }
        />
      </div>
    </div>
  ),
});

function CricketTeamProfile() {
  const { team, aiFaqs } = Route.useLoaderData() as {
    team: import("@/lib/seo/cricket-entities").CricketTeamEntity;
    aiFaqs: Array<{ q: string; a: string }> | null;
  };
  const related = listCricketTeams()
    .filter((t) => t.slug !== team.slug && t.isFranchise === team.isFranchise)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/teams" className="hover:underline">
            Teams
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{team.name}</span>
        </nav>

        <header className="flex items-center gap-4 mb-8">
          {team.logo ? (
            <img
              src={team.logo}
              alt=""
              className="w-16 h-16 rounded-lg"
              loading="eager"
              decoding="async"
            />
          ) : team.flag ? (
            <span className="text-5xl" aria-hidden>
              {team.flag}
            </span>
          ) : null}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {team.isFranchise ? "IPL franchise" : "International cricket team"}
              {team.code ? ` Â· ${team.code}` : ""}
            </p>
          </div>
        </header>

        {team.isFranchise && team.franchise ? (
          <section className="grid sm:grid-cols-2 gap-4 mb-10">
            <Info label="Home ground" value={team.franchise.homeGround} />
            <Info label="City" value={team.franchise.city} />
            <Info label="Captain" value={team.franchise.captain} />
            <Info label="Head coach" value={team.franchise.headCoach} />
            <Info label="Founded" value={String(team.franchise.founded)} />
            <Info
              label={`IPL titles (${team.franchise.titles})`}
              value={team.franchise.titleYears.join(", ") || "â€”"}
            />
          </section>
        ) : team.formats.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">ICC rankings</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {team.formats
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((f) => (
                  <div key={f.format} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {f.format}
                    </p>
                    <p className="text-2xl font-bold mt-1">#{f.rank}</p>
                    <p className="text-xs text-muted-foreground mt-1">Rating {f.rating}</p>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Explore {team.name}</h2>
          <nav
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
            aria-label={`Explore ${team.name}`}
          >
            <Link
              to="/cricket/team-history/$slug"
              params={{ slug: team.slug }}
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              Team history â†’
            </Link>
            <Link
              to="/cricket/rankings"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              ICC rankings â†’
            </Link>
            <Link
              to="/cricket/series"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              Series & fixtures â†’
            </Link>
            <Link
              to="/cricket/players"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              Player profiles â†’
            </Link>
          </nav>
        </section>

        <FaqSection
          title={`Frequently asked about ${team.name}`}
          items={
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  ...team.faqs,
                  {
                    q: `What is ${team.name}'s home ground?`,
                    a: team.isFranchise
                      ? `${team.name} plays their home matches at ${team.franchise?.homeGround} in ${team.franchise?.city}.`
                      : `International teams do not have one permanent home ground; ${team.name} play home matches at venues selected by the host board.`,
                  },
                  {
                    q: `Who is the current captain of ${team.name}?`,
                    a: team.isFranchise
                      ? `The ${team.name} are currently captained by ${team.franchise?.captain}.`
                      : `The ${team.name} national team squad is led by their designated format captains.`,
                  },
                ]
          }
        />

        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              Related {team.isFranchise ? "IPL franchises" : "cricket teams"}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/cricket/teams/$slug"
                    params={{ slug: r.slug }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {r.flag ?? ""} {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-medium mt-1">{value}</p>
    </div>
  );
}
