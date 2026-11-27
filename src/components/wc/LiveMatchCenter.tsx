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
  Activity, Loader2, Circle, ChevronRight, MessageSquare,
} from "lucide-react";
import { PlayerProfileSheet, type PlayerSheetTarget } from "./PlayerProfileSheet";
import { FormationPitch } from "@/components/football/FormationPitch";
import { CommentaryFeed } from "@/components/football/CommentaryFeed";

function isLive(status: string) {
  return status === "inprogress";
}

function MinuteBadge({ minute, injuryTime }: { minute: number | null; injuryTime: number | null }) {
  if (minute == null) return null;
  return (
    <span className="inline-flex min-w-[34px] items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 text-micro font-bold text-primary ring-1 ring-primary/30">
      {minute}{injuryTime ? `+${injuryTime}` : ""}'
    </span>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "goal":
    case "penalty":
      return <Goal className="size-4 text-positive" aria-hidden="true" />;
    case "own_goal":
      return <Goal className="size-4 text-live" aria-hidden="true" />;
    case "yellowcard":
      return <Square className="size-3 fill-gold text-gold" aria-hidden="true" />;
    case "redcard":
      return <Square className="size-3 fill-live text-live" aria-hidden="true" />;
    case "yellow_red":
      return <Square className="size-3 fill-live text-gold" aria-hidden="true" />;
    case "substitution":
      return <RefreshCw className="size-3.5 text-[var(--color-accent-mlb)]" aria-hidden="true" />;
    case "var":
      return <AlertTriangle className="size-3.5 text-[var(--color-accent-nhl)]" aria-hidden="true" />;
    default:
      return <Circle className="size-2.5 text-muted-foreground" aria-hidden="true" />;
  }
}

function EventRow({ ev, side }: { ev: Wc2026MatchEvent; side: "home" | "away" }) {
  const align = side === "home" ? "justify-end text-right" : "justify-start text-left";
  return (
    <div className={`flex min-w-0 items-center gap-2 overflow-hidden ${align}`}>
      {side === "away" && <MinuteBadge minute={ev.minute} injuryTime={ev.injuryTime} />}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {side === "away" && <span className="shrink-0"><EventIcon type={ev.type} /></span>}
        <div className="min-w-0 flex-1">
          <div className="truncate text-caption font-medium text-foreground">
            {ev.playerName ?? ev.description ?? ev.type}
          </div>
          {ev.assistName && (
            <div className="truncate text-micro text-muted-foreground">assist: {ev.assistName}</div>
          )}
        </div>
        {side === "home" && <span className="shrink-0"><EventIcon type={ev.type} /></span>}
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
      <div className="flex items-center justify-center py-10 text-caption text-muted-foreground" role="status">
        <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading timeline…
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
    <div className="w-full min-w-0 space-y-2 overflow-hidden">
      {events.map((ev) => (
        <div
          key={String(ev.id)}
          className="grid min-w-0 grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/30"
        >
          {ev.team === "home" ? <EventRow ev={ev} side="home" /> : <div className="min-w-0" />}
          <div className="shrink-0 text-center font-mono text-micro text-muted-foreground">
            {ev.minute != null ? `${ev.minute}'` : ""}
          </div>
          {ev.team === "away" ? <EventRow ev={ev} side="away" /> : <div className="min-w-0" />}
        </div>
      ))}
    </div>
  );
}

function LineupsTab({
  matchId,
  homeTeam,
  awayTeam,
}: {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
}) {
  const [active, setActive] = useState<PlayerSheetTarget | null>(null);
  const q = useQuery({
    queryKey: ["wc2026-lineups", matchId],
    queryFn: () => getWc2026MatchLineups({ data: { matchId } }),
    staleTime: 5 * 60_000,
  });
  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-caption text-muted-foreground" role="status">
        <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading lineups…
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
    <>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <LineupColumn
          title={homeTeam}
          side="home"
          formation={l.formationHome}
          starters={starters(l.home)}
          subs={subs(l.home)}
          onPick={(p) => setActive({ ...p, team: homeTeam })}
        />
        <LineupColumn
          title={awayTeam}
          side="away"
          formation={l.formationAway}
          starters={starters(l.away)}
          subs={subs(l.away)}
          onPick={(p) => setActive({ ...p, team: awayTeam })}
        />
      </div>
      <PlayerProfileSheet player={active} onClose={() => setActive(null)} />
    </>
  );
}

type LineupPlayer = {
  id: number; name: string; shirt: number | null; position: string | null; captain: boolean; substitute?: boolean;
};

function LineupColumn({
  title, side, formation, starters, subs, onPick,
}: {
  title: string;
  side: "home" | "away";
  formation: string | null;
  starters: LineupPlayer[];
  subs: LineupPlayer[];
  onPick: (p: PlayerSheetTarget) => void;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="truncate text-caption font-bold uppercase text-foreground">{title}</div>
        {formation && (
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-micro text-primary">
            {formation}
          </span>
        )}
      </div>

      <div className="mb-3">
        <FormationPitch
          formation={formation}
          side={side}
          starters={starters.map((p) => ({ ...p, substitute: false })) as never}
          onPick={(p) => onPick(p as PlayerSheetTarget)}
        />
      </div>
      <div className="space-y-1">
        {starters.map((p) => (
          <PlayerRow key={p.id} {...p} onPick={() => onPick(p)} />
        ))}
      </div>
      {subs.length > 0 && (
        <>
          <div className="mb-1 mt-3 text-micro uppercase text-muted-foreground">Subs</div>
          <div className="space-y-1">
            {subs.map((p) => <PlayerRow key={p.id} {...p} dim onPick={() => onPick(p)} />)}
          </div>
        </>
      )}
    </div>
  );
}

