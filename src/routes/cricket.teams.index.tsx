import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { getCricketTeamsForLeague, type CricketTeamSummary } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { getCricketTeamBySlug } from "@/lib/seo/cricket-entities";
import { slugify } from "@/lib/seo/programmatic";
import { EmptyState, ErrorState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/cricket/teams/")({
  loader: async ({ context }) => {
    await Promise.allSettled(
      CRICKET_LEAGUES.map((league) =>
        context.queryClient.ensureQueryData({
          queryKey: ["cricket", "teams", league.id],
          queryFn: () => getCricketTeamsForLeague({ data: { leagueId: league.id } }),
          staleTime: 10 * 60_000,
        }),
      ),
    );
    return null;
  },
  head: () => ({
    meta: [
      { title: "Cricket Teams — Squads across IPL, BBL, PSL & World Cups" },
      {
        name: "description",
        content: "Browse cricket teams across major leagues and international series.",
      },
      { property: "og:title", content: "Cricket Teams" },
      {
        property: "og:description",
        content: "Squads across major leagues and international series.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/teams" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Cricket Teams — Squads across IPL, BBL, PSL & World Cups",
      },
      {
        name: "twitter:description",
        content: "Browse cricket teams across major leagues and international series.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/teams" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Teams", path: "/cricket/teams" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(TeamsIndex, { sport: "cricket", currentPath: "/cricket/teams" }),
});

function TeamsIndex() {
  const fn = useServerFn(getCricketTeamsForLeague);
  const queries = useQueries({
    queries: CRICKET_LEAGUES.map((l) => ({
      queryKey: ["cricket", "teams", l.id],
      queryFn: () => fn({ data: { leagueId: l.id } }),
      staleTime: 10 * 60_000,
    })),
  });

  const [query, setQuery] = useState("");
  const [leagueId, setLeagueId] = useState<string>("any");

  const allTeams = useMemo(() => {
    const seen = new Map<string, CricketTeamSummary & { leagueIds: string[] }>();
    queries.forEach((q, i) => {
      const lid = CRICKET_LEAGUES[i].id;
      for (const t of q.data?.teams ?? []) {
        const ex = seen.get(t.id);
        if (ex) {
          if (!ex.leagueIds.includes(lid)) ex.leagueIds.push(lid);
        } else {
          seen.set(t.id, { ...t, leagueIds: [lid] });
        }
      }
    });
    return Array.from(seen.values());
  }, [queries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTeams
      .filter((t) => leagueId === "any" || t.leagueIds.includes(leagueId))
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.abbr.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTeams, query, leagueId]);

  const loading = queries.some((q) => q.isLoading);
  const allError = queries.length > 0 && queries.every((q) => q.isError);
  const anyError = queries.some((q) => q.isError);
  const retryAll = () => queries.forEach((q) => void q.refetch());

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-[var(--color-accent-mlb)]/40 via-background to-[var(--color-accent-mlb)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[var(--color-accent-mlb)]/15 ring-1 ring-[var(--color-accent-mlb)]/30 grid place-items-center text-2xl">
              🛡️
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent-mlb)] font-bold">
                Cricket
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Teams</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {allTeams.length} teams across {CRICKET_LEAGUES.length} series.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
              type="search"
              aria-label="Search cricket teams"
              className="min-h-11 w-full rounded-full bg-muted py-2 pl-9 pr-3 text-sm outline-none ring-1 ring-border focus:ring-[var(--color-accent-cricket)]/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setLeagueId("any")} className={chip(leagueId === "any")}>
              All
            </button>
            {CRICKET_LEAGUES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLeagueId(l.id)}
                className={chip(leagueId === l.id)}
              >
                <span className="mr-1">{l.emoji}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {anyError && !allError && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/40 px-4 py-2 text-xs text-muted-foreground"
          >
            <span>Some leagues are temporarily unavailable.</span>
            <button
              type="button"
              onClick={retryAll}
              className="min-h-9 rounded-full border border-border px-3 font-bold text-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {allError ? (
          <ErrorState
            title="Teams are temporarily unavailable"
            message="The cricket team feeds did not respond. Try again in a moment."
            onRetry={retryAll}
          />
        ) : loading ? (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            aria-label="Loading cricket teams"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-background motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No teams found"
            description="Try a different spelling or clear the league filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setLeagueId("any");
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-mlb)]/15 px-4 text-sm font-bold text-[var(--color-accent-mlb)] ring-1 ring-[var(--color-accent-mlb)]/30"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((t) => {
              const cardClass =
                "group flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:bg-background";
              const cardBody = (
                <>
                  <TeamCrest
                    src={t.logo}
                    abbr={t.abbr}
                    name={t.name}
                    className="size-10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold leading-tight">{t.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.abbr}
                    </div>
                  </div>
                </>
              );
              const style = t.color ? { boxShadow: `inset 0 0 0 1px ${t.color}33` } : undefined;
              const slug = slugify(t.name);
              const hasProfile = !!getCricketTeamBySlug(slug);
              return hasProfile ? (
                <Link
                  key={t.id}
                  to="/cricket/teams/$slug"
                  params={{ slug }}
                  className={cardClass}
                  style={style}
                >
                  {cardBody}
                </Link>
              ) : (
                <Link
                  key={t.id}
                  to="/cricket/series/$id"
                  params={{ id: t.leagueIds[0] }}
                  className={cardClass}
                  style={style}
                >
                  {cardBody}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return [
    "inline-flex min-h-11 items-center px-3 py-1 rounded-full text-[11px] font-bold ring-1 transition sm:min-h-8",
    active
      ? "bg-gradient-to-r from-[var(--color-accent-mlb)] to-[var(--color-accent-mlb)] text-foreground ring-border"
      : "bg-muted text-foreground ring-border hover:bg-muted",
  ].join(" ");
}
