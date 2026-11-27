import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { EuroRecordsPage } from "@/components/football/EuroRecordsPage";
import { CopaRecordsPage } from "@/components/football/CopaRecordsPage";
import { EURO_TOP_SCORERS } from "@/lib/euro-records";
import { COPA_TOP_SCORERS_LB } from "@/lib/copa-records";
import { Goal, Trophy, Users, Award, CalendarRange } from "lucide-react";

const CATEGORIES = [
  {
    slug: "top-scorers-all-time",
    label: "Top Scorers (All-Time)",
    icon: Goal,
    blurb: "Career goals across every edition.",
  },
  {
    slug: "most-titles",
    label: "Most Titles",
    icon: Trophy,
    blurb: "Nations & clubs ranked by trophies won.",
  },
  {
    slug: "most-appearances",
    label: "Most Appearances",
    icon: Users,
    blurb: "Players with the most matches played.",
  },
  {
    slug: "records-and-firsts",
    label: "Records & Firsts",
    icon: Award,
    blurb: "Youngest scorer, biggest win, longest streaks.",
  },
];

export const Route = createFileRoute("/football/$comp/records/")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Records" }, { name: "robots", content: "noindex" }] };
    if (comp.slug === "euro") {
      const title = "UEFA Euro Records — Top Scorers, Most Titles, Golden Boot & Firsts";
      const description =
        "Every UEFA European Championship record — Cristiano Ronaldo's 14 goals, Spain's 4 titles, Platini's 9-goal single-Euro record and every historical first since 1960.";
      const url = canonical("/football/euro/records");
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "UEFA Euro all-time top scorers",
        itemListElement: EURO_TOP_SCORERS.map((r) => ({
          "@type": "ListItem",
          position: r.rank,
          name: `${r.name} (${r.nation}) — ${r.value} goals`,
        })),
      };
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: "PlaySports" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          ldScript(
            breadcrumbList([
              { name: "Home", path: "/" },
              { name: "Football", path: "/football" },
              { name: "Euro", path: "/football/euro" },
              { name: "Records", path: "/football/euro/records" },
            ]),
          ),
          { type: "application/ld+json", children: JSON.stringify(itemList) },
        ],
      };
    }
    if (comp.slug === "copa-america") {
      const title = "Copa América Records — Top Scorers, Most Titles, Golden Boot & Firsts";
      const description =
        "Every Copa América record — Méndez & Zizinho's 17 goals, Argentina's 16 titles, Messi's 39 appearances and every historical first since 1916.";
      const url = canonical("/football/copa-america/records");
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Copa América all-time top scorers",
        itemListElement: COPA_TOP_SCORERS_LB.map((r) => ({
          "@type": "ListItem",
          position: r.rank,
          name: `${r.name} (${r.nation}) — ${r.value} goals`,
        })),
      };
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: "PlaySports" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          ldScript(
            breadcrumbList([
              { name: "Home", path: "/" },
              { name: "Football", path: "/football" },
              { name: "Copa América", path: "/football/copa-america" },
              { name: "Records", path: "/football/copa-america/records" },
            ]),
          ),
          { type: "application/ld+json", children: JSON.stringify(itemList) },
        ],
      };
    }
    return buildCompetitionHead({
      comp,
      section: "Records",
      path: `/football/${comp.slug}/records`,
      descriptionOverride: `${comp.name} all-time records — top scorers, most titles, longest streaks and every historical first.`,
    });
  },
  component: RecordsRoute,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load records" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Competition not found"
        description="This competition is not in the football directory."
        action={
          <Link
            to="/football"
            className="inline-flex min-h-11 items-center rounded-full bg-primary/15 px-4 text-sm font-bold text-primary ring-1 ring-primary/30"
          >
            Back to football
          </Link>
        }
      />
    </div>
  ),
});

function RecordsRoute() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  if (comp.slug === "euro") return <EuroRecordsPage />;
  if (comp.slug === "copa-america") return <CopaRecordsPage />;
  return <GenericRecordsPage />;
}

function GenericRecordsPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} Records</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Every stat scoped to {comp.shortName} only — no cross-competition mixing.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <li key={cat.slug}>
              <Link
                to="/football/$comp/records/$category"
                params={{ comp: comp.slug, category: cat.slug }}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 size-9 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                    <Icon aria-hidden="true" className="size-4 text-foreground" />
                  </span>
                  <div>
                    <div className="font-semibold group-hover:text-foreground">{cat.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.blurb}</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            to="/football/$comp/records/decades"
            params={{ comp: comp.slug }}
            className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.06] transition h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 size-9 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                <CalendarRange aria-hidden="true" className="size-4 text-foreground" />
              </span>
              <div>
                <div className="font-semibold group-hover:text-foreground">Records by Decade</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Champions and roll-up stats grouped by 10-year periods.
                </div>
              </div>
            </div>
          </Link>
        </li>
      </ul>
    </CompetitionPageShell>
  );
}
