import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { ArrowLeft, MapPin, Tv, Trophy, Activity } from "lucide-react";
import { z } from "zod";
import { SportNav } from "@/components/sports/SportNav";
import { ScoreFlip } from "@/components/sports/ScoreFlip";
import { CricketPlayerSheet } from "@/components/cricket/CricketPlayerSheet";
import { getCricketMatchDetail, type CricketInningsDetail } from "@/lib/cricket.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";


const searchSchema = z.object({
  leagueId: z.string().default("8048"),
});

export const Route = createFileRoute("/cricket/match/$id")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ leagueId: search.leagueId }),
  head: () => ({
    meta: [
      { title: "Live Cricket Scorecard — Sports Hub" },
      { name: "description", content: "Live cricket scorecard, batting and bowling figures, commentary and lineups." },
    ],
  }),
  component: MatchPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Couldn't load match</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        <Link to="/cricket" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">← Back to cricket</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">Match not found.</div>
  ),
});

function MatchPage() {
  const { id } = Route.useParams();
  const { leagueId } = Route.useSearch();
  const fn = useServerFn(getCricketMatchDetail);
  const q = useQuery({
    queryKey: ["cricket", "match", leagueId, id],
    queryFn: () => fn({ data: { leagueId, eventId: id } }),
    staleTime: 5_000,
    refetchInterval: (qq) => {
      const d = qq.state.data as { match?: { status: string } | null } | undefined;
      return d?.match?.status === "in" ? 10_000 : false;
    },
    refetchOnWindowFocus: true,
  });

  const match = q.data?.match ?? null;
  const innings = q.data?.innings ?? [];
  const commentary = q.data?.commentary ?? [];
  const [playerId, setPlayerId] = useState<string | null>(null);


  if (q.isLoading) {
    return (
      <div className="min-h-screen">
        <SportNav />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-sm text-muted-foreground">Loading scorecard…</div>
      </div>
    );
  }
  if (!match) {
    return (
      <div className="min-h-screen">
        <SportNav />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-sm">Match data unavailable.</p>
          <p className="text-xs text-muted-foreground mt-1">{q.data?.error}</p>
          <Link to="/cricket" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">← Back to cricket</Link>
        </div>
      </div>
    );
  }

  const isLive = match.status === "in";
  const isFinal = match.status === "post";

  return (
    <div className="min-h-screen">
      <SportNav liveCount={isLive ? 1 : 0} />

      <section className="relative overflow-hidden border-b border-border cricket-hero">
        <div className="absolute inset-0 opacity-25 pointer-events-none" aria-hidden style={{
          background: "radial-gradient(60% 70% at 50% 0%, rgba(251,191,36,0.35), transparent 65%)",
        }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <Link to="/cricket" className="inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white mb-3">
            <ArrowLeft className="size-3.5" /> All cricket
          </Link>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold">
              <Link to="/cricket/series/$id" params={{ id: match.leagueId }} className="text-amber-300 hover:underline">
                {match.leagueName || match.leagueAbbr}
              </Link>
              {match.format && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-white/15 text-white">{match.format.toUpperCase()}</span>}
              {match.description && <span className="text-emerald-100/70 normal-case font-medium tracking-normal">· {match.description}</span>}
            </div>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-red-300 text-xs font-bold">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse cricket-live-ring" /> LIVE · {match.statusDetail}
              </span>
            ) : isFinal ? (
              <span className="text-xs font-bold text-amber-300 inline-flex items-center gap-1"><Trophy className="size-3.5" /> Result</span>
            ) : (
              <span className="text-xs font-bold text-emerald-200">{relativeDay(match.startTs)} · {formatLocalTime(match.startTs)}</span>
            )}
          </div>

          {/* Big scoreline */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TeamScoreBlock t={match.home} />
            <TeamScoreBlock t={match.away} />
          </div>

          {match.note && (
            <div className="mt-4 inline-block px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200 text-xs font-semibold">
              {match.note}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-emerald-100/70">
            {match.venue && (
              <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {match.venue}{match.city ? `, ${match.city}` : ""}</span>
            )}
            {match.broadcast && (
              <span className="inline-flex items-center gap-1"><Tv className="size-3" /> {match.broadcast}</span>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {innings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center bg-gray-900/40">
            <Activity className="mx-auto size-10 opacity-30 mb-3" />
            <p className="text-sm font-medium">Detailed scorecard not yet available</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isLive ? "Live commentary will appear here once play begins." : "Ball-by-ball detail will populate when ESPN publishes the full card."}
            </p>
          </div>
        ) : (
          innings.map((inn) => <InningsCard key={`${inn.battingTeamId}-${inn.period}`} inn={inn} onPlayer={setPlayerId} />)
        )}

        <CricketPlayerSheet athleteId={playerId} leagueId={leagueId} onClose={() => setPlayerId(null)} />


        {commentary.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="size-4 text-emerald-400" /> Highlights</h2>
            <ul className="space-y-2">
              {commentary.map((c, i) => (
                <li key={i} className="rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2 text-sm">
                  {c.time && <span className="text-[10px] text-emerald-400 font-bold mr-2 tabular-nums">{c.time}</span>}
                  <span className="text-gray-200">{c.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Cricket data from ESPN · Live scorecards refresh every 15s
      </footer>
    </div>
  );
}

function TeamScoreBlock({ t }: { t: import("@/lib/cricket.functions").CricketMatch["home"] }) {
  const last = t.innings[t.innings.length - 1];
  const winner = t.winner === true;
  return (
    <div className={`rounded-xl p-4 ring-1 ${winner ? "bg-emerald-500/15 ring-emerald-400/40" : "bg-black/30 ring-white/10"}`}>
      <div className="flex items-center gap-3">
        <TeamCrest src={t.logo} abbr={t.abbr} name={t.name} className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-base font-extrabold text-white truncate">{t.name}</div>
          {t.scoreSummary && <div className="text-[11px] text-emerald-100/70 truncate">{t.scoreSummary}</div>}
        </div>
        {last && (
          <div className="shrink-0 text-right text-white">
            <div className="text-3xl font-extrabold tabular-nums leading-none">
              <ScoreFlip value={t.totalRuns} /><span className="text-lg text-emerald-200/80">/{last.wickets}</span>
            </div>
            {last.overs > 0 && <div className="text-[10px] text-emerald-100/60 mt-1 tabular-nums">{last.overs} ov</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function InningsCard({ inn, onPlayer }: { inn: CricketInningsDetail; onPlayer: (id: string) => void }) {
  const PlayerBtn = ({ id, name, children }: { id: string; name: string; children?: ReactNode }) =>
    id ? (
      <button
        type="button"
        onClick={() => onPlayer(id)}
        className="text-left hover:text-emerald-300 hover:underline underline-offset-2 transition truncate"
      >
        {name}{children}
      </button>
    ) : (
      <span className="truncate">{name}{children}</span>
    );
  return (

    <section className="rounded-2xl border border-gray-800 overflow-hidden">
      <header className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-900/70 border-b border-gray-800">
        <h3 className="text-sm font-bold">
          {inn.battingTeamName} <span className="text-gray-500 font-normal">— Innings {inn.period}</span>
        </h3>
        <span className="text-base font-extrabold tabular-nums">
          {inn.runs}<span className="text-gray-500 font-bold">/{inn.wickets}</span>
          {inn.overs > 0 && <span className="text-xs text-gray-500 font-normal ml-2 tabular-nums">({inn.overs} ov)</span>}
        </span>
      </header>
      {inn.batters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950/40 text-[10px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left px-3 py-2">Batter</th>
                <th className="text-left px-3 py-2 hidden sm:table-cell">Dismissal</th>
                <th className="text-right px-3 py-2">R</th>
                <th className="text-right px-3 py-2">B</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">4s</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">6s</th>
                <th className="text-right px-3 py-2">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inn.batters.map((b) => (
                <tr key={b.id || b.name} className="hover:bg-gray-900/40">
                  <td className="px-3 py-2 font-medium"><PlayerBtn id={b.id} name={b.name}>{b.notOut && <span className="text-emerald-400 ml-1">*</span>}</PlayerBtn></td>
                  <td className="px-3 py-2 text-xs text-gray-400 hidden sm:table-cell">{b.dismissal || (b.notOut ? "not out" : "—")}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold">{b.runs}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.balls}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">{b.fours}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">{b.sixes}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-400">{b.strikeRate || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {inn.bowlers.length > 0 && (
        <div className="overflow-x-auto border-t border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-950/40 text-[10px] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left px-3 py-2">Bowler</th>
                <th className="text-right px-3 py-2">O</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">M</th>
                <th className="text-right px-3 py-2">R</th>
                <th className="text-right px-3 py-2">W</th>
                <th className="text-right px-3 py-2">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inn.bowlers.map((b) => (
                <tr key={b.id || b.name} className="hover:bg-gray-900/40">
                  <td className="px-3 py-2 font-medium"><PlayerBtn id={b.id} name={b.name} /></td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.overs}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden sm:table-cell">{b.maidens}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.runs}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-emerald-300">{b.wickets}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-400">{b.economy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
