import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { Flame, ChevronRight, Trophy, Newspaper, BarChart3 } from "lucide-react";
import { getScoreboard, getStandings, getSportNews, type SportGame } from "@/lib/espn.functions";
import { getMlbLeaders } from "@/lib/mlb.functions";
import { GameCard } from "@/components/sports/GameCard";
import { LeaderBoard } from "@/components/mlb/LeaderBoard";
import { AdSlot } from "@/components/ads/AdSlot";
import { todayYmd } from "@/components/sports/DateScrubber";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mlb/")({
  head: () => ({
    meta: [
      { title: "MLB Today — Live Scores, Standings, Leaders, News" },
      { name: "description", content: "Today's MLB games, standings snapshot, batting and pitching leaders, and the latest baseball headlines in one hub." },
      { property: "og:title", content: "MLB Today — Live Scores, Standings, Leaders" },
      { property: "og:description", content: "Today's MLB games, standings, leaders and headlines." },
      { property: "og:url", content: "https://www.playsports.online/mlb" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/110e40cc-d990-48af-a996-8f46b9fd0f97/id-preview-f9e73043--3e33a21e-e132-4b69-83ee-be28f3bc4583.lovable.app-1782037338724.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLB Today — Live Scores, Standings, Leaders" },
      { name: "twitter:description", content: "Today's MLB games, standings, leaders and headlines." },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb" }],
    scripts: [
      ldScript(collectionPage({ name: "MLB — Live Scores, Standings & Leaders", description: "Major League Baseball hub: scores, standings, leaders and news.", path: "/mlb" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }])),
    ],
  }),
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient
        .prefetchQuery({
          queryKey: ["mlb", "sb", day],
          queryFn: () => getScoreboard({ data: { sportPath: "baseball/mlb", league: "MLB", yyyymmdd: day } }),
          staleTime: 20_000,
        })
        .catch(() => null),
      context.queryClient
        .prefetchQuery({
          queryKey: ["mlb", "st"],
          queryFn: () => getStandings({ data: { sportPath: "baseball/mlb" } }),
          staleTime: 60 * 60_000,
        })
        .catch(() => null),
    ]);
    return null;
  },
  component: MlbToday,
});


