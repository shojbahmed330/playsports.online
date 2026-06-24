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
  const pulse = derivePulse(q.data?.fixtures);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = pulse.next ? formatCountdown(pulse.next.startTs - Date.now()) : null;
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
    <section className="relative overflow-hidden border-b border-border">
      {/* Animated gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, oklch(0.78 0.18 75 / 0.30), transparent 60%), radial-gradient(40% 70% at 85% 100%, oklch(0.62 0.24 27 / 0.22), transparent 60%), radial-gradient(50% 80% at 15% 100%, oklch(0.58 0.20 250 / 0.18), transparent 60%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.04)_100%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.04)_100%)] bg-[size:32px_32px] opacity-40" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="size-16 sm:size-20 rounded-full bg-gradient-to-br from-amber-400/40 via-rose-500/30 to-blue-500/30 grid place-items-center ring-1 ring-amber-300/30 backdrop-blur-sm animate-[spin_18s_linear_infinite]">
              <Trophy className="size-8 sm:size-9 text-amber-300" />
            </div>
            {pulse.phase === "live" && (
              <span className="absolute -top-1 -right-1 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-red-500/40">
                <span className="size-1.5 rounded-full bg-white animate-pulse" /> Live
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight">
            FIFA World Cup{" "}
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-blue-400 bg-clip-text text-transparent">
              2026
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-muted-foreground max-w-xl px-2">
            {heroline}
          </p>

          {/* STAT PILLS */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <StatPill
              icon={<Radio className="size-3.5" />}
              label="Live"
              value={pulse.live.length}
              tone={pulse.live.length > 0 ? "live" : "muted"}
            />
            <StatPill icon={<Calendar className="size-3.5" />} label="Today" value={pulse.today.length} tone="info" />
            <StatPill icon={<Goal className="size-3.5" />} label="Goals today" value={pulse.goalsToday} tone="gold" />
            {pulse.next && (
              <StatPill
                icon={<Clock className="size-3.5" />}
                label="Next"
                value={countdown ?? "—"}
                tone="muted"
              />
            )}
          </div>

          {/* CTAs */}
          <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-[auto_auto] gap-3 sm:justify-center max-w-md sm:max-w-none">
            <div className="sm:w-72">
              <WatchLivePanel compact />
            </div>
            {pulse.next && (
              <a
                href="#fixtures"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/10 transition-all"
              >
                <Play className="size-4" />
                <span className="truncate">
                  {flagOf(pulse.next.home.name)} {pulse.next.home.code} vs {pulse.next.away.code} {flagOf(pulse.next.away.name)}
                  <span className="ml-2 text-amber-300">{formatLocalTime(pulse.next.startTs)}</span>
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
      ? "border-red-500/40 bg-red-500/10 text-red-200 shadow-[0_0_30px_-12px_rgba(239,68,68,0.6)]"
      : tone === "info"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
      : tone === "gold"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-white/10 bg-white/5 text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {tone === "live" && <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />}
      {icon}
      <span className="opacity-80 uppercase tracking-wider text-[10px]">{label}</span>
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
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-t border-white/5 bg-gradient-to-r from-amber-950/30 via-gray-950 to-blue-950/30">
      <div className="flex items-center">
        <div className="shrink-0 z-10 px-3 py-1.5 bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <Trophy className="size-3" /> WC
        </div>
        <div className="ticker-track flex items-center gap-6 py-1.5 pl-4 whitespace-nowrap">
          {loop.map(({ f, kind }, i) => (
            <span key={`${f.id}-${i}-${kind}`} className="inline-flex items-center gap-2 text-xs">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  kind === "live" ? "text-red-400" : kind === "up" ? "text-blue-300" : "text-gray-500"
                }`}
              >
                {kind === "live" ? "● LIVE" : kind === "up" ? formatLocalTime(f.startTs) : "FT"}
              </span>
              <span className="text-gray-300">
                {flagOf(f.home.name)} {f.home.code}
              </span>
              {kind === "ft" || kind === "live" ? (
                <span className="font-bold text-amber-300 tabular-nums">
                  {f.home.goals ?? 0}–{f.away.goals ?? 0}
                </span>
              ) : (
                <span className="text-gray-500">vs</span>
              )}
              <span className="text-gray-300">
                {f.away.code} {flagOf(f.away.name)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
