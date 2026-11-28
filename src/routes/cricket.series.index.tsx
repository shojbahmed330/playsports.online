import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Flame, CalendarClock, Globe2, ChevronRight } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import {
  getCricketSeriesList,
  getBilateralSeriesList,
  type BilateralTour,
} from "@/lib/cricket.functions";
import { CRICKET_LEAGUE_BY_ID } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";

const search = z.object({
  fmt: fallback(z.enum(["any", "t20", "odi", "test"]), "any").default("any"),
  group: fallback(z.enum(["any", "international", "franchise", "domestic"]), "any").default("any"),
});
type SeriesSearch = z.infer<typeof search>;

export const Route = createFileRoute("/cricket/series/")({
  validateSearch: zodValidator(search),
  search: {
    middlewares: [stripSearchParams({ fmt: "any", group: "any" })],
  },
  loader: async ({ context }) => {
    // The curated list is fast enough to block SSR. The bilateral builder
    // scans hundreds of catalogue ids, so it stays a background prefetch.
    await context.queryClient
      .ensureQueryData({
        queryKey: ["cricket", "series-list"],
        queryFn: () => getCricketSeriesList(),
        staleTime: 5 * 60_000,
      })
      .catch(() => null);
    return null;
  },
  head: () => ({
    meta: [
      { title: "Cricket Series â€” IPL, BBL, World Cups & more" },
      { name: "description", content: "All major cricket series, live counts, and fixtures." },
      { property: "og:title", content: "Cricket Series Hub" },
      {
        property: "og:description",
        content: "Every major cricket series with live fixture counts.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/series" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cricket Series â€” IPL, BBL, World Cups & more" },
      {
        name: "twitter:description",
        content: "All major cricket series, live counts, and fixtures.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/series" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Series", path: "/cricket/series" },
        ]),
      ),
    ],
  }),
  component: SeriesIndex,
});

