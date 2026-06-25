import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getWc2026MatchEvents,
  getWc2026MatchLineups,
  getWc2026MatchStats,
  wc2026TeamLogo,
  type Wc2026Fixture,
  type Wc2026MatchEvent,
} from "@/lib/wc2026.functions";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Goal, Square, AlertTriangle, RefreshCw, Users, BarChart3,
  Activity, Loader2, Circle, ChevronRight,
} from "lucide-react";
import { PlayerProfileSheet, type PlayerSheetTarget } from "./PlayerProfileSheet";

function isLive(status: string) {
  return status === "inprogress";
}

function MinuteBadge({ minute, injuryTime }: { minute: number | null; injuryTime: number | null }) {
  if (minute == null) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[34px] text-[11px] font-bold text-amber-300 bg-amber-500/10 ring-1 ring-amber-500/30 rounded-md px-1.5 py-0.5">
      {minute}{injuryTime ? `+${injuryTime}` : ""}'
    </span>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "goal":
    case "penalty":
      return <Goal className="size-4 text-emerald-400" />;
    case "own_goal":
      return <Goal className="size-4 text-red-400" />;
    case "yellowcard":
      return <Square className="size-3 fill-yellow-400 text-yellow-500" />;
    case "redcard":
      return <Square className="size-3 fill-red-500 text-red-600" />;
    case "yellow_red":
      return <Square className="size-3 fill-orange-500 text-orange-600" />;
    case "substitution":
      return <RefreshCw className="size-3.5 text-sky-400" />;
    case "var":
      return <AlertTriangle className="size-3.5 text-purple-400" />;
    default:
      return <Circle className="size-2.5 text-gray-500" />;
  }
}

function EventRow({ ev, side }: { ev: Wc2026MatchEvent; side: "home" | "away" }) {
  const align = side === "home" ? "justify-end text-right" : "justify-start text-left";
  return (
    <div className={`flex items-center gap-2 ${align}`}>
      {side === "away" && <MinuteBadge minute={ev.minute} injuryTime={ev.injuryTime} />}
      <div className="flex items-center gap-1.5 min-w-0">
        {side === "away" && <EventIcon type={ev.type} />}
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">
            {ev.playerName ?? ev.description ?? ev.type}
          </div>
          {ev.assistName && (
            <div className="text-[10px] text-gray-500 truncate">assist: {ev.assistName}</div>
          )}
        </div>
        {side === "home" && <EventIcon type={ev.type} />}
      </div>
      {side === "home" && <MinuteBadge minute={ev.minute} injuryTime={ev.injuryTime} />}
    </div>
  );
}

function TimelineTab({ matchId, live }: { matchId: number; live: boolean }) {
  const q = useQuery({
    queryKey: ["wc2026-events", matchId],
    queryFn: () => getWc2026MatchEvents({ data: { matchId } }),
    refetchInterval: live ? 30_000 : false,
  });

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
        <Loader2 className="size-4 animate-spin mr-2" /> Loading timeline…
      </div>
    );
  }
  const events = q.data?.events ?? [];
  if (q.data?.error) {
    return <EmptyNote label="Timeline unavailable for this match." err={q.data.error} />;
  }
  if (events.length === 0) {
    return <EmptyNote label="No events yet. Kickoff coming soon." />;
  }
  return (
    <div className="space-y-2">
      {events.map((ev) => (
        <div
          key={String(ev.id)}
          className="grid grid-cols-[1fr_36px_1fr] items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02]"
        >
          {ev.team === "home" ? <EventRow ev={ev} side="home" /> : <div />}
          <div className="text-center text-[10px] text-gray-500 font-mono">
            {ev.minute != null ? `${ev.minute}'` : ""}
          </div>
          {ev.team === "away" ? <EventRow ev={ev} side="away" /> : <div />}
        </div>
      ))}
    </div>
  );
}

function LineupsTab({ matchId }: { matchId: number }) {
  const q = useQuery({
    queryKey: ["wc2026-lineups", matchId],
    queryFn: () => getWc2026MatchLineups({ data: { matchId } }),
    staleTime: 5 * 60_000,
  });
  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
        <Loader2 className="size-4 animate-spin mr-2" /> Loading lineups…
      </div>
    );
  }
  const l = q.data?.lineups;
  if (!l || (l.home.length === 0 && l.away.length === 0)) {
    return <EmptyNote label="Lineups not announced yet. Usually 1 hour before kickoff." />;
  }
  const starters = (arr: typeof l.home) => arr.filter((p) => !p.substitute);
  const subs     = (arr: typeof l.home) => arr.filter((p) =>  p.substitute);
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <LineupColumn title="Home" formation={l.formationHome} starters={starters(l.home)} subs={subs(l.home)} />
      <LineupColumn title="Away" formation={l.formationAway} starters={starters(l.away)} subs={subs(l.away)} />
    </div>
  );
}

