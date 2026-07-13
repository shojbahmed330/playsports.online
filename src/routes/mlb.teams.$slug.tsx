// Phase 2.1 — Canonical MLB team landing page (slug-based, SSR-indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { MlbTeamView } from "@/components/mlb/MlbTeamView";
import { getMlbTeamBySlug, listMlbTeams } from "@/lib/seo/mlb-entities";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/mlb/teams/$slug")({
  loader: ({ params }) => {
    const team = getMlbTeamBySlug(params.slug);
    if (!team) throw notFound();
    return { team };
  },
  head: ({ params, loaderData }) => {
    const t = loaderData?.team;
    const url = canonical(`/mlb/teams/${params.slug}`);
    const title = t
      ? `${t.name} — Schedule, Roster, Stats & Injuries | MLB`
      : "MLB Team — PlaySports";
    const desc = t
      ? `${t.name} (${t.abbr}) — full ${t.league} ${t.division} schedule, active roster, team leaders, season stats and the latest injury report on PlaySports.`
      : "MLB team profile with full schedule, roster, stats and injuries.";
    const faqs = t
      ? [
          { q: `Where do the ${t.short} play their home games?`, a: `${t.name} play their home games in ${t.city} and compete in the ${t.league} ${t.division}.` },
          { q: `What league and division are the ${t.short} in?`, a: `${t.name} play in the ${t.league === "AL" ? "American League" : "National League"} (${t.league}) ${t.division} Division of Major League Baseball.` },
          { q: `What is the ${t.short}' team abbreviation?`, a: `The official MLB abbreviation for ${t.name} is ${t.abbr}.` },
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
            ldScript(sportsTeam({ name: t.name, path: `/mlb/teams/${t.slug}`, sport: "Baseball", league: "Major League Baseball", logo: t.logo })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "MLB", path: "/mlb" },
              { name: "Teams", path: "/mlb/teams" },
              { name: t.name, path: `/mlb/teams/${t.slug}` },
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
      <MlbTeamView id={team.espnId} />
      <RelatedTeams currentSlug={team.slug} league={team.league} division={team.division} />
    </div>
  );
}

function RelatedTeams({ currentSlug, league, division }: { currentSlug: string; league: "AL" | "NL"; division: string }) {
  const same = listMlbTeams().filter((t) => t.league === league && t.division === division && t.slug !== currentSlug);
  return (
    <section className="rounded-2xl bg-card ring-1 ring-border p-4">
      <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">
        Other {league} {division} teams
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {same.map((t) => (
          <li key={t.slug}>
            <Link
              to="/mlb/teams/$slug"
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
      Team not found. <Link to="/mlb/teams" className="underline">Browse all MLB teams</Link>.
    </div>
  );
}