function PlayerRow({
  name, shirt, position, captain, dim, onPick,
}: {
  name: string; shirt: number | null; position: string | null; captain: boolean; dim?: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`group -mx-1.5 flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg px-1.5 text-caption transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${dim ? "text-muted-foreground hover:text-foreground" : "text-foreground"}`}
    >
      <span className="inline-flex h-5 w-6 shrink-0 items-center justify-center rounded bg-muted font-mono text-micro text-muted-foreground">
        {shirt ?? "—"}
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{name}</span>
      {captain && <span className="shrink-0 rounded px-1 text-micro font-bold text-primary ring-1 ring-primary/40">C</span>}
      {position && <span className="max-w-[3.5rem] shrink-0 truncate text-micro uppercase text-muted-foreground">{position}</span>}
      <ChevronRight className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
    </button>
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
      <div className="flex items-center justify-center py-10 text-caption text-muted-foreground" role="status">
        <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading stats…
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
        <div key={g.group} className="rounded-xl border border-border bg-card/40 p-3">
          <div className="mb-2 text-micro uppercase text-muted-foreground">{g.group}</div>
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
      <div className="grid grid-cols-[60px_1fr_60px] items-center text-caption">
        <span className="text-right font-bold text-foreground">{home}</span>
        <span className="text-center text-micro uppercase text-muted-foreground">{name}</span>
        <span className="text-left font-bold text-foreground">{away}</span>
      </div>
      <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary transition-all" style={{ width: `${hPct}%` }} />
        <div className="bg-[var(--color-accent-mlb)] transition-all" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

function EmptyNote({ label, err }: { label: string; err?: string }) {
  return (
    <div className="py-10 text-center text-caption text-muted-foreground">
      {label}
      {err && <div className="mt-1 text-micro text-destructive/60">({err})</div>}
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
      <Tabs defaultValue={live ? "commentary" : "timeline"}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline" className="gap-1 text-micro sm:gap-1.5 sm:text-caption">
            <Activity className="size-3.5" aria-hidden="true" /> <span className="hidden xs:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="commentary" className="gap-1 text-micro sm:gap-1.5 sm:text-caption">
            <MessageSquare className="size-3.5" aria-hidden="true" /> <span className="hidden xs:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="lineups" className="gap-1 text-micro sm:gap-1.5 sm:text-caption">
            <Users className="size-3.5" aria-hidden="true" /> <span className="hidden xs:inline">Lineups</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1 text-micro sm:gap-1.5 sm:text-caption">
            <BarChart3 className="size-3.5" aria-hidden="true" /> <span className="hidden xs:inline">Stats</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-3">
          <TimelineTab matchId={fixture.id} live={live} />
        </TabsContent>
        <TabsContent value="commentary" className="mt-3">
          <CommentaryFeed
            matchId={fixture.id}
            live={live}
            homeCode={fixture.home.code || fixture.home.name}
            awayCode={fixture.away.code || fixture.away.name}
          />
        </TabsContent>
        <TabsContent value="lineups" className="mt-3">
          <LineupsTab matchId={fixture.id} homeTeam={fixture.home.name || fixture.home.code} awayTeam={fixture.away.name || fixture.away.code} />
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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4">
      {live && (
        <div className="live-pulse absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-0.5 text-micro font-bold uppercase text-live ring-1 ring-live/40">
          <Circle className="minute-blink size-2 fill-live text-live" aria-hidden="true" />
          Live {fixture.minute != null ? `· ${fixture.minute}'` : ""}
        </div>
      )}
      <div className="text-micro uppercase text-muted-foreground">{fixture.group}</div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock id={fixture.home.id} name={fixture.home.name} code={fixture.home.code} align="right" />
        <div className="text-center">
          <div className="text-3xl font-black tabular-nums text-foreground">
            {fixture.home.goals ?? "–"}<span className="mx-1 text-muted-foreground">:</span>{fixture.away.goals ?? "–"}
          </div>
          <div className="mt-1 text-micro text-muted-foreground">{live ? fixture.statusDesc : dateLabel}</div>
        </div>
        <TeamBlock id={fixture.away.id} name={fixture.away.name} code={fixture.away.code} align="left" />
      </div>
      {(fixture.venue || fixture.city) && (
        <div className="mt-2 text-center text-micro text-muted-foreground">
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
        <img loading="lazy" decoding="async" src={wc2026TeamLogo(id)} alt="" className="size-10 object-contain" />
      ) : null}
      <div className={align === "right" ? "text-right" : "text-left"}>
        <div className="text-caption font-bold text-foreground">{name || code}</div>
        <div className="text-micro uppercase text-muted-foreground">{code}</div>
      </div>
      {align === "right" && id ? (
        <img loading="lazy" decoding="async" src={wc2026TeamLogo(id)} alt="" className="size-10 object-contain" />
      ) : null}
    </div>
  );
}
