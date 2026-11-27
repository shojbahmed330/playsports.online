// "Today & Live" panel — highest-signal WC surface. Live first, then today's
// remaining fixtures with countdowns, then just-finished results, then next
// match card if the day is empty. Every card deep-links to /football/match/$id.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Clock, CheckCircle2, CalendarClock } from "lucide-react";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { derivePulse } from "@/lib/football-live";
import { flagOf } from "@/lib/flags";
import { Countdown } from "@/components/sports/Countdown";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { FootballPitchSkeleton } from "@/components/football/FootballSkeleton";
import { EmptyState } from "@/components/ui/state";

const LIVE_MS = 20 * 1000;

export function Wc2026TodayView() {
  const [hydrated, setHydrated] = useState(false);
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: LIVE_MS,
    refetchInterval: LIVE_MS,
    retry: 1,
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || q.isLoading) return <FootballPitchSkeleton rows={4} />;

  const fixtures = q.data?.fixtures ?? [];
  const pulse = derivePulse(fixtures);
  const todayUpcoming = pulse.today.filter((f) => f.status === "notstarted");
  const todayFinished = pulse.today.filter((f) => f.status === "finished");
  const isEmpty =
    pulse.live.length === 0 &&
    todayUpcoming.length === 0 &&
    todayFinished.length === 0 &&
    !pulse.next &&
    pulse.recent.length === 0;

  return (
    <div className="space-y-8">
      {pulse.live.length > 0 && (
        <Section
          title="Live now"
          icon={<Flame className="size-4" aria-hidden="true" />}
          tone="live"
          count={pulse.live.length}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pulse.live.map((f) => (
              <BigCard key={f.id} f={f} kind="live" />
            ))}
          </div>
        </Section>
      )}

      {todayUpcoming.length > 0 && (
        <Section
          title="Later today"
          icon={<Clock className="size-4" aria-hidden="true" />}
          tone="next"
          count={todayUpcoming.length}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayUpcoming.map((f) => (
              <SmallCard key={f.id} f={f} kind="upcoming" />
            ))}
          </div>
        </Section>
      )}

      {todayFinished.length > 0 && (
        <Section
          title="Today · finished"
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          tone="muted"
          count={todayFinished.length}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todayFinished.map((f) => (
              <SmallCard key={f.id} f={f} kind="final" />
            ))}
          </div>
        </Section>
      )}

      {pulse.live.length === 0 && todayUpcoming.length === 0 && pulse.next && (
        <Section
          title="Next match"
          icon={<CalendarClock className="size-4" aria-hidden="true" />}
          tone="info"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BigCard f={pulse.next} kind="next" />
            {pulse.upcoming.slice(1, 4).map((f) => (
              <SmallCard key={f.id} f={f} kind="upcoming" />
            ))}
          </div>
        </Section>
      )}

      {pulse.live.length === 0 &&
        pulse.today.length === 0 &&
        pulse.recent.length > 0 && (
          <Section
            title="Recent results"
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            tone="muted"
            count={pulse.recent.length}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pulse.recent.slice(0, 6).map((f) => (
                <SmallCard key={f.id} f={f} kind="final" />
              ))}
            </div>
          </Section>
        )}

      {isEmpty && (
        <EmptyState
          title="No matches right now"
          description="Tap Groups or Knockout above for the full schedule."
        />
      )}
    </div>
  );
}

// ─────────── UI helpers ───────────

