import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, ChevronRight, Trophy, Newspaper, BarChart3 } from "lucide-react";
import { getNbaScoreboard, getNbaStandingsPro, getNbaLeaders } from "@/lib/nba.functions";
import { getSportNews } from "@/lib/espn.functions";
import { GameCard } from "@/components/sports/GameCard";
import { NbaLeaderBoard } from "@/components/nba/NbaLeaderBoard";
import { AdSlot } from "@/components/ads/AdSlot";
import { todayYmd } from "@/components/sports/DateScrubber";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/")({
  head: () => ({
    meta: [
      { title: "NBA Today — Live Scores, Standings, Leaders, News" },
      { name: "description", content: "Today's NBA games, standings snapshot, league leaders, and the latest basketball headlines in one hub." },
      { property: "og:title", content: "NBA Today — Live Scores, Standings, Leaders" },
      { property: "og:url", content: "https://allsportslive.lovable.app/nba" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/nba" }],
    scripts: [
      ldScript(collectionPage({ name: "NBA — Live Scores, Standings & Leaders", description: "NBA hub: scores, standings, leaders and news.", path: "/nba" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NBA", path: "/nba" }])),
    ],
  }),
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["nba", "sb", day],
        queryFn: () => getNbaScoreboard({ data: { yyyymmdd: day } }),
        staleTime: 20_000,
      }).catch(() => null),
      context.queryClient.prefetchQuery({
        queryKey: ["nba", "st"],
        queryFn: () => getNbaStandingsPro(),
        staleTime: 30 * 60_000,
      }).catch(() => null),
    ]);
    return null;
  },
  component: NbaToday,
});

function NbaToday() {
  const sbFn = useServerFn(getNbaScoreboard);
  const stFn = useServerFn(getNbaStandingsPro);
  const ldFn = useServerFn(getNbaLeaders);
  const nwFn = useServerFn(getSportNews);
  const day = todayYmd();

  const sbQ = useQuery({
    queryKey: ["nba", "sb", day],
    queryFn: () => sbFn({ data: { yyyymmdd: day } }),
    staleTime: 20_000,
    refetchInterval: (q) => {
      const d = q.state.data as any;
      return d?.games?.some((g: any) => g.status === "in") ? 20_000 : false;
    },
  });
  const stQ = useQuery({ queryKey: ["nba", "st"], queryFn: () => stFn(), staleTime: 30 * 60_000 });
  const ldQ = useQuery({ queryKey: ["nba", "ld"], queryFn: () => ldFn({ data: {} }), staleTime: 60 * 60_000 });
  const nwQ = useQuery({ queryKey: ["nba", "nw"], queryFn: () => nwFn({ data: { sportPath: "basketball/nba" } }), staleTime: 30 * 60_000 });

  const games = sbQ.data?.games ?? [];
  const live = games.filter((g) => g.status === "in");
  const upcoming = games.filter((g) => g.status === "pre");
  const finals = games.filter((g) => g.status === "post");
  const news = nwQ.data?.items?.slice(0, 6) ?? [];
  const previewLeaders = (ldQ.data?.offensive ?? []).slice(0, 3);
  const previewStandings = (stQ.data?.conferences ?? []).map((c) => ({
    name: c.name,
    rows: [...c.divisions.flatMap((d) => d.rows)].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0)).slice(0, 5),
  }));

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      <section className="space-y-3">
        <Header icon={<Flame className="size-4 text-orange-400" />} title={`Today — ${games.length} games`} link="/nba/scores" linkLabel="Full scoreboard" />
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
                  <GameCard game={g as any} linkTo={`/nba/game/${g.id}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <SubLabel tone="amber">Upcoming · {upcoming.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.slice(0, 6).map((g) => (
                <GameCard key={g.id} game={g as any} linkTo={`/nba/game/${g.id}`} />
              ))}
            </div>
          </div>
        )}
        {finals.length > 0 && (
          <div className="space-y-2">
            <SubLabel tone="green">Final · {finals.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {finals.slice(0, 6).map((g) => (
                <GameCard key={g.id} game={g as any} linkTo={`/nba/game/${g.id}`} />
              ))}
            </div>
          </div>
        )}
        {!sbQ.isLoading && games.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">
            No NBA games scheduled today.
          </div>
        )}
      </section>

      <AdSlot slot="in_content" />

      {previewStandings.length > 0 && (
        <section className="space-y-3">
          <Header icon={<Trophy className="size-4 text-orange-400" />} title="Conference Standings" link="/nba/standings" linkLabel="Full standings" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {previewStandings.map((c) => (
              <div key={c.name} className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <span className="block w-1.5 h-5 rounded-full bg-orange-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{c.name}</h3>
                </div>
                <ul className="divide-y divide-border">
                  {c.rows.map((r, i) => (
                    <li key={r.teamId} className="flex items-center gap-3 px-4 py-2 text-sm">
                      <span className="w-5 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                      {r.logo && <img src={r.logo} alt="" className="size-5 object-contain" loading="lazy" />}
                      <Link to="/nba/team/$id" params={{ id: r.teamId }} className="flex-1 truncate font-medium text-white hover:text-orange-300 transition">
                        {r.shortName || r.team}
                      </Link>
                      <span className="tabular-nums text-muted-foreground">{r.wins}–{r.losses}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {previewLeaders.length > 0 && (
        <section className="space-y-3">
          <Header icon={<BarChart3 className="size-4 text-orange-400" />} title="League Leaders" link="/nba/leaders" linkLabel="All categories" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewLeaders.map((cat) => (
              <NbaLeaderBoard key={cat.key} category={cat} compact />
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="space-y-3">
          <Header icon={<Newspaper className="size-4 text-orange-400" />} title="Latest News" link="/nba/news" linkLabel="All news" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.map((n) => (
              <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer"
                 className="group rounded-2xl ring-1 ring-border bg-card overflow-hidden hover:ring-orange-400/40 transition">
                {n.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-background">
                    <img src={n.image} alt="" loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold text-white line-clamp-2 group-hover:text-orange-300 transition">{n.headline}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Header({ icon, title, link, linkLabel }: { icon: React.ReactNode; title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 text-white">{icon}{title}</h2>
      {link && (
        <Link to={link} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-orange-300 transition">
          {linkLabel} <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function SubLabel({ children, tone }: { children: React.ReactNode; tone: "red" | "amber" | "green" }) {
  const map = {
    red: "text-red-300", amber: "text-amber-300", green: "text-emerald-300",
  }[tone];
  return <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${map}`}>{children}</div>;
}

function CardSkeleton() {
  return <div className="rounded-2xl ring-1 ring-border bg-card h-24 animate-pulse" />;
}
