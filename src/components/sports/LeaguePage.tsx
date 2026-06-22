import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Calendar, Trophy, Tv } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import {
  getScoreboard,
  getStandings,
  getSportNews,
} from "@/lib/espn.functions";
import { GameCard } from "./GameCard";
import { DateScrubber, todayYmd } from "./DateScrubber";
import { StandingsTable } from "./StandingsTable";
import { NewsRail } from "./NewsRail";
import { SportNav } from "./SportNav";
import { AdSlot } from "@/components/ads/AdSlot";

export function LeaguePage({ sport }: { sport: SportConfig }) {
  const [day, setDay] = useState<string>(todayYmd());
  const scoreboardFn = useServerFn(getScoreboard);
  const standingsFn = useServerFn(getStandings);
  const newsFn = useServerFn(getSportNews);

  const sbQ = useQuery({
    queryKey: ["espn", sport.slug, "scoreboard", day],
    queryFn: () => scoreboardFn({ data: { sportPath: sport.path, league: sport.label, yyyymmdd: day } }),
    staleTime: 60_000,
    retry: 1,
  });
  const stQ = useQuery({
    queryKey: ["espn", sport.slug, "standings"],
    queryFn: () => standingsFn({ data: { sportPath: sport.path } }),
    staleTime: 60 * 60_000,
    retry: 1,
  });
  const nwQ = useQuery({
    queryKey: ["espn", sport.slug, "news"],
    queryFn: () => newsFn({ data: { sportPath: sport.path } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });

  const games = sbQ.data?.games ?? [];
  const liveCount = games.filter((g) => g.status === "in").length;

  // Hockey shows OT losses; soccer + hockey show ties.
  const showTies = sport.slug === "mls" || sport.slug === "nhl";
  const showOT = sport.slug === "nhl";

  return (
    <div className="min-h-screen">
      <SportNav />

      {/* HERO */}
      <section className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${sport.bgGrad}`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-4">
            <div className={`size-16 sm:size-20 rounded-2xl ${sport.chipBg} ring-1 ${sport.ring} grid place-items-center text-4xl sm:text-5xl`}>
              {sport.emoji}
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-[0.2em] ${sport.accent} font-bold`}>
                {sport.label}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{sport.longName}</h1>
              <p className="text-sm text-muted-foreground mt-1">{sport.tagline}</p>
            </div>
            {liveCount > 0 && (
              <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 ring-1 ring-red-500/40">
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-300">{liveCount} live</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* SCOREBOARD */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className={`size-4 ${sport.accent}`} /> Scoreboard
            </h2>
            <span className="text-xs text-gray-500">
              {games.length} game{games.length === 1 ? "" : "s"}
            </span>
          </div>

          <DateScrubber selected={day} onChange={setDay} />

          {sbQ.isLoading ? (
            <Spinner />
          ) : sbQ.data?.error && games.length === 0 ? (
            <ErrBox msg={sbQ.data.error} />
          ) : games.length === 0 ? (
            <EmptyBox
              icon={<Tv className="size-10 opacity-30" />}
              title="No games on this date"
              body="Try another day from the scrubber above."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {games.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          )}
        </section>

        <AdSlot slot="in_content" layout="in-article" />

        {/* STANDINGS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className={`size-4 ${sport.accent}`} /> Standings
          </h2>
          {stQ.isLoading ? (
            <Spinner />
          ) : stQ.data?.error && (stQ.data?.groups?.length ?? 0) === 0 ? (
            <ErrBox msg={stQ.data.error} />
          ) : (
            <StandingsTable groups={stQ.data?.groups ?? []} showTies={showTies} showOT={showOT} />
          )}
        </section>

        {/* NEWS */}
        {!nwQ.isLoading && (nwQ.data?.items?.length ?? 0) > 0 && (
          <NewsRail items={nwQ.data!.items} />
        )}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Data from ESPN's public sports feed · Updated live
      </footer>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      ⚠️ {msg}
    </div>
  );
}
function EmptyBox({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
      <div className="mx-auto mb-3 inline-block">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