function SeriesIndex() {
  const { fmt, group } = Route.useSearch() as SeriesSearch;
  const navigate = Route.useNavigate();
  const fn = useServerFn(getCricketSeriesList);
  const q = useQuery({
    queryKey: ["cricket", "series-list"],
    queryFn: () => fn({}),
    staleTime: 5 * 60_000,
    refetchInterval: (qq) => {
      const data = qq.state.data as { series?: Array<{ liveCount: number }> } | undefined;
      return data?.series?.some((s) => s.liveCount > 0) ? 60_000 : false;
    },
  });

  const tourFn = useServerFn(getBilateralSeriesList);
  const tourQ = useQuery({
    queryKey: ["cricket", "bilateral-tours"],
    queryFn: () => tourFn({}),
    staleTime: 5 * 60_000,
    refetchInterval: (qq) => {
      const data = qq.state.data as { tours?: Array<{ liveCount: number }> } | undefined;
      return data?.tours?.some((t) => t.liveCount > 0) ? 60_000 : false;
    },
  });
  const tours: BilateralTour[] = tourQ.data?.tours ?? [];

  const series = q.data?.series ?? [];
  const filtered = useMemo(() => {
    return series
      .filter((s) => {
        if (fmt !== "any" && s.format !== fmt) return false;
        if (group !== "any" && s.group !== group) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.liveCount !== b.liveCount) return b.liveCount - a.liveCount;
        if (a.upcomingCount !== b.upcomingCount) return b.upcomingCount - a.upcomingCount;
        return a.longName.localeCompare(b.longName);
      });
  }, [series, fmt, group]);

  type S = { fmt: typeof fmt; group: typeof group };
  const set = (patch: Partial<S>) =>
    navigate({ search: (prev: S) => ({ ...prev, ...patch }), replace: true });

  return (
    <div className="min-h-screen">
      <SportNav liveCount={series.reduce((s, x) => s + x.liveCount, 0)} />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-[var(--color-gold)]/40 via-background to-[var(--color-accent-cricket)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[var(--color-gold)]/15 ring-1 ring-[var(--color-gold)]/30 grid place-items-center text-2xl">
              ðŸ†
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold">
                Cricket
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">All Series</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Tap a series for fixtures, live scores and standings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {tours.length > 0 && (
          <section className="rounded-2xl border border-[var(--color-accent-mlb)]/20 bg-gradient-to-br from-[var(--color-accent-mlb)]/40 via-background to-[var(--color-accent-cricket)]/30 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-base font-bold inline-flex items-center gap-2">
                <Globe2 className="size-5 text-[var(--color-accent-mlb)]" /> Bilateral Tours
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-accent-mlb)]/80 font-bold">
                  {tours.length}
                </span>
              </h2>
              <Link
                to="/cricket/scores"
                search={{ tab: "live", date: "", league: "internationals", fmt: "any" }}
                className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[var(--color-accent-mlb)] hover:text-[var(--color-accent-mlb)]"
              >
                Live & fixtures <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tours.slice(0, 9).map((t) => (
                <Link
                  key={t.id}
                  to="/cricket/series/$id"
                  params={{ id: t.id }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-background p-3 hover:border-[var(--color-accent-mlb)]/40 hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-[var(--color-accent-mlb)]">
                    ðŸŒ Bilateral{t.format ? ` Â· ${t.format}` : ""}
                  </div>
                  <div className="font-bold leading-tight mt-1 line-clamp-2">{t.name}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                    {t.liveCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-live)]/15 text-[var(--color-live)] ring-1 ring-[var(--color-live)]/30 font-bold">
                        <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none" />{" "}
                        {t.liveCount} live
                      </span>
                    )}
                    {t.upcomingCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30 font-bold">
                        <CalendarClock className="size-3" /> {t.upcomingCount}
                      </span>
                    )}
                    {t.finishedCount > 0 && t.liveCount === 0 && (
                      <span className="text-[10px] text-muted-foreground">{t.finishedCount} played</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {tourQ.isLoading && (
          <section aria-label="Loading bilateral tours">
            <LoadingState label="Loading bilateral tours" rows={2} />
          </section>
        )}
        {tourQ.isError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">Bilateral tours could not be loaded.</span>
            <button
              type="button"
              onClick={() => void tourQ.refetch()}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-bold hover:bg-muted"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup label="Format">
              {(["any", "t20", "odi", "test"] as const).map((v) => (
                <Chip key={v} active={fmt === v} onClick={() => set({ fmt: v })}>
                  {v === "any" ? "All" : v.toUpperCase()}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Type">
              {(["any", "international", "franchise", "domestic"] as const).map((v) => (
                <Chip key={v} active={group === v} onClick={() => set({ group: v })}>
                  {v === "any" ? "All" : v[0].toUpperCase() + v.slice(1)}
                </Chip>
              ))}
            </FilterGroup>
          </div>

          {q.isError ? (
            <ErrorState
              title="Series are temporarily unavailable"
              message="The series feed did not respond. Try again, or browse the full cricket schedule."
              onRetry={() => void q.refetch()}
            />
          ) : q.isLoading ? (
            <LoadingState label="Loading cricket series" rows={4} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No series match your filters"
              description="Clear the format or type filter to see every tracked series."
              action={
                <button
                  type="button"
                  onClick={() => set({ fmt: "any", group: "any" })}
                  className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((s) => {
                const meta = CRICKET_LEAGUE_BY_ID[s.id];
                return (
                  <Link
                    key={s.id}
                    to="/cricket/series/$id"
                    params={{ id: s.id }}
                    className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${meta?.bgGrad ?? "from-background to-background"} p-4 hover:border-border hover:-translate-y-0.5 transition`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-12 rounded-xl ${meta?.chipBg ?? "bg-muted"} ring-1 ${meta?.ring ?? "ring-border"} grid place-items-center text-2xl shrink-0`}
                      >
                        {s.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[10px] uppercase tracking-[0.18em] font-bold ${meta?.accent ?? "text-[var(--color-accent-cricket)]"}`}
                        >
                          {s.label} Â· {s.format.toUpperCase()}
                        </div>
                        <div className="font-bold leading-tight truncate">{s.longName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {s.tagline}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px]">
                      {s.liveCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-live)]/15 text-[var(--color-live)] ring-1 ring-[var(--color-live)]/30 font-bold">
                          <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none" />
                          <Flame className="size-3" /> {s.liveCount} live
                        </span>
                      )}
                      {s.upcomingCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30 font-bold">
                          <CalendarClock className="size-3" /> {s.upcomingCount} upcoming
                        </span>
                      )}
                      {s.liveCount === 0 && s.upcomingCount === 0 && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          No scheduled play
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex min-h-11 items-center px-3 py-1 rounded-full text-[11px] font-bold ring-1 transition",
        active
          ? "bg-gradient-to-r from-[var(--color-accent-cricket)] to-[var(--color-accent-cricket)] text-foreground ring-border"
          : "bg-muted text-foreground ring-border hover:bg-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
