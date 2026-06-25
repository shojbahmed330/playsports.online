import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, MapPin, Tv, CloudSun, Users, TrendingUp } from "lucide-react";
import { getMlbGame, type MlbProbable, type MlbLinescoreTeam, type MlbGameSummary } from "@/lib/mlb.functions";
import { MlbLinescore } from "@/components/mlb/MlbLinescore";
import { MlbBoxScore } from "@/components/mlb/MlbBoxScore";
import { MlbScoringPlays } from "@/components/mlb/MlbScoringPlays";
import { formatLocalTime, relativeDay } from "@/lib/time";

export const Route = createFileRoute("/mlb/game/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `MLB Game · Boxscore & Live Updates — ${params.id}` },
      { name: "description", content: "Live MLB boxscore: inning-by-inning linescore, batting and pitching stats, scoring plays, probables, venue, weather, odds." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getMlbGame);
  const q = useQuery({
    queryKey: ["mlb", "game", id],
    queryFn: () => fn({ data: { id } }),
    refetchInterval: (qq) => {
      const d = qq.state.data as { summary?: { status?: string } } | undefined;
      return d?.summary?.status === "in" ? 15_000 : false;
    },
    staleTime: 10_000,
  });

  const [tab, setTab] = useState<"box" | "plays" | "info">("box");

  if (q.isLoading) {
    return <div className="space-y-3"><div className="h-40 rounded-2xl bg-card animate-pulse" /><div className="h-72 rounded-2xl bg-card animate-pulse" /></div>;
  }
  const s = q.data?.summary;
  if (!s) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Game not found.{" "}
        <Link to="/mlb/scores" className="underline">Back to scores</Link>
      </div>
    );
  }

  const isLive = s.status === "in";
  const isPre = s.status === "pre";

  return (
    <div className="space-y-5">
      <Link to="/mlb/scores" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white">
        <ArrowLeft className="size-3.5" /> All scores
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-5">
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-40" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={s.status} detail={s.statusDetail} short={s.shortDetail} />
            {q.isFetching && isLive && (
              <span className="text-[10px] text-white/60 inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-300 animate-pulse" /> Updating…
              </span>
            )}
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <TeamBlock t={s.away} align="left" />
            <div className="text-center">
              {isPre ? (
                <div className="text-xs text-white/70 font-semibold">
                  <div>{relativeDay(s.startTs)}</div>
                  <div className="mt-1 text-base text-white">{formatLocalTime(s.startTs)}</div>
                </div>
              ) : (
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Final</div>
              )}
            </div>
            <TeamBlock t={s.home} align="right" />
          </div>
        </div>
      </div>

      {/* Probables (pre-game) */}
      {isPre && (s.probables.home || s.probables.away) && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">Probable Pitchers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProbableCard p={s.probables.away} />
            <ProbableCard p={s.probables.home} />
          </div>
        </section>
      )}

      {/* Linescore */}
      {!isPre && <MlbLinescore home={s.home} away={s.away} innings={s.inningCount} />}

      {/* Tabs */}
      {!isPre && (
        <div className="flex items-center gap-1 border-b border-border">
          <TabBtn label="Boxscore" active={tab === "box"} onClick={() => setTab("box")} />
          <TabBtn label={`Scoring Plays (${s.scoringPlays.length})`} active={tab === "plays"} onClick={() => setTab("plays")} />
          <TabBtn label="Game Info" active={tab === "info"} onClick={() => setTab("info")} />
        </div>
      )}

      {!isPre && tab === "box" && <MlbBoxScore groups={s.boxscore} />}
      {!isPre && tab === "plays" && <MlbScoringPlays plays={s.scoringPlays} />}
      {(!isPre && tab === "info") || isPre ? <GameInfo s={s} /> : null}
    </div>
  );
}

function StatusBadge({ status, detail, short }: { status: "pre" | "in" | "post"; detail: string; short: string }) {
  if (status === "in") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 ring-1 ring-red-400/40 text-red-100 text-[11px] font-bold uppercase tracking-wider">
        <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> Live · {short || detail}
      </span>
    );
  }
  if (status === "post") {
    return <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-white text-[11px] font-bold uppercase tracking-wider">{short || "Final"}</span>;
  }
  return <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 ring-1 ring-amber-400/40 text-amber-100 text-[11px] font-bold uppercase tracking-wider">Scheduled</span>;
}

