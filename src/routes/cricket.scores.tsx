import { useMemo } from "react";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Flame, Clock, CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { getMultiCricketToday, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES, FORMAT_META } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
type Tab = "live" | "today" | "upcoming" | "results";

const searchSchema = z.object({
  tab: fallback(z.enum(["live", "today", "upcoming", "results"]), "live").default("live"),
  date: fallback(z.string(), "").default(""),
  league: fallback(z.string(), "all").default("all"),
  fmt: fallback(z.enum(["any", "t20", "odi", "test"]), "any").default("any"),
});
type ScoresSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/cricket/scores")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [stripSearchParams({ tab: "live", date: "", league: "all", fmt: "any" })],
  },
  head: () => ({
    meta: [
      { title: "Cricket Scores — Live, Today, Upcoming & Results" },
      {
        name: "description",
        content:
          "Live cricket scores plus today's fixtures, upcoming matches and recent results across IPL, ICC events, BBL, PSL and more.",
      },
      { property: "og:title", content: "Cricket Scores — Live & Fixtures" },
      {
        property: "og:description",
        content: "Auto-refreshing cricket scores and fixtures by date, format and series.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/scores" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cricket Scores — Live, Today, Upcoming & Results" },
      {
        name: "twitter:description",
        content:
          "Live cricket scores plus today's fixtures, upcoming matches and recent results across IPL, ICC events, BBL, PSL and more.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/scores" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Scores", path: "/cricket/scores" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(CricketScoresPage, { sport: "cricket", currentPath: "/cricket/scores" }),
});

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function sameDay(ts: number, isoYmd: string) {
  if (!isoYmd) return false;
  const d = new Date(ts);
  return isoDate(d) === isoYmd;
}

function buildDateStrip() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { iso: string; label: string; sub: string; isToday: boolean; ts: number }[] = [];
  for (let i = -3; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: isoDate(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      sub: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
      isToday: i === 0,
      ts: d.getTime(),
    });
  }
  return days;
}

function CricketScoresPage() {
  const search = Route.useSearch() as ScoresSearch;
  const navigate = Route.useNavigate();
  const { tab, date, league, fmt } = search;

  const multiFn = useServerFn(getMultiCricketToday);
  const leagueIds = CRICKET_LEAGUES.map((l) => l.id);

  const q = useQuery({
    queryKey: ["cricket", "scores", leagueIds.join(",")],
    queryFn: () => multiFn({ data: { leagueIds } }),
    staleTime: 20_000,
    retry: 1,
    refetchInterval: (qq) => {
      const data = qq.state.data as { matches?: CricketMatch[] } | undefined;
      return data?.matches?.some((m) => m.status === "in") ? 20_000 : false;
    },
  });

  const allMatches = q.data?.matches ?? [];
  const liveAll = allMatches.filter((m) => m.status === "in").length;
  const dateStrip = useMemo(buildDateStrip, []);
  const effectiveDate = date || (tab === "today" ? isoDate(new Date()) : "");

  const filtered = useMemo(() => {
    let m = allMatches;
    if (league === "internationals") m = m.filter((x) => x.kind === "bilateral");
    else if (league !== "all") m = m.filter((x) => x.leagueId === league);
    if (fmt !== "any") {
      m = m.filter((x) => {
        const f = (x.format || "").toUpperCase();
        if (fmt === "t20") return f.includes("T20");
        if (fmt === "odi") return f === "ODI" || f.includes("ONE");
        if (fmt === "test") return f === "TEST";
        return true;
      });
    }
    return m;
  }, [allMatches, league, fmt]);

  const visible = useMemo(() => {
    if (tab === "live") return filtered.filter((m) => m.status === "in");
    if (tab === "results")
      return filtered.filter((m) => m.status === "post").sort((a, b) => b.startTs - a.startTs);
    if (effectiveDate) {
      return filtered
        .filter((m) => sameDay(m.startTs, effectiveDate))
        .sort((a, b) => a.startTs - b.startTs);
    }
    // upcoming without explicit date — soonest first, future only
    const now = Date.now();
    return filtered
      .filter((m) => m.status === "pre" && m.startTs > now)
      .sort((a, b) => a.startTs - b.startTs);
  }, [filtered, tab, effectiveDate]);

  // group by series for cleaner display
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { leagueId: string; leagueName: string; leagueAbbr: string; items: CricketMatch[] }
    >();
    for (const m of visible) {
      const key = m.leagueId || "_";
      const g = map.get(key) ?? {
        leagueId: m.leagueId,
        leagueName: m.leagueName,
        leagueAbbr: m.leagueAbbr,
        items: [],
      };
      g.items.push(m);
      map.set(key, g);
    }
    return Array.from(map.values());
  }, [visible]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count: number; tone: string }[] = [
    {
      id: "live",
      label: "Live",
      icon: <Flame className="size-3.5" />,
      count: allMatches.filter((m) => m.status === "in").length,
      tone: "from-rose-500 to-red-500",
    },
    {
      id: "today",
      label: "Today",
      icon: <Calendar className="size-3.5" />,
      count: allMatches.filter((m) => sameDay(m.startTs, isoDate(new Date()))).length,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      icon: <Clock className="size-3.5" />,
      count: allMatches.filter((m) => m.status === "pre").length,
      tone: "from-amber-500 to-orange-500",
    },
    {
      id: "results",
      label: "Results",
      icon: <CheckCircle2 className="size-3.5" />,
      count: allMatches.filter((m) => m.status === "post").length,
      tone: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <SportNav liveCount={liveAll} />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-r from-emerald-950/30 via-background to-amber-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-300/80 mb-1">
                Cricket scores
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                Cricket — Live, today, upcoming & results
              </h1>
            </div>
            {q.isFetching && !q.isLoading && (
              <span className="shrink-0 text-[10px] text-emerald-200/70 inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> Updating…
              </span>
            )}
          </div>

          {/* TABS */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() =>
                    navigate({
                      search: (prev: {
                        tab: "live" | "today" | "upcoming" | "results";
                        date: string;
                        league: string;
                        fmt: "any" | "t20" | "odi" | "test";
                      }) => ({
                        ...prev,
                        tab: t.id,
                        date: t.id === "today" ? isoDate(new Date()) : "",
                      }),
                    })
                  }
                  className={[
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-all",
                    active
                      ? `bg-gradient-to-r ${t.tone} text-white ring-white/20 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)]`
                      : "bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 ring-white/10",
                  ].join(" ")}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  <span
                    className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-black/20" : "bg-white/10 text-gray-400"}`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DATE STRIP — visible on Upcoming & Today */}
          {(tab === "upcoming" || tab === "today") && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <button
                  aria-label="Earlier"
                  onClick={() => {
                    const cur = effectiveDate ? new Date(effectiveDate) : new Date();
                    cur.setDate(cur.getDate() - 1);
                    navigate({
                      search: (prev: {
                        tab: "live" | "today" | "upcoming" | "results";
                        date: string;
                        league: string;
                        fmt: "any" | "t20" | "odi" | "test";
                      }) => ({ ...prev, date: isoDate(cur), tab: "upcoming" }),
                    });
                  }}
                  className="shrink-0 size-8 rounded-full grid place-items-center bg-white/[0.06] hover:bg-white/[0.12] ring-1 ring-white/10"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="flex-1 overflow-x-auto no-scrollbar">
                  <div className="flex gap-1.5 min-w-max">
                    {dateStrip.map((d) => {
                      const active = effectiveDate === d.iso;
                      return (
                        <button
                          key={d.iso}
                          onClick={() =>
                            navigate({
                              search: (prev: {
                                tab: "live" | "today" | "upcoming" | "results";
                                date: string;
                                league: string;
                                fmt: "any" | "t20" | "odi" | "test";
                              }) => ({ ...prev, date: d.iso, tab: "upcoming" }),
                            })
                          }
                          className={[
                            "flex flex-col items-center min-w-[56px] px-2.5 py-1.5 rounded-xl ring-1 transition-all",
                            active
                              ? "bg-gradient-to-b from-emerald-500 to-emerald-700 ring-emerald-300/40 text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.55)]"
                              : d.isToday
                                ? "bg-amber-500/15 ring-amber-500/30 text-amber-200 hover:bg-amber-500/25"
                                : "bg-white/[0.04] ring-white/10 text-gray-300 hover:bg-white/[0.09]",
                          ].join(" ")}
                        >
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                            {d.label}
                          </span>
                          <span className="text-xs font-extrabold tabular-nums">{d.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  aria-label="Later"
                  onClick={() => {
                    const cur = effectiveDate ? new Date(effectiveDate) : new Date();
                    cur.setDate(cur.getDate() + 1);
                    navigate({
                      search: (prev: {
                        tab: "live" | "today" | "upcoming" | "results";
                        date: string;
                        league: string;
                        fmt: "any" | "t20" | "odi" | "test";
                      }) => ({ ...prev, date: isoDate(cur), tab: "upcoming" }),
                    });
                  }}
                  className="shrink-0 size-8 rounded-full grid place-items-center bg-white/[0.06] hover:bg-white/[0.12] ring-1 ring-white/10"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* FILTERS — series + format */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <FilterButton
              label="All series"
              emoji="🏏"
              active={league === "all"}
              onClick={() =>
                navigate({
                  search: (prev: {
                    tab: "live" | "today" | "upcoming" | "results";
                    date: string;
                    league: string;
                    fmt: "any" | "t20" | "odi" | "test";
                  }) => ({ ...prev, league: "all" }),
                })
              }
            />
            <FilterButton
              label="Internationals"
              emoji="🌍"
              active={league === "internationals"}
              onClick={() =>
                navigate({
                  search: (prev: {
                    tab: "live" | "today" | "upcoming" | "results";
                    date: string;
                    league: string;
                    fmt: "any" | "t20" | "odi" | "test";
                  }) => ({ ...prev, league: "internationals" }),
                })
              }
              accent="text-sky-300"
            />
            {CRICKET_LEAGUES.map((l) => (
              <FilterButton
                key={l.id}
                label={l.label}
                emoji={l.emoji}
                active={league === l.id}
                onClick={() =>
                  navigate({
                    search: (prev: {
                      tab: "live" | "today" | "upcoming" | "results";
                      date: string;
                      league: string;
                      fmt: "any" | "t20" | "odi" | "test";
                    }) => ({ ...prev, league: l.id }),
                  })
                }
                accent={l.accent}
              />
            ))}

            <span className="mx-1 h-5 w-px bg-white/10" />
            {(["any", "t20", "odi", "test"] as const).map((f) => {
              const meta = FORMAT_META[f];
              const active = fmt === f;
              return (
                <button
                  key={f}
                  onClick={() =>
                    navigate({
                      search: (prev: {
                        tab: "live" | "today" | "upcoming" | "results";
                        date: string;
                        league: string;
                        fmt: "any" | "t20" | "odi" | "test";
                      }) => ({ ...prev, fmt: f }),
                    })
                  }
                  className={[
                    "inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-bold ring-1 transition-all",
                    active
                      ? `${meta.color} ring-1`
                      : "bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 ring-white/10",
                  ].join(" ")}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {q.isLoading ? (
          <GameGridSkeleton />
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
            <Calendar className="mx-auto size-10 opacity-30 mb-3" />
            <p className="text-sm font-medium">No matches in this slice</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different tab, date or filter.
            </p>
            <Link
              to="/cricket"
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200 text-xs font-bold"
            >
              Back to Cricket Hub
            </Link>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.leagueId} className="space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  <span className="text-amber-300">●</span>{" "}
                  {g.leagueName || g.leagueAbbr || "Cricket"}
                  <span className="ml-2 text-xs text-gray-500 font-normal">({g.items.length})</span>
                </h2>
                <Link
                  to="/cricket/series/$id"
                  params={{ id: g.leagueId }}
                  className="shrink-0 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-0.5"
                >
                  Series page <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.items.map((m) => (
                  <CricketMatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

function FilterButton({
  label,
  emoji,
  active,
  onClick,
  accent,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ring-1 transition-all",
        active
          ? "bg-gradient-to-r from-emerald-500 to-amber-500 text-black ring-amber-300 shadow-[0_4px_14px_-4px_rgba(245,158,11,0.5)]"
          : `bg-white/[0.04] hover:bg-white/[0.09] ring-white/10 ${accent ?? "text-gray-200"}`,
      ].join(" ")}
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