function MlbToday() {
  const sbFn = useServerFn(getScoreboard);
  const stFn = useServerFn(getStandings);
  const nwFn = useServerFn(getSportNews);
  const ldFn = useServerFn(getMlbLeaders);
  const day = todayYmd();

  const sbQ = useQuery({
    queryKey: ["mlb", "sb", day],
    queryFn: () => sbFn({ data: { sportPath: "baseball/mlb", league: "MLB", yyyymmdd: day } }),
    staleTime: 20_000,
    refetchInterval: (q) => {
      const d = q.state.data as { games?: SportGame[] } | undefined;
      return d?.games?.some((g) => g.status === "in") ? 20_000 : false;
    },
  });
  const stQ = useQuery({ queryKey: ["mlb", "st"], queryFn: () => stFn({ data: { sportPath: "baseball/mlb" } }), staleTime: 60 * 60_000 });
  const nwQ = useQuery({ queryKey: ["mlb", "nw"], queryFn: () => nwFn({ data: { sportPath: "baseball/mlb" } }), staleTime: 30 * 60_000 });
  const ldQ = useQuery({ queryKey: ["mlb", "ld"], queryFn: () => ldFn({ data: {} }), staleTime: 60 * 60_000 });

  const games = sbQ.data?.games ?? [];
  const live = games.filter((g) => g.status === "in");
  const upcoming = games.filter((g) => g.status === "pre");
  const finals = games.filter((g) => g.status === "post");

  const topStandings = useMemo(() => {
    const groups = stQ.data?.groups ?? [];
    return groups.map((g) => ({ name: g.name, rows: g.rows.slice(0, 3) }));
  }, [stQ.data]);

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      {/* Today's slate */}
      <section className="space-y-3">
        <Header icon={<Flame className="size-4 text-[#d50032]" />} title={`Today — ${games.length} games`} link="/mlb/scores" linkLabel="Full scoreboard" />
        {sbQ.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}
        {live.length > 0 && (
          <div className="space-y-2">
            <SubLabel tone="red">Live now · {live.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {live.map((g, i) => (
                <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <GameCard game={g} linkTo={`/mlb/game/${g.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <SubLabel tone="amber">Upcoming · {upcoming.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.slice(0, 6).map((g, i) => (
                <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <GameCard game={g} linkTo={`/mlb/game/${g.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        {finals.length > 0 && live.length === 0 && upcoming.length === 0 && (
          <div className="space-y-2">
            <SubLabel>Final · {finals.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {finals.slice(0, 6).map((g, i) => (
                <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <GameCard game={g} linkTo={`/mlb/game/${g.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        {!sbQ.isLoading && games.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No games scheduled today.
          </div>
        )}
      </section>

      <AdSlot slot="in_content" layout="in-article" />

      {/* Standings + Leaders side by side */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Header icon={<Trophy className="size-4 text-[#f7e6c4]" />} title="Division leaders" link="/mlb/standings" linkLabel="Full standings" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topStandings.map((g) => (
              <div key={g.name} className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
                <div className="px-4 py-2 border-b border-border text-[11px] uppercase tracking-wider font-bold text-[#f7e6c4]/80">
                  {g.name}
                </div>
                <ul className="divide-y divide-border">
                  {g.rows.map((r, i) => (
                    <li key={r.teamId} className="flex items-center gap-3 px-4 py-2 text-sm">
                      <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      {r.logo && <img loading="lazy" decoding="async" src={r.logo} alt="" className="size-5 object-contain" />}
                      <span className="flex-1 font-semibold text-white truncate">{r.team}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {r.wins}-{r.losses}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Header icon={<BarChart3 className="size-4 text-sky-300" />} title="Top scorers" link="/mlb/players" linkLabel="All leaders" />
          {ldQ.data?.batting?.[0] && <LeaderBoard category={ldQ.data.batting[0]} compact />}
          {ldQ.data?.pitching?.[0] && <LeaderBoard category={ldQ.data.pitching[0]} compact />}
        </div>
      </section>

      {/* News */}
      <section className="space-y-3">
        <Header icon={<Newspaper className="size-4 text-emerald-300" />} title="Latest news" link="/mlb/news" linkLabel="All news" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(nwQ.data?.items ?? []).slice(0, 6).map((n) => (
            <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="group rounded-2xl bg-card ring-1 ring-border overflow-hidden hover:ring-[#d50032]/40 transition-all">
              {n.image && <img src={n.image} alt="" className="w-full h-32 object-cover" loading="lazy" />}
              <div className="p-3">
                <div className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#f7e6c4] transition-colors">{n.headline}</div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.description}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Header({ icon, title, link, linkLabel }: { icon: React.ReactNode; title: string; link: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">{icon} {title}</h2>
      <Link to={link} className="text-xs font-semibold text-[#f7e6c4] hover:text-white inline-flex items-center gap-1">
        {linkLabel} <ChevronRight className="size-3" />
      </Link>
    </div>
  );
}

function SubLabel({ children, tone = "default" }: { children: React.ReactNode; tone?: "red" | "amber" | "default" }) {
  const cls = tone === "red" ? "bg-red-500/15 text-red-200 ring-red-500/30"
    : tone === "amber" ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
    : "bg-white/5 text-gray-300 ring-white/10";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ${cls}`}>
      {tone === "red" && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
      {children}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4 animate-pulse">
      <div className="h-3 w-20 bg-white/10 rounded mb-3" />
      <div className="flex items-center gap-3 mb-2">
        <div className="size-8 rounded-full bg-white/10" />
        <div className="h-4 flex-1 bg-white/10 rounded" />
        <div className="h-4 w-8 bg-white/10 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-white/10" />
        <div className="h-4 flex-1 bg-white/10 rounded" />
        <div className="h-4 w-8 bg-white/10 rounded" />
      </div>
    </div>
  );
}
