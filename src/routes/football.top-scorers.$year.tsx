import { errorMessage } from "@/lib/error-message";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  listTopScorerYears,
  topScorersAllTime,
  topScorersForYear,
  type TopScorer,
} from "@/lib/seo/programmatic-pages";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState, ErrorState } from "@/components/ui/state";

import { withYearNav } from "@/components/seo/withYearNav";
export const Route = createFileRoute("/football/top-scorers/$year")({
  loader: ({ params }) => {
    if (params.year === "all-time") {
      return { mode: "all-time" as const, scorers: topScorersAllTime(50) };
    }
    const year = Number(params.year);
    if (!Number.isFinite(year) || !listTopScorerYears().includes(year)) throw notFound();
    return { mode: "year" as const, year, scorers: topScorersForYear(year, 25) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData)
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const path = `/football/top-scorers/${params.year}`;
    const top = loaderData.scorers[0];
    let title: string;
    let desc: string;
    if (loaderData.mode === "all-time") {
      title = "All-Time FIFA World Cup Top Scorers — Every Player Ranked | PlaySports";
      desc = top
        ? `Every player's total World Cup goal tally from 1930 to today. ${top.name} (${top.team}) leads with ${top.goals} goals.`
        : "Every player's total World Cup goal tally from 1930 to today.";
    } else {
      title = `Top Scorers of the ${loaderData.year} FIFA World Cup — Full Ranking | PlaySports`;
      desc = top
        ? `The ${loaderData.year} FIFA World Cup top scorers. ${top.name} (${top.team}) finished with ${top.goals} goal${top.goals === 1 ? "" : "s"}. See the full ranking.`
        : `Top goalscorers of the ${loaderData.year} FIFA World Cup.`;
    }
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Top Scorers", path: "/football/top-scorers" },
            { name: loaderData.mode === "all-time" ? "All-Time" : String(loaderData.year), path },
          ]),
        ),
        top
          ? ldScript(
              faqPage([
                {
                  q:
                    loaderData.mode === "all-time"
                      ? "Who has scored the most World Cup goals ever?"
                      : `Who was the top scorer at the ${loaderData.year} World Cup?`,
                  a: `${top.name} of ${top.team} finished ${loaderData.mode === "all-time" ? "top" : `top of the ${loaderData.year} scoring chart`} with ${top.goals} goals.`,
                },
                {
                  q: "Are penalty goals counted?",
                  a: "Yes, penalties count toward a player's tournament goal tally, but own goals are excluded.",
                },
              ]),
            )
          : null,
      ].filter(Boolean) as ReturnType<typeof ldScript>[],
    };
  },
  component: withYearNav(TopScorersPage, {
    basePath: "/football/top-scorers",
    minYear: 1930,
    maxYear: 2026,
    label: "Top scorers",
  }),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load top scorers"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="No data for this tournament"
        description="That top-scorer year is not in the archive."
        action={
          <Link
            to="/football/top-scorers"
            className="inline-flex min-h-11 items-center rounded-full bg-gold/15 px-4 text-sm font-bold text-gold ring-1 ring-gold/30"
          >
            Browse all years
          </Link>
        }
      />
    </div>
  ),
});

function TopScorersPage() {
  const data = Route.useLoaderData();
  const heading =
    data.mode === "all-time"
      ? "All-Time FIFA World Cup Top Scorers"
      : `Top Scorers — ${data.year} FIFA World Cup`;
  const subhead =
    data.mode === "all-time"
      ? "Every player's combined World Cup goal tally from 1930 to today."
      : `Full goalscoring ranking for the ${data.year} FIFA World Cup.`;
  const otherYears = listTopScorerYears().slice(0, 12);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 pb-20">
      <nav className="mb-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link to="/football" className="hover:underline">
          Football
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link to="/football/top-scorers" className="hover:underline">
          Top Scorers
        </Link>
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">{heading}</h1>
      <p className="mb-6 text-muted-foreground">{subhead}</p>

      <div className="mb-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">{heading}</caption>
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">
                #
              </th>
              <th scope="col" className="px-3 py-2 text-left">
                Player
              </th>
              <th scope="col" className="px-3 py-2 text-left">
                Team
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Goals
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Pen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.scorers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No scorers recorded for this tournament.
                </td>
              </tr>
            )}
            {data.scorers.map((s: TopScorer, i: number) => (
              <tr key={s.name + s.team} className="hover:bg-muted/20">
                <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-medium">
                  <Link
                    to="/football/players/$slug"
                    params={{ slug: slugify(s.name) }}
                    className="inline-flex min-h-11 items-center hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <Link
                    to="/football/teams/$slug"
                    params={{ slug: slugify(s.team) }}
                    className="inline-flex min-h-11 items-center hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s.team}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right font-bold tabular-nums">{s.goals}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {s.penalties || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot slot="in_content" />

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Other tournaments</h2>
        <div className="flex flex-wrap gap-2">
          {data.mode !== "all-time" && (
            <Link
              to="/football/top-scorers/$year"
              params={{ year: "all-time" }}
              className="inline-flex min-h-11 items-center rounded-full bg-gold/10 px-3 text-xs font-semibold text-gold hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              All-time
            </Link>
          )}
          {otherYears
            .filter((y) => data.mode === "all-time" || y !== data.year)
            .map((y) => (
              <Link
                key={y}
                to="/football/top-scorers/$year"
                params={{ year: String(y) }}
                className="inline-flex min-h-11 items-center rounded-full bg-muted px-3 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {y}
              </Link>
            ))}
          <Link
            to="/football/top-scorers"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All years →
          </Link>
        </div>
      </section>
    </div>
  );
}
