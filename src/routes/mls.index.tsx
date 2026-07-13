import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, ChevronRight, Trophy, Newspaper, BarChart3 } from "lucide-react";
import { getMlsScoreboard, getMlsStandingsPro, getMlsLeaders } from "@/lib/mls.functions";
import { getSportNews } from "@/lib/espn.functions";
import { GameCard } from "@/components/sports/GameCard";
import { MlsLeaderBoard } from "@/components/mls/MlsLeaderBoard";
import { AdSlot } from "@/components/ads/AdSlot";
import { todayYmd } from "@/components/sports/DateScrubber";
import { breadcrumbList, collectionPage, sportsOrganization, faqPage, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mls/")({
  head: () => ({
    meta: [
      { title: "MLS Today — Live Scores, Standings, Leaders, News" },
      { name: "description", content: "Today's MLS games, standings snapshot, league leaders, and the latest soccer headlines in one hub." },
      { property: "og:title", content: "MLS Today — Live Scores, Standings, Leaders" },
      { property: "og:description", content: "Today's MLS games, standings, league leaders and soccer headlines." },
      { property: "og:url", content: "https://www.playsports.online/mls" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/110e40cc-d990-48af-a996-8f46b9fd0f97/id-preview-f9e73043--3e33a21e-e132-4b69-83ee-be28f3bc4583.lovable.app-1782037338724.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS Today — Live Scores, Standings, Leaders" },
      { name: "twitter:description", content: "Today's MLS games, standings, league leaders and soccer headlines." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mls" }],
    scripts: [
      ldScript(collectionPage({ name: "MLS — Live Scores, Standings & Leaders", description: "Major League Soccer hub: scores, standings, leaders and news.", path: "/mls" })),
      ldScript(sportsOrganization({ name: "Major League Soccer", path: "/mls", sport: "Soccer" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }])),
      ldScript(faqPage([
        { q: "How can I follow live MLS scores?", a: "PlaySports shows every MLS match with live minute-by-minute updates, goals, cards and lineups." },
        { q: "How do MLS playoffs work?", a: "The top nine teams from each conference qualify for the Audi MLS Cup Playoffs, a bracket that culminates in the MLS Cup final." },
        { q: "Does PlaySports cover MLS Cup?", a: "Yes — the full MLS Cup Playoffs bracket, Golden Boot race and league history are covered on PlaySports." },
      ])),
    ],

  }),
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["mls", "sb", day],
        queryFn: () => getMlsScoreboard({ data: { yyyymmdd: day } }),
        staleTime: 20_000,
      }).catch(() => null),
      context.queryClient.prefetchQuery({
        queryKey: ["mls", "st"],
        queryFn: () => getMlsStandingsPro(),
        staleTime: 30 * 60_000,
      }).catch(() => null),
    ]);
    return null;
  },
  component: withHubLinks(MlsToday, { sport: "mls", currentPath: "/mls" }),
});

function MlsToday() {
  const sbFn = useServerFn(getMlsScoreboard);
  const stFn = useServerFn(getMlsStandingsPro);
  const ldFn = useServerFn(getMlsLeaders);
  const nwFn = useServerFn(getSportNews);
  const day = todayYmd();

  const sbQ = useQuery({
    queryKey: ["mls", "sb", day],
    queryFn: () => sbFn({ data: { yyyymmdd: day } }),
    staleTime: 20_000,
    refetchInterval: (q) => {
      const d = q.state.data as any;
      return d?.games?.some((g: any) => g.status === "in") ? 20_000 : false;
    },
  });
  const stQ = useQuery({ queryKey: ["mls", "st"], queryFn: () => stFn(), staleTime: 30 * 60_000 });
  const ldQ = useQuery({ queryKey: ["mls", "ld"], queryFn: () => ldFn({ data: {} }), staleTime: 60 * 60_000 });
  const nwQ = useQuery({ queryKey: ["mls", "nw"], queryFn: () => nwFn({ data: { sportPath: "soccer/usa.1" } }), staleTime: 30 * 60_000 });

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
        <Header icon={<Flame className="size-4 text-orange-400" />} title={`Today — ${games.length} games`} link="/mls/scores" linkLabel="Full scoreboard" />
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
                  <GameCard game={g as any} linkTo={`/mls/game/${g.id}`} />
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
                <GameCard key={g.id} game={g as any} linkTo={`/mls/game/${g.id}`} />
              ))}
            </div>
          </div>
        )}
        {finals.length > 0 && (
          <div className="space-y-2">
            <SubLabel tone="green">Final · {finals.length}</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {finals.slice(0, 6).map((g) => (
                <GameCard key={g.id} game={g as any} linkTo={`/mls/game/${g.id}`} />
              ))}
            </div>
          </div>
        )}
        {!sbQ.isLoading && games.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">
            No MLS games scheduled today.
          </div>
        )}
      </section>

      <AdSlot slot="in_content" />

      {previewStandings.length > 0 && (
        <section className="space-y-3">
          <Header icon={<Trophy className="size-4 text-orange-400" />} title="Conference Standings" link="/mls/standings" linkLabel="Full standings" />
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
                      {r.logo && <img src={r.logo} alt="" className="size-5 object-contain" loading="lazy" / decoding="async">}
                      <Link to="/mls/team/$id" params={{ id: r.teamId }} className="flex-1 truncate font-medium text-white hover:text-orange-300 transition">
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
          <Header icon={<BarChart3 className="size-4 text-orange-400" />} title="League Leaders" link="/mls/leaders" linkLabel="All categories" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewLeaders.map((cat) => (
              <MlsLeaderBoard key={cat.key} category={cat} compact />
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="space-y-3">
          <Header icon={<Newspaper className="size-4 text-orange-400" />} title="Latest News" link="/mls/news" linkLabel="All news" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.map((n) => (
              <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer"
                 className="group rounded-2xl ring-1 ring-border bg-card overflow-hidden hover:ring-orange-400/40 transition">
                {n.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-background">
                    <img src={n.image} alt="" loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" / decoding="async">
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
