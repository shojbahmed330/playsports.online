// Phase 2.1 — Canonical MLS team landing page (slug-based, SSR-indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { MlsTeamView } from "@/components/mls/MlsTeamView";
import { getMlsTeamBySlug, listMlsTeams } from "@/lib/seo/mls-entities";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/mls/teams_/$slug")({
  loader: ({ params }) => {
    const team = getMlsTeamBySlug(params.slug);
    if (!team) throw notFound();
    return { team };
  },
  head: ({ params, loaderData }) => {
    const t = loaderData?.team;
    const url = canonical(`/mls/teams/${params.slug}`);
    const title = t
      ? `${t.name} — Schedule, Roster, Stats & Injuries | MLS`
      : "MLS Team — PlaySports";
    const desc = t
      ? `${t.name} (${t.abbr}) — full ${t.conference} Conference schedule, active roster, team leaders and the latest injury report on PlaySports.`
      : "MLS team profile with full schedule, roster, stats and injuries.";
    const faqs = t
      ? [
          {
            q: `Where do ${t.short} play their home games?`,
            a: `${t.name} play their home games in ${t.city} and compete in the ${t.conference} Conference of Major League Soccer.`,
          },
          {
            q: `What conference are ${t.short} in?`,
            a: `${t.name} play in the ${t.conference} Conference of Major League Soccer (MLS).`,
          },
          {
            q: `What is the ${t.short}' MLS abbreviation?`,
            a: `The official MLS abbreviation for ${t.name} is ${t.abbr}.`,
          },
        ]
      : [];
    return {
      meta: t
        ? [
            { title },
            { name: "description", content: desc },
            { property: "og:title", content: title },
            { property: "og:description", content: desc },
            { property: "og:url", content: url },
            { property: "og:type", content: "profile" },
            { property: "og:site_name", content: "PlaySports" },
            ...(t.logo ? [{ property: "og:image", content: t.logo }] : []),
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: title },
            { name: "twitter:description", content: desc },
          ]
        : [{ title: "MLS Team not found — PlaySports" }, { name: "robots", content: "noindex" }],
      links: [{ rel: "canonical", href: url }],
      scripts: t
        ? [
            ldScript(
              sportsTeam({
                name: t.name,
                path: `/mls/teams/${t.slug}`,
                sport: "Soccer",
                league: "Major League Soccer",
                logo: t.logo,
              }),
            ),
            ldScript(
              breadcrumbList([
                { name: "Home", path: "/" },
                { name: "MLS", path: "/mls" },
                { name: "Teams", path: "/mls/teams" },
                { name: t.name, path: `/mls/teams/${t.slug}` },
              ]),
            ),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: TeamSlugPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this MLS team"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: TeamNotFound,
});

function TeamSlugPage() {
  const { team } = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <MlsTeamView id={team.espnId} />
      <RelatedTeams currentSlug={team.slug} conference={team.conference} />
    </div>
  );
}

function RelatedTeams({
  currentSlug,
  conference,
}: {
  currentSlug: string;
  conference: "Eastern" | "Western";
}) {
  const same = listMlsTeams().filter((t) => t.conference === conference && t.slug !== currentSlug);
  return (
    <section className="rounded-2xl bg-card ring-1 ring-border p-4">
      <h2 className="text-xs uppercase tracking-wider font-bold text-orange-300 mb-3">
        Other {conference} Conference teams
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {same.map((t) => (
          <li key={t.slug}>
            <Link
              to="/mls/teams/$slug"
              params={{ slug: t.slug }}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-card hover:bg-accent ring-1 ring-border p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={t.logo}
                alt=""
                className="size-6 object-contain"
                loading="lazy"
                decoding="async"
              />
              <span className="text-sm font-semibold text-foreground truncate">{t.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TeamNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        title="Team not found"
        description="This MLS club is not in the directory."
        action={
          <Link
            to="/mls/teams"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Browse all MLS teams
          </Link>
        }
      />
    </div>
  );
}
