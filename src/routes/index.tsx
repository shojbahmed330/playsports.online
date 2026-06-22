import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Flame, ArrowRight, Loader2, MapPin } from "lucide-react";
import { SPORT_LIST } from "@/lib/sports-config";
import { getMultiSportToday } from "@/lib/espn.functions";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { GameCard } from "@/components/sports/GameCard";
import { SportNav } from "@/components/sports/SportNav";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sports Hub — Live Scores, Standings & News" },
      {
        name: "description",
        content:
          "Your home for live MLB, NBA, NHL, MLS scores and the complete FIFA World Cup archive — all in one place.",
      },
      { property: "og:title", content: "Sports Hub — Live Scores Across MLB, NBA, NHL, MLS & FIFA" },
      { property: "og:description", content: "Live scoreboards, standings, news and the full FIFA World Cup archive 1930–2026." },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  const multiFn = useServerFn(getMultiSportToday);
  const sportsInput = SPORT_LIST.map((s) => ({ path: s.path, league: s.label }));
  const liveQ = useQuery({
    queryKey: ["hub", "today", sportsInput.map((s) => s.league).join(",")],
    queryFn: () => multiFn({ data: { sports: sportsInput } }),
    staleTime: 60_000,
    retry: 1,
  });

  const byLeague = liveQ.data?.byLeague ?? {};
  const liveNow = SPORT_LIST.flatMap((s) =>
    (byLeague[s.label] ?? [])
      .filter((g) => g.status === "in")
      .map((g) => ({ sport: s, game: g })),
  ).slice(0, 6);

  return (
    <div className="min-h-screen">
      <SportNav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, oklch(0.78 0.16 75 / 0.22), transparent 60%), radial-gradient(40% 60% at 80% 100%, oklch(0.62 0.22 27 / 0.16), transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 ring-1 ring-amber-500/30 text-[11px] uppercase tracking-[0.18em] font-bold text-amber-300 mb-5">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> Live across 5 leagues
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            One <span className="text-amber-400">Sports Hub</span>. Every Game.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Live scores and standings for <strong className="text-foreground">MLB</strong>,{" "}
            <strong className="text-foreground">NBA</strong>,{" "}
            <strong className="text-foreground">NHL</strong> and{" "}
            <strong className="text-foreground">MLS</strong>, plus the complete{" "}
            <strong className="text-foreground">FIFA World Cup</strong> archive from 1930 to 2026.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* SPORT TILES */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Choose a sport
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <FootballTile />
            {SPORT_LIST.map((s) => (
              <SportTile key={s.slug} sport={s} liveCount={(byLeague[s.label] ?? []).filter((g) => g.status === "in").length} />
            ))}
          </div>
        </section>

        {/* LIVE NOW */}
        {liveQ.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-amber-400" />
          </div>
        ) : liveNow.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Flame className="size-5 text-red-400" /> Live Right Now
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-red-300">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                {liveNow.length} game{liveNow.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveNow.map(({ sport, game }) => (
                <div key={game.id} className="relative">
                  <div className={`absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full ${sport.chipBg} ring-1 ${sport.ring} text-[10px] font-bold ${sport.accent}`}>
                    {sport.emoji} {sport.label}
                  </div>
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <AdSlot slot="in_content" layout="in-article" />

        {/* TODAY'S GAMES BY LEAGUE */}
        <section className="space-y-8">
          <h2 className="text-lg font-bold">Today's Slate</h2>

          {/* FIFA World Cup 2026 */}
          <FootballSlate />

          {SPORT_LIST.map((s) => {
            const games = byLeague[s.label] ?? [];
            return (
              <div key={s.slug} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/${s.slug}`}
                    className={`group inline-flex items-center gap-2 text-sm font-bold ${s.accent} hover:underline`}
                  >
                    <span className="text-base">{s.emoji}</span> {s.label}
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-xs text-gray-500">{games.length} game{games.length === 1 ? "" : "s"}</span>
                </div>
                {games.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500 bg-gray-900/40">
                    No {s.label} games scheduled.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {games.slice(0, 3).map((g) => <GameCard key={g.id} game={g} />)}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Live data from ESPN · FIFA World Cup data from Sofascore & jfjelstul/worldcup dataset
      </footer>
    </div>
  );
}

function FootballTile() {
  return (
    <a
      href="/football"
      className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-900/50 via-gray-900 to-red-900/30 border border-amber-500/30 hover:border-amber-400/60 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-12 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/40 grid place-items-center text-2xl">
          <Trophy className="size-6 text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Archive</div>
          <div className="text-base font-extrabold leading-tight">FIFA</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 leading-snug">
        Complete World Cup history 1930 → 2026, with live data for the 2026 tournament.
      </div>
      <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:gap-2 transition-all">
        Explore <ArrowRight className="size-3" />
      </div>
    </a>
  );
}

function SportTile({
  sport,
  liveCount,
}: {
  sport: (typeof SPORT_LIST)[number];
  liveCount: number;
}) {
  return (
    <a
      href={`/${sport.slug}`}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${sport.bgGrad} border border-gray-800 hover:border-gray-700 transition-all hover:-translate-y-0.5`}
    >
      {liveCount > 0 && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {liveCount}
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={`size-12 rounded-xl ${sport.chipBg} ring-1 ${sport.ring} grid place-items-center text-2xl`}>
          {sport.emoji}
        </div>
        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-wider font-bold ${sport.accent}`}>Live</div>
          <div className="text-base font-extrabold leading-tight">{sport.label}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 leading-snug line-clamp-2">{sport.tagline}</div>
      <div className={`mt-3 inline-flex items-center gap-1 text-[11px] font-bold ${sport.accent} group-hover:gap-2 transition-all`}>
        Open <ArrowRight className="size-3" />
      </div>
    </a>
  );
}

function FootballSlate() {
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: 60 * 60_000,
    retry: 1,
  });

  const todays = (() => {
    const list = q.data?.fixtures ?? [];
    if (list.length === 0) return [] as Wc2026Fixture[];
    const now = Date.now() / 1000;
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(); dayEnd.setHours(23, 59, 59, 999);
    const tStart = dayStart.getTime() / 1000;
    const tEnd = dayEnd.getTime() / 1000;
    const today = list.filter((f) => f.startTs >= tStart && f.startTs <= tEnd);
    if (today.length) return today.slice(0, 3);
    // Fallback: show 3 nearest upcoming
    return list.filter((f) => f.startTs >= now).slice(0, 3);
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link
          to="/football"
          className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:underline"
        >
          <span className="text-base">⚽</span> FIFA World Cup 2026
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <span className="text-xs text-gray-500">{todays.length} match{todays.length === 1 ? "" : "es"}</span>
      </div>
      {q.isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500 bg-gray-900/40">
          Loading fixtures…
        </div>
      ) : todays.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500 bg-gray-900/40">
          No World Cup matches scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todays.map((f) => <Wc2026FixtureCard key={f.id} f={f} />)}
        </div>
      )}
    </div>
  );
}

function Wc2026FixtureCard({ f }: { f: Wc2026Fixture }) {
  const live = f.status === "inprogress";
  const finished = f.status === "finished";
  const when = new Date(f.startTs * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <Link
      to="/football"
      className="block rounded-xl bg-gray-900 border border-white/[0.08] hover:border-amber-500/50 transition-all overflow-hidden"
    >
      <div className="h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400" />
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">{f.group}</span>
        {live ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE {f.minute ? `${f.minute}'` : ""}
          </span>
        ) : finished ? (
          <span className="text-[10px] font-bold text-gray-500">FT</span>
        ) : (
          <span className="text-[10px] text-gray-500">{when}</span>
        )}
      </div>
      <TeamLine name={f.home.name} score={f.home.goals} />
      <div className="h-px bg-white/[0.05]" />
      <TeamLine name={f.away.name} score={f.away.goals} />
      {f.venue && (
        <div className="bg-gray-800/50 px-3 py-1.5 text-[10px] text-gray-500 truncate flex items-center gap-1">
          <MapPin className="size-3" /> {f.venue}
        </div>
      )}
    </Link>
  );
}

function TeamLine({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center gap-2 px-3 h-10">
      <span className="text-lg leading-none shrink-0">{flagOf(name)}</span>
      <span className="flex-1 min-w-0 truncate text-sm text-white font-medium">{name}</span>
      <span className="shrink-0 tabular-nums font-bold text-amber-400">{score ?? "-"}</span>
    </div>
  );
}
