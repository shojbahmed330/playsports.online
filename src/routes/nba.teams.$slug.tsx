// Phase 2.1 — Canonical NBA team landing page (slug-based, SSR-indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { NbaTeamView } from "@/components/nba/NbaTeamView";
import { getNbaTeamBySlug, listNbaTeams } from "@/lib/seo/nba-entities";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/nba/teams/$slug")({
  loader: ({ params }) => {
    const team = getNbaTeamBySlug(params.slug);
    if (!team) throw notFound();
    return { team };
  },
  head: ({ params, loaderData }) => {
    const t = loaderData?.team;
    const url = canonical(`/nba/teams/${params.slug}`);
    const title = t
      ? `${t.name} — Schedule, Roster, Leaders & Injuries | NBA`
      : "NBA Team — PlaySports";
    const desc = t
      ? `${t.name} (${t.abbr}) — full ${t.division} Division schedule, active roster, team leaders and the latest injury report on PlaySports.`
      : "NBA team profile with full schedule, roster, leaders and injuries.";
    const faqs = t
      ? [
          { q: `Where do the ${t.short} play their home games?`, a: `The ${t.name} play home games in ${t.city} and compete in the ${t.division} Division of the ${t.conference} Conference.` },
          { q: `What conference and division are the ${t.short} in?`, a: `The ${t.name} play in the ${t.division} Division of the ${t.conference} Conference of the National Basketball Association.` },
          { q: `What is the ${t.short}' NBA abbreviation?`, a: `The official NBA abbreviation for the ${t.name} is ${t.abbr}.` },
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        ...(t?.logo ? [{ property: "og:image", content: t.logo }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: t
        ? [
            ldScript(sportsTeam({ name: t.name, path: `/nba/teams/${t.slug}`, sport: "Basketball", league: "National Basketball Association", logo: t.logo })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "NBA", path: "/nba" },
              { name: "Teams", path: "/nba/teams" },
              { name: t.name, path: `/nba/teams/${t.slug}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: TeamSlugPage,
  notFoundComponent: TeamNotFound,
});

function TeamSlugPage() {
  const { team } = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <NbaTeamView id={team.espnId} />
      <RelatedTeams currentSlug={team.slug} division={team.division} conference={team.conference} />
    </div>
  );
}

function RelatedTeams({ currentSlug, division, conference }: { currentSlug: string; division: string; conference: string }) {
  const sameDivision = listNbaTeams().filter((t) => t.division === division && t.slug !== currentSlug);
  return (
    <section className="rounded-2xl bg-card ring-1 ring-border p-4">
      <h2 className="text-xs uppercase tracking-wider font-bold text-orange-300 mb-3">
        Other {division} Division teams ({conference})
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sameDivision.map((t) => (
          <li key={t.slug}>
            <Link
              to="/nba/teams/$slug"
              params={{ slug: t.slug }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border p-2.5"
            >
              <img src={t.logo} alt="" className="size-6 object-contain" loading="lazy" / decoding="async">
              <span className="text-sm font-semibold text-white truncate">{t.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TeamNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Team not found. <Link to="/nba/teams" className="underline">Browse all NBA teams</Link>.
    </div>
  );
}