function LineupColumn({
  title, formation, starters, subs,
}: {
  title: string;
  formation: string | null;
  starters: { id: number; name: string; shirt: number | null; position: string | null; captain: boolean }[];
  subs:     { id: number; name: string; shirt: number | null; position: string | null; captain: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{title}</div>
        {formation && (
          <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-800 rounded-md text-amber-300">
            {formation}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {starters.map((p) => (
          <PlayerRow key={p.id} {...p} />
        ))}
      </div>
      {subs.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-gray-600 mt-3 mb-1">Subs</div>
          <div className="space-y-1">
            {subs.map((p) => <PlayerRow key={p.id} {...p} dim />)}
          </div>
        </>
      )}
    </div>
  );
}

function PlayerRow({
  name, shirt, position, captain, dim,
}: {
  name: string; shirt: number | null; position: string | null; captain: boolean; dim?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs ${dim ? "text-gray-500" : "text-gray-200"}`}>
      <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-gray-800 text-[10px] font-mono text-gray-400">
        {shirt ?? "—"}
      </span>
      <span className="flex-1 truncate">{name}</span>
      {captain && <span className="text-[9px] font-bold text-amber-400 ring-1 ring-amber-400/40 rounded px-1">C</span>}
      {position && <span className="text-[9px] text-gray-500 uppercase">{position}</span>}
    </div>
  );
}

function StatsTab({ matchId, live }: { matchId: number; live: boolean }) {
  const q = useQuery({
    queryKey: ["wc2026-stats", matchId],
    queryFn: () => getWc2026MatchStats({ data: { matchId } }),
    refetchInterval: live ? 60_000 : false,
  });
  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
        <Loader2 className="size-4 animate-spin mr-2" /> Loading stats…
      </div>
    );
  }
  const groups = q.data?.stats ?? [];
  if (groups.length === 0) {
    return <EmptyNote label="Match stats not available yet." />;
  }
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.group} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">{g.group}</div>
          <div className="space-y-1.5">
            {g.rows.map((r, i) => <StatRow key={i} {...r} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatRow({ name, home, away }: { name: string; home: string; away: string }) {
  const h = parseFloat(home.replace("%", "")) || 0;
  const a = parseFloat(away.replace("%", "")) || 0;
  const total = h + a;
  const hPct = total ? (h / total) * 100 : 50;
  return (
    <div>
      <div className="grid grid-cols-[60px_1fr_60px] items-center text-xs">
        <span className="font-bold text-white text-right">{home}</span>
        <span className="text-center text-gray-400 text-[10px] uppercase tracking-wider">{name}</span>
        <span className="font-bold text-white text-left">{away}</span>
      </div>
      <div className="h-1 rounded-full bg-gray-800 overflow-hidden mt-1 flex">
        <div className="bg-amber-500 transition-all" style={{ width: `${hPct}%` }} />
        <div className="bg-sky-500 transition-all" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

function EmptyNote({ label, err }: { label: string; err?: string }) {
  return (
    <div className="text-center py-10 text-sm text-gray-500">
      {label}
      {err && <div className="mt-1 text-[10px] text-red-400/60">({err})</div>}
    </div>
  );
}

/** Main live-match-center component shown inside dialog or page. */
export function LiveMatchCenter({ fixture }: { fixture: Wc2026Fixture }) {
  const live = isLive(fixture.status);

  useEffect(() => {
    // bump page title while live
    if (!live || typeof document === "undefined") return;
    const prev = document.title;
    document.title = `🔴 ${fixture.home.code} ${fixture.home.goals ?? 0}-${fixture.away.goals ?? 0} ${fixture.away.code}`;
    return () => { document.title = prev; };
  }, [live, fixture]);

  return (
    <div className="space-y-4">
      <MatchHeader fixture={fixture} live={live} />
      <Tabs defaultValue="timeline">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="timeline" className="text-xs gap-1.5">
            <Activity className="size-3.5" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="lineups" className="text-xs gap-1.5">
            <Users className="size-3.5" /> Lineups
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs gap-1.5">
            <BarChart3 className="size-3.5" /> Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-3">
          <TimelineTab matchId={fixture.id} live={live} />
        </TabsContent>
        <TabsContent value="lineups" className="mt-3">
          <LineupsTab matchId={fixture.id} />
        </TabsContent>
        <TabsContent value="stats" className="mt-3">
          <StatsTab matchId={fixture.id} live={live} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchHeader({ fixture, live }: { fixture: Wc2026Fixture; live: boolean }) {
  const dateLabel = new Date(fixture.startTs * 1000).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-4">
      {live && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-300 bg-red-500/10 ring-1 ring-red-500/40 rounded-full px-2 py-0.5 live-pulse">
          <Circle className="size-2 fill-red-500 text-red-500 minute-blink" />
          Live {fixture.minute != null ? `· ${fixture.minute}'` : ""}
        </div>
      )}
      <div className="text-[11px] text-gray-500 uppercase tracking-wider">{fixture.group}</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-2">
        <TeamBlock id={fixture.home.id} name={fixture.home.name} code={fixture.home.code} align="right" />
        <div className="text-center">
          <div className="text-3xl font-black tabular-nums text-white">
            {fixture.home.goals ?? "–"}<span className="text-gray-600 mx-1">:</span>{fixture.away.goals ?? "–"}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">{live ? fixture.statusDesc : dateLabel}</div>
        </div>
        <TeamBlock id={fixture.away.id} name={fixture.away.name} code={fixture.away.code} align="left" />
      </div>
      {(fixture.venue || fixture.city) && (
        <div className="text-center text-[10px] text-gray-600 mt-2">
          {[fixture.venue, fixture.city].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
}

function TeamBlock({
  id, name, code, align,
}: { id: number; name: string; code: string; align: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
      {align === "left" && id ? (
        <img src={wc2026TeamLogo(id)} alt={code} className="size-10 object-contain" />
      ) : null}
      <div className={align === "right" ? "text-right" : "text-left"}>
        <div className="text-sm font-bold text-white">{name || code}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{code}</div>
      </div>
      {align === "right" && id ? (
        <img src={wc2026TeamLogo(id)} alt={code} className="size-10 object-contain" />
      ) : null}
    </div>
  );
}