function TeamBlock({ t, align }: { t: MlbLinescoreTeam; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "justify-end flex-row-reverse text-right" : ""}`}>
      <div className="size-14 sm:size-16 rounded-xl bg-white/10 ring-1 ring-white/20 grid place-items-center shrink-0">
        {t.logo ? <img src={t.logo} alt="" className="size-11 object-contain" /> : <span className="text-xs font-bold text-white">{t.abbr}</span>}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">{t.abbr}{t.record ? ` · ${t.record}` : ""}</div>
        <Link to="/mlb/team/$id" params={{ id: t.id }} className="text-base sm:text-lg font-extrabold text-white truncate hover:text-[#f7e6c4]">
          {t.shortName || t.name}
        </Link>
        {t.score != null && (
          <div className={`text-3xl sm:text-4xl font-black tabular-nums mt-1 ${t.winner ? "text-[#f7e6c4]" : "text-white"}`}>{t.score}</div>
        )}
      </div>
    </div>
  );
}

function ProbableCard({ p }: { p: MlbProbable | null }) {
  if (!p) return <div className="rounded-xl bg-white/[0.03] ring-1 ring-border p-4 text-xs text-muted-foreground">TBD</div>;
  const content = (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-border p-3 hover:ring-[#d50032]/40 transition">
      <div className="size-12 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden shrink-0 grid place-items-center">
        {p.headshot ? <img src={p.headshot} alt="" className="size-full object-cover" /> : <span className="text-[10px] text-muted-foreground">⚾</span>}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[#f7e6c4] font-bold">{p.teamAbbr ?? "Probable"}</div>
        <div className="text-sm font-bold text-white truncate">{p.name}</div>
        {p.summary && <div className="text-[11px] text-muted-foreground mt-0.5">{p.summary}</div>}
      </div>
    </div>
  );
  return p.athleteId ? (
    <Link to="/mlb/player/$id" params={{ id: p.athleteId }}>{content}</Link>
  ) : content;
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative px-4 py-2.5 text-sm font-bold transition-colors ${active ? "text-white" : "text-gray-400 hover:text-gray-200"}`}>
      {label}
      {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#d50032]" />}
    </button>
  );
}

function GameInfo({ s }: { s: MlbGameSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {s.venue.name && (
        <InfoCard icon={<MapPin className="size-4" />} label="Venue">
          <div className="font-semibold text-white">{s.venue.name}</div>
          {s.venue.city && <div className="text-xs text-muted-foreground">{s.venue.city}</div>}
          {s.venue.capacity && <div className="text-[10px] text-muted-foreground mt-1">Capacity {s.venue.capacity.toLocaleString()}</div>}
        </InfoCard>
      )}
      {s.weather && (s.weather.condition || s.weather.temperature != null) && (
        <InfoCard icon={<CloudSun className="size-4" />} label="Weather">
          <div className="font-semibold text-white">{s.weather.condition ?? "—"}</div>
          {s.weather.temperature != null && <div className="text-xs text-muted-foreground">{s.weather.temperature}°F</div>}
        </InfoCard>
      )}
      {s.broadcast && (
        <InfoCard icon={<Tv className="size-4" />} label="Broadcast">
          <div className="font-semibold text-white">{s.broadcast}</div>
        </InfoCard>
      )}
      {s.attendance != null && (
        <InfoCard icon={<Users className="size-4" />} label="Attendance">
          <div className="font-semibold text-white tabular-nums">{s.attendance.toLocaleString()}</div>
        </InfoCard>
      )}
      {s.odds && (s.odds.details || s.odds.overUnder != null) && (
        <InfoCard icon={<TrendingUp className="size-4" />} label={`Odds${s.odds.provider ? ` · ${s.odds.provider}` : ""}`}>
          {s.odds.details && <div className="font-semibold text-white">{s.odds.details}</div>}
          {s.odds.overUnder != null && <div className="text-xs text-muted-foreground">O/U {s.odds.overUnder}</div>}
        </InfoCard>
      )}
      {s.leaders.length > 0 && (
        <div className="sm:col-span-2 rounded-2xl bg-card ring-1 ring-border p-4">
          <div className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">Game Leaders</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {s.leaders.map((l, i) => (
              <li key={i}>
                <Link to="/mlb/player/$id" params={{ id: l.athleteId }} className="flex items-center gap-3 rounded-lg hover:bg-white/[0.04] p-2">
                  <div className="size-9 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden grid place-items-center shrink-0">
                    {l.headshot ? <img src={l.headshot} alt="" className="size-full object-cover" /> : <span className="text-[10px] text-muted-foreground">{l.teamAbbr}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{l.label} · {l.teamAbbr}</div>
                    <div className="text-sm font-bold text-white truncate">{l.name}</div>
                  </div>
                  <div className="text-sm font-extrabold tabular-nums text-[#f7e6c4]">{l.displayValue}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4">
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">{icon} {label}</div>
      <div className="mt-1.5 text-sm">{children}</div>
    </div>
  );
}

// type helper for GameInfo
type GameData = NonNullable<Awaited<ReturnType<typeof getMlbGame>>["summary"]>;
function useGameData(): GameData { return undefined as unknown as GameData; }
