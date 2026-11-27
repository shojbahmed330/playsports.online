import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Radio, Calendar, Goal, Clock, Play } from "lucide-react";
import { getWc2026Fixtures } from "@/lib/wc2026.functions";
import { derivePulse } from "@/lib/football-live";
import { formatCountdown, formatLocalTime } from "@/lib/time";
import { flagOf } from "@/lib/flags";
import { WatchLivePanel } from "@/components/wc/WatchLivePanel";

const LIVE_MS = 20_000;

export function FootballHero() {
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: LIVE_MS,
    refetchInterval: LIVE_MS,
    retry: 1,
  });

  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pulse = derivePulse(hydrated ? q.data?.fixtures : undefined);

  const countdown =
    hydrated && pulse.next ? formatCountdown(pulse.next.startTs * 1000 - Date.now()) : null;
  // Touch tick so re-renders flow (lint).
  void tick;

  const heroline =
    pulse.phase === "live"
      ? `${pulse.live.length} match${pulse.live.length === 1 ? "" : "es"} live right now`
      : pulse.phase === "today"
        ? `${pulse.today.length} match${pulse.today.length === 1 ? "" : "es"} today`
        : pulse.next
          ? `Next kickoff in ${countdown}`
          : "Live fixtures, bracket and top scorers.";

  return (
    <section className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, color-mix(in oklch, var(--color-accent-football) 30%, transparent), transparent 60%), radial-gradient(40% 70% at 85% 100%, color-mix(in oklch, var(--color-live) 22%, transparent), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-col items-center text-center">
          {pulse.phase === "live" && (
            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-live px-3 py-1 text-micro uppercase text-live-foreground shadow-[var(--shadow-elevated)]">
              <span className="size-1.5 rounded-full bg-live-foreground animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              Live now
            </span>
          )}

          <h1 className="text-h1 text-foreground sm:text-display">
            FIFA World Cup <span className="text-primary">2026</span>
          </h1>
          <p className="mt-3 max-w-xl px-2 text-body text-muted-foreground sm:text-lg">
            {heroline}
          </p>

          {/* STAT PILLS */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatPill
              icon={<Radio className="size-3.5" aria-hidden="true" />}
              label="Live"
              value={pulse.live.length}
              tone={pulse.live.length > 0 ? "live" : "muted"}
            />
            <StatPill
              icon={<Calendar className="size-3.5" aria-hidden="true" />}
              label="Today"
              value={pulse.today.length}
              tone="info"
            />
            <StatPill
              icon={<Goal className="size-3.5" aria-hidden="true" />}
              label="Goals today"
              value={pulse.goalsToday}
              tone="gold"
            />
            {pulse.next && (
              <StatPill
                icon={<Clock className="size-3.5" aria-hidden="true" />}
                label="Next"
                value={countdown ?? "—"}
                tone="muted"
              />
            )}
          </div>

          {/* CTAs */}
          <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-[auto_auto] sm:justify-center">
            <div className="sm:w-72">
              <WatchLivePanel compact />
            </div>
            {pulse.next && (
              <a
                href="#fixtures"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-5 py-3 text-body font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Play className="size-4" aria-hidden="true" />
                <span className="truncate">
                  <span aria-hidden="true">{flagOf(pulse.next.home.name)}</span> {pulse.next.home.code} vs{" "}
                  {pulse.next.away.code} <span aria-hidden="true">{flagOf(pulse.next.away.name)}</span>
                  <span className="ml-2 text-primary">{formatLocalTime(pulse.next.startTs * 1000)}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Ticker rail */}
      {(pulse.live.length > 0 || pulse.upcoming.length > 0 || pulse.recent.length > 0) && (
        <FootballTicker
          live={pulse.live}
          upcoming={pulse.upcoming.slice(0, 6)}
          recent={pulse.recent}
        />
      )}
    </section>
  );
}

function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "live" | "info" | "gold" | "muted";
}) {
  const cls =
    tone === "live"
      ? "border-live/40 bg-live/10 text-live"
      : tone === "info"
        ? "border-[var(--color-accent-mlb)]/30 bg-[var(--color-accent-mlb)]/10 text-[var(--color-accent-mlb)]"
        : tone === "gold"
          ? "border-gold/30 bg-gold/10 text-gold"
          : "border-border bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-caption font-semibold ${cls}`}>
      {tone === "live" && (
        <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      )}
      {icon}
      <span className="text-micro uppercase opacity-80">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </span>
  );
}

function FootballTicker({
  live,
  upcoming,
  recent,
}: {
  live: import("@/lib/wc2026.functions").Wc2026Fixture[];
  upcoming: import("@/lib/wc2026.functions").Wc2026Fixture[];
  recent: import("@/lib/wc2026.functions").Wc2026Fixture[];
}) {
  const items = [
    ...live.map((f) => ({ f, kind: "live" as const })),
    ...upcoming.map((f) => ({ f, kind: "up" as const })),
    ...recent.map((f) => ({ f, kind: "ft" as const })),
  ];
  if (items.length === 0) return null;
  const shouldLoop = items.length >= 4;
  const loop = shouldLoop ? [...items, ...items] : items;
  return (
    <div className="relative overflow-hidden border-t border-border bg-muted/30">
      <div className="flex items-center">
        <div className="z-10 flex shrink-0 items-center gap-1.5 bg-primary px-3 py-2 text-micro font-extrabold uppercase text-primary-foreground">
          <Trophy className="size-3" aria-hidden="true" /> WC
        </div>
        <div
          className="ticker-track flex items-center gap-6 whitespace-nowrap py-1 pl-4"
          style={shouldLoop ? undefined : { animation: "none" }}
        >
          {loop.map(({ f, kind }, i) => {
            const clone = i >= items.length;
            return (
              <span
                key={`${f.id}-${i}-${kind}`}
                aria-hidden={clone || undefined}
                className={`inline-flex min-h-11 items-center gap-2 text-caption ${clone ? "motion-reduce:hidden" : ""}`}
              >
                <span
                  className={`text-micro font-bold uppercase ${
                    kind === "live"
                      ? "text-live"
                      : kind === "up"
                        ? "text-[var(--color-accent-mlb)]"
                        : "text-muted-foreground"
                  }`}
                >
                  {kind === "live" ? "● LIVE" : kind === "up" ? formatLocalTime(f.startTs * 1000) : "FT"}
                </span>
                <span className="text-foreground">
                  <span aria-hidden="true">{flagOf(f.home.name)}</span> {f.home.code}
                </span>
                {kind === "ft" || kind === "live" ? (
                  <span className="font-bold tabular-nums text-primary">
                    {f.home.goals ?? 0}–{f.away.goals ?? 0}
                  </span>
                ) : (
                  <span className="text-muted-foreground">vs</span>
                )}
                <span className="text-foreground">
                  {f.away.code} <span aria-hidden="true">{flagOf(f.away.name)}</span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
