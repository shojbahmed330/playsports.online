// Phase 2.1 — NBA Finals edition landing page (SSR, indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  getNbaFinalsByYear,
  listNbaFinalsYears,
  listNbaFinals,
  getNbaTeamByName,
} from "@/lib/seo/nba-entities";
import { breadcrumbList, faqPage, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withYearNav } from "@/components/seo/withYearNav";
export const Route = createFileRoute("/nba/finals/$year")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const edition = getNbaFinalsByYear(year);
    if (!edition) throw notFound();
    return { edition, year };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.edition;
    const url = canonical(`/nba/finals/${params.year}`);
    const title = e
      ? `${e.year} NBA Finals — ${e.champion} vs ${e.runnerUp} (${e.result})`
      : `${params.year} NBA Finals`;
    const desc = e
      ? `${e.year} NBA Finals: ${e.champion} defeated the ${e.runnerUp} ${e.result}. Finals MVP: ${e.fmvp}. Full series recap on PlaySports.`
      : "NBA Finals recap.";
    const faqs = e
      ? [
          {
            q: `Who won the ${e.year} NBA Finals?`,
            a: `The ${e.champion} won the ${e.year} NBA Finals, defeating the ${e.runnerUp} ${e.result}.`,
          },
          {
            q: `Who won the ${e.year} Finals MVP?`,
            a: `${e.fmvp} was awarded the Bill Russell NBA Finals MVP for the ${e.year} NBA Finals.`,
          },
          {
            q: `What was the score of the ${e.year} NBA Finals?`,
            a: `The ${e.champion} won the series ${e.result} over the ${e.runnerUp}.`,
          },
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(e ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: e
        ? [
            ldScript(
              sportsEvent({
                name: `${e.year} NBA Finals`,
                path: `/nba/finals/${e.year}`,
                sport: "Basketball",
                startDate: `${e.year}-06-01`,
                homeTeam: e.champion,
                awayTeam: e.runnerUp,
                status: "ended",
              }),
            ),
            ldScript(
              breadcrumbList([
                { name: "Home", path: "/" },
                { name: "NBA", path: "/nba" },
                { name: "History", path: "/nba/history" },
                { name: `${e.year} NBA Finals`, path: `/nba/finals/${e.year}` },
              ]),
            ),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: withYearNav(FinalsPage, {
    basePath: "/nba/finals",
    minYear: 1947,
    maxYear: 2025,
    label: "NBA Finals",
  }),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load these NBA Finals"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="py-10">
      <EmptyState
        title="NBA Finals edition not found"
        description="This edition is not in the archive."
        action={
          <Link
            to="/nba/history"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Browse NBA history
          </Link>
        }
      />
    </div>
  ),
});

function FinalsPage() {
  const { edition, year } = Route.useLoaderData();
  const years = listNbaFinalsYears();
  const idx = years.indexOf(year);
  const prev = years[idx + 1];
  const next = years[idx - 1];
  const related = listNbaFinals()
    .filter((w) => w.champion === edition.champion && w.year !== year)
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#17408b] to-[#f58426]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">
            NBA · Finals
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{edition.year} NBA Finals</h1>
          <p className="text-sm text-white/85 mt-1">
            <TeamLink name={edition.champion} /> defeated <TeamLink name={edition.runnerUp} />{" "}
            {edition.result}
          </p>
          <p className="text-xs text-orange-200 mt-2 font-semibold uppercase tracking-wider">
            Finals MVP: <PlayerLink name={edition.fmvp} />
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Champion" value={edition.champion} />
        <Stat label="Runner-up" value={edition.runnerUp} />
        <Stat label="Series result" value={edition.result} />
      </section>

      <div className="flex items-center justify-between text-sm">
        {prev ? (
          <Link
            to="/nba/finals/$year"
            params={{ year: String(prev) }}
            className="inline-flex min-h-11 items-center font-semibold text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← {prev} NBA Finals
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/nba/finals/$year"
            params={{ year: String(next) }}
            className="inline-flex min-h-11 items-center font-semibold text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {next} NBA Finals →
          </Link>
        ) : (
          <span />
        )}
      </div>

      {related.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-orange-300 mb-3">
            Other {edition.champion} championships
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {related.map((w) => (
              <li key={w.year}>
                <Link
                  to="/nba/finals/$year"
                  params={{ year: String(w.year) }}
                  className="flex min-h-11 flex-col justify-center rounded-xl bg-muted/40 hover:bg-accent ring-1 ring-border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-black tabular-nums text-orange-300">{w.year}</span>
                  <span className="text-foreground">vs {w.runnerUp}</span>
                  <span className="text-muted-foreground">({w.result})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </div>
      <div className="mt-1 text-lg font-extrabold text-foreground">{value}</div>
    </div>
  );
}

function TeamLink({ name }: { name: string }) {
  const t = getNbaTeamByName(name);
  if (t) {
    return (
      <Link
        to="/nba/teams/$slug"
        params={{ slug: t.slug }}
        className="inline-flex min-h-11 items-center font-bold text-white hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {name}
      </Link>
    );
  }
  return <span className="font-bold text-white">{name}</span>;
}

function PlayerLink({ name }: { name: string }) {
  if (name.includes(" & ") || name.includes(",")) return <span className="text-white">{name}</span>;
  return (
    <Link
      to="/nba/players/$slug"
      params={{ slug: slugify(name) }}
      className="inline-flex min-h-11 items-center text-white hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {name}
    </Link>
  );
}