function Section({
  title,
  icon,
  tone,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "live" | "next" | "info" | "muted";
  count?: number;
  children: React.ReactNode;
}) {
  const bar =
    tone === "live"
      ? "bg-live"
      : tone === "next"
        ? "bg-primary"
        : tone === "info"
          ? "bg-[var(--color-accent-mlb)]"
          : "bg-muted-foreground/60";
  const text =
    tone === "live"
      ? "text-live"
      : tone === "next"
        ? "text-primary"
        : tone === "info"
          ? "text-[var(--color-accent-mlb)]"
          : "text-muted-foreground";
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`block h-6 w-1.5 rounded-full ${bar}`} aria-hidden="true" />
        <h3 className={`inline-flex items-center gap-2 text-micro uppercase sm:text-caption ${text}`}>
          {icon} {title}
        </h3>
        {count != null && (
          <span className="text-micro tabular-nums text-muted-foreground">
            {count} match{count === 1 ? "" : "es"}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function LiveBadge({ f }: { f: Wc2026Fixture }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2 py-0.5 text-micro font-bold text-live ring-1 ring-live/40">
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live/70 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-live" />
      </span>
      {f.minute ? `${f.minute}'` : "LIVE"}
    </span>
  );
}

function TeamRow({
  name,
  goals,
  big,
  winner,
}: {
  name: string;
  goals: number | null;
  big?: boolean;
  winner?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={big ? "shrink-0 text-2xl sm:text-3xl" : "shrink-0 text-xl"} aria-hidden="true">
        {flagOf(name)}
      </span>
      <span
        className={`flex-1 truncate font-bold ${big ? "text-body sm:text-lg" : "text-caption"} ${winner ? "text-primary" : "text-foreground"}`}
      >
        {name}
      </span>
      <span
        className={`shrink-0 font-black tabular-nums ${big ? "text-2xl sm:text-4xl" : "text-lg"} ${winner ? "text-primary" : goals == null ? "text-muted-foreground/60" : "text-foreground"}`}
      >
        {goals ?? "-"}
      </span>
    </div>
  );
}

function BigCard({ f, kind }: { f: Wc2026Fixture; kind: "live" | "next" }) {
  const live = kind === "live";
  const startMs = f.startTs * 1000;
  const homeWin = (f.home.goals ?? 0) > (f.away.goals ?? 0);
  const awayWin = (f.away.goals ?? 0) > (f.home.goals ?? 0);
  return (
    <Link
      to="/football/match/$id"
      params={{ id: String(f.id) }}
      className={`group relative block rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 ${
        live
          ? "border-live/40 bg-[image:var(--gradient-hero)] shadow-[0_0_40px_-16px_var(--live)] hover:border-live/70"
          : "border-[var(--color-accent-mlb)]/30 bg-[image:var(--gradient-hero)] hover:border-[var(--color-accent-mlb)]/60"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="min-w-0 truncate text-micro uppercase text-primary">
          <span aria-hidden="true">⚽</span> {f.group}
        </span>
        {live ? (
          <LiveBadge f={f} />
        ) : (
          <span className="ml-2 shrink-0 text-micro font-semibold text-[var(--color-accent-mlb)]">
            {relativeDay(startMs)} · {formatLocalTime(startMs)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        <TeamRow name={f.home.name} goals={live ? f.home.goals : null} big winner={live && homeWin} />
        <TeamRow name={f.away.name} goals={live ? f.away.goals : null} big winner={live && awayWin} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-micro text-muted-foreground">
        <span className="min-w-0 truncate">{f.venue ?? "Venue TBD"}</span>
        {!live && <Countdown ts={startMs} />}
      </div>
    </Link>
  );
}

function SmallCard({
  f,
  kind,
}: {
  f: Wc2026Fixture;
  kind: "upcoming" | "final";
}) {
  const startMs = f.startTs * 1000;
  const final = kind === "final";
  const homeWin = final && (f.home.goals ?? 0) > (f.away.goals ?? 0);
  const awayWin = final && (f.away.goals ?? 0) > (f.home.goals ?? 0);
  return (
    <Link
      to="/football/match/$id"
      params={{ id: String(f.id) }}
      className="group relative block rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="min-w-0 truncate text-micro uppercase text-primary">
          {f.group}
        </span>
        <span
          className={`ml-2 shrink-0 text-micro font-bold ${final ? "text-muted-foreground" : "text-[var(--color-accent-mlb)]"}`}
        >
          {final ? "FT" : formatLocalTime(startMs)}
        </span>
      </div>
      <div className="space-y-1.5">
        <TeamRow name={f.home.name} goals={final ? f.home.goals : null} winner={homeWin} />
        <TeamRow name={f.away.name} goals={final ? f.away.goals : null} winner={awayWin} />
      </div>
      {!final && (
        <div className="mt-2 text-right text-micro text-muted-foreground">
          <Countdown ts={startMs} compact />
        </div>
      )}
    </Link>
  );
}
