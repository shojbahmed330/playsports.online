import { createFileRoute, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator } from "@/lib/zod-validator";
import { z } from "zod";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { OrangePurpleCap } from "@/components/ipl/OrangePurpleCap";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { getIplLeaders, getIplHistory, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
const searchSchema = z.object({
  year: z.union([z.literal("current"), z.coerce.number()]).default("current"),
});

const orangeQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "runs", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "runs", year } }),
    staleTime: 5 * 60_000,
  });
const purpleQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "wickets", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "wickets", year } }),
    staleTime: 5 * 60_000,
  });
const sixesQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "sixes", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "sixes", year } }),
    staleTime: 5 * 60_000,
  });
const historyQO = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl/players")({
  search: {
    middlewares: [stripSearchParams({ year: "current" })],
  },
  head: () => ({
    meta: [
      { title: "IPL Players — Orange Cap, Purple Cap & Six-hitters" },
      {
        name: "description",
        content:
          "IPL player leaderboards: most runs (Orange Cap), most wickets (Purple Cap), most sixes — by season.",
      },
      { property: "og:title", content: "IPL Player Leaderboards" },
      {
        property: "og:description",
        content: "Orange Cap, Purple Cap and six-hitting leaders per season.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/players" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL Players — Orange Cap, Purple Cap & Six-hitters" },
      {
        name: "twitter:description",
        content:
          "IPL player leaderboards: most runs (Orange Cap), most wickets (Purple Cap), most sixes — by season.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/players" }],
    scripts: [
      ldScript(
        collectionPage({
          name: "IPL Players",
          description: "Orange Cap, Purple Cap and six-hitting leaders per season.",
          path: "/cricket/ipl/players",
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "IPL", path: "/cricket/ipl" },
          { name: "Players", path: "/cricket/ipl/players" },
        ]),
      ),
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(orangeQO(deps.year)),
      context.queryClient.ensureQueryData(purpleQO(deps.year)),
      context.queryClient.ensureQueryData(sixesQO(deps.year)),
      context.queryClient.ensureQueryData(historyQO),
    ]),
  component: withHubLinks(PlayersPage, { sport: "ipl", currentPath: "/cricket/ipl/players" }),
  errorComponent: ({ error, reset }) => (
    <IplPageShell title="IPL Player Leaders">
      <ErrorState
        title="Could not load IPL player leaders"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </IplPageShell>
  ),
});

function PlayersPage() {
  const { year } = Route.useSearch();
  const navigate = useNavigate({ from: "/cricket/ipl/players" });
  const orangeQuery = useSuspenseQuery(orangeQO(year));
  const purpleQuery = useSuspenseQuery(purpleQO(year));
  const sixesQuery = useSuspenseQuery(sixesQO(year));
  const { data: hist } = useSuspenseQuery(historyQO);
  const orange = orangeQuery.data;
  const purple = purpleQuery.data;
  const sixes = sixesQuery.data;

  const feedError = orangeQuery.error ?? purpleQuery.error ?? sixesQuery.error;
  const retryFeeds = () =>
    void Promise.all([orangeQuery.refetch(), purpleQuery.refetch(), sixesQuery.refetch()]);
  const seasonLabel = year === "current" ? "this season" : String(year);

  // Use the historical winner for that exact season (or latest) as a
  // visual fallback when the leaderboard fetch produced nothing.
  const histYear = year === "current" ? hist.seasons[0]?.year : year;
  const histRow = hist.seasons.find((s) => s.year === histYear) ?? hist.seasons[0];

  return (
    <IplPageShell
      title="IPL Player Leaders"
      subtitle="Orange Cap (runs), Purple Cap (wickets) and six-hitters"
      right={
        <select
          aria-label="IPL season"
          value={String(year)}
          onChange={(e) => {
            const v = e.target.value;
            navigate({
              search: (p: z.infer<typeof searchSchema>) => ({
                ...p,
                year: v === "current" ? "current" : Number(v),
              }),
            });
          }}
          className="min-h-11 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-nhl)]/40"
        >
          {IPL_SEASON_IDS.map((s) => (
            <option key={String(s.year)} value={String(s.year)} className="bg-background">
              {s.year === "current" ? "Current season" : s.year}
            </option>
          ))}
        </select>
      }
    >
      {feedError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-4 py-3 text-sm text-[var(--color-gold)]"
        >
          <span>The IPL leaderboard feed is temporarily unavailable.</span>
          <button
            type="button"
            onClick={retryFeeds}
            className="inline-flex min-h-10 items-center rounded-full border border-[var(--color-gold)]/40 px-3 text-xs font-bold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20"
          >
            Retry
          </button>
        </div>
      )}

      <OrangePurpleCap
        seasonYear={year}
        orange={orange.leaders}
        purple={purple.leaders}
        fallbackOrange={histRow?.orangeCap ?? null}
        fallbackPurple={histRow?.purpleCap ?? null}
      />

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
            Most sixes — {seasonLabel}
          </h2>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent-nhl)]">
            Six-Hitters
          </span>
        </div>
        {sixes.leaders.length === 0 ? (
          <EmptyState
            title="No six-hitting data yet"
            description="The six-hitting leaderboard appears once matches start."
          />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-background">
            {sixes.leaders.map((p) => (
              <li
                key={p.athleteId}
                className="grid grid-cols-[28px_44px_minmax(0,1fr)_60px_56px] items-center gap-2 px-3 py-2 text-sm"
              >
                <span className="text-center text-[11px] font-black text-foreground">{p.rank}</span>
                {p.headshot ? (
                  <img
                    src={p.headshot}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover bg-card ring-1 ring-border"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-card text-xs font-black text-foreground ring-1 ring-border">
                    {p.athleteName.slice(0, 1)}
                  </span>
                )}
                <PlayerLink
                  name={p.athleteName}
                  athleteId={p.athleteId}
                  className="min-w-0 truncate font-semibold text-foreground"
                >
                  {p.athleteName}
                </PlayerLink>
                <span className="text-[11px] text-foreground">{p.teamAbbr}</span>
                <span className="text-right font-black text-foreground">{p.value} 6s</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </IplPageShell>
  );
}
