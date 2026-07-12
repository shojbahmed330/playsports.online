import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import {
  getCompetition,
  formatSeasonLabel,
  type Competition,
} from "@/lib/competitions";
import { FootballHubSwitcher } from "@/components/football/FootballHubSwitcher";
import { CompetitionHero } from "@/components/football/CompetitionHero";
import { CompetitionSubNav } from "@/components/football/CompetitionSubNav";
import {
  breadcrumbList,
  collectionPage,
  sportsOrganization,
  ldScript,
} from "@/lib/seo/jsonld";

const BASE_URL = "https://www.playsports.online";

export const Route = createFileRoute("/football/$comp")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp;
    if (!comp) {
      return {
        meta: [{ title: "Football competition — PlaySports" }, { name: "robots", content: "noindex" }],
      };
    }
    const season = formatSeasonLabel(comp, comp.currentSeason);
    const path = `/football/${params.comp}`;
    const title = `${comp.name} ${season} — Scores, Standings & History`;
    const description = `Live ${comp.name} ${season} scores, standings, fixtures, history and records — every edition in one place.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `${BASE_URL}${path}` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${BASE_URL}${path}` }],
      scripts: [
        ldScript(
          collectionPage({
            name: title,
            description,
            path,
          }),
        ),
        ldScript(
          sportsOrganization({
            name: comp.name,
            path,
            sport: "Football",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: comp.shortName, path },
          ]),
        ),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Competition not found</h1>
        <p className="mt-3 text-muted-foreground">
          We don&apos;t have a page for that competition yet.
        </p>
        <Link
          to="/football"
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to Football
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  component: CompetitionLandingPage,
});

function CompetitionLandingPage() {
  const { comp } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <FootballHubSwitcher activeSlug={comp.slug} />
      <Breadcrumbs />
      <CompetitionHero comp={comp} />
      <CompetitionSubNav comp={comp} />
      <ComingSoon comp={comp} />
      <SiteFooter />
    </div>
  );
}

function ComingSoon({ comp }: { comp: Competition }) {
  const season = formatSeasonLabel(comp, comp.currentSeason);
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          {comp.name} — {season}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          {comp.tagline}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Full landing page with live scores, standings, history and records is rolling out shortly. Use the tabs above to jump ahead as each section ships.
        </p>
      </div>
    </section>
  );
}
