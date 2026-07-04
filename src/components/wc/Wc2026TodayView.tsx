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
          icon={<Flame className="size-4" />}
          tone="red"
          count={pulse.live.length}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pulse.live.map((f) => (
              <BigCard key={f.id} f={f} kind="live" />
            ))}
          </div>
        </Section>
      )}

      {todayUpcoming.length > 0 && (
        <Section
          title="Later today"
          icon={<Clock className="size-4" />}
          tone="amber"
          count={todayUpcoming.length}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayUpcoming.map((f) => (
              <SmallCard key={f.id} f={f} kind="upcoming" />
            ))}
          </div>
        </Section>
      )}

      {todayFinished.length > 0 && (
        <Section
          title="Today · finished"
          icon={<CheckCircle2 className="size-4" />}
          tone="gray"
          count={todayFinished.length}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayFinished.map((f) => (
              <SmallCard key={f.id} f={f} kind="final" />
            ))}
          </div>
        </Section>
      )}

      {pulse.live.length === 0 && todayUpcoming.length === 0 && pulse.next && (
        <Section
          title="Next match"
          icon={<CalendarClock className="size-4" />}
          tone="sky"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            icon={<CheckCircle2 className="size-4" />}
            tone="gray"
            count={pulse.recent.length}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pulse.recent.slice(0, 6).map((f) => (
                <SmallCard key={f.id} f={f} kind="final" />
              ))}
            </div>
          </Section>
        )}

      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-gray-800 p-10 sm:p-12 text-center bg-gray-900/40">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-sm font-medium text-gray-200">
            No matches right now
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap <span className="text-amber-300 font-semibold">Groups</span> or{" "}
            <span className="text-amber-300 font-semibold">Knockout</span> above
            for the full schedule.
          </p>
        </div>
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
  tone: "red" | "amber" | "sky" | "gray";
  count?: number;
  children: React.ReactNode;
}) {
  const bar =
    tone === "red"
      ? "bg-red-500"
      : tone === "amber"
        ? "bg-amber-500"
        : tone === "sky"
          ? "bg-sky-500"
          : "bg-gray-500";
  const text =
    tone === "red"
      ? "text-red-300"
      : tone === "amber"
        ? "text-amber-300"
        : tone === "sky"
          ? "text-sky-300"
          : "text-gray-300";
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`block w-1.5 h-6 rounded-full ${bar}`} />
        <h3
          className={`text-xs sm:text-sm font-bold uppercase tracking-[0.18em] ${text} inline-flex items-center gap-2`}
        >
          {icon} {title}
        </h3>
        {count != null && (
          <span className="text-[10px] text-gray-500 tabular-nums">
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
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
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
    <div className="flex items-center gap-2 min-w-0">
      <span className={big ? "text-2xl sm:text-3xl shrink-0" : "text-xl shrink-0"}>
        {flagOf(name)}
      </span>
      <span
        className={`truncate flex-1 font-bold ${big ? "text-base sm:text-lg" : "text-sm"} ${winner ? "text-amber-300" : "text-white"}`}
      >
        {name}
      </span>
      <span
        className={`shrink-0 tabular-nums font-black ${big ? "text-2xl sm:text-4xl" : "text-lg"} ${winner ? "text-amber-300" : goals == null ? "text-gray-600" : "text-gray-200"}`}
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
      className={`group relative block rounded-2xl border p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        live
          ? "border-red-500/40 bg-gradient-to-br from-red-950/40 via-gray-950 to-gray-900 hover:border-red-400/70 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
          : "border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-gray-950 to-gray-900 hover:border-sky-400/60"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-300 truncate min-w-0">
          ⚽ {f.group}
        </span>
        {live ? (
          <LiveBadge f={f} />
        ) : (
          <span className="text-[10px] font-semibold text-sky-200 shrink-0 ml-2">
            {relativeDay(startMs)} · {formatLocalTime(startMs)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        <TeamRow name={f.home.name} goals={live ? f.home.goals : null} big winner={live && homeWin} />
        <TeamRow name={f.away.name} goals={live ? f.away.goals : null} big winner={live && awayWin} />
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 gap-2">
        <span className="truncate min-w-0">{f.venue ?? "Venue TBD"}</span>
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
      className="group relative block rounded-xl border border-white/10 bg-gray-900/70 p-3 transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-gray-900"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] uppercase tracking-widest font-bold text-amber-300 truncate min-w-0">
          {f.group}
        </span>
        <span
          className={`text-[10px] font-bold shrink-0 ml-2 ${final ? "text-gray-400" : "text-sky-300"}`}
        >
          {final ? "FT" : formatLocalTime(startMs)}
        </span>
      </div>
      <div className="space-y-1.5">
        <TeamRow name={f.home.name} goals={final ? f.home.goals : null} winner={homeWin} />
        <TeamRow name={f.away.name} goals={final ? f.away.goals : null} winner={awayWin} />
      </div>
      {!final && (
        <div className="mt-2 text-[10px] text-gray-500 text-right">
          <Countdown ts={startMs} compact />
        </div>
      )}
    </Link>
  );
}
