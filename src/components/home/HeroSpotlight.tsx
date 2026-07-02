import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Play, Trophy, ArrowRight } from "lucide-react";
import type { SportGame } from "@/lib/espn.functions";
import type { SportConfig } from "@/lib/sports-config";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { Countdown } from "@/components/sports/Countdown";
import { ScoreFlip } from "@/components/sports/ScoreFlip";
import { flagOf } from "@/lib/flags";
import { formatLocalTime, relativeDay } from "@/lib/time";

type Tagged = { sport: SportConfig; game: SportGame };

export function HeroSpotlight({
  liveGames,
  upcomingGames,
  totalToday,
  wcFeatured,
  onWatchLive,
}: {
  liveGames: Tagged[];
  upcomingGames: Tagged[];
  totalToday: number;
  wcFeatured: Wc2026Fixture | null;
  onWatchLive?: () => void;
}) {
  // Build spotlight slides: cycle through EVERY live game, then WC featured + a couple of upcoming.
  const liveSlides: SpotlightSlide[] = liveGames.map((t) => ({ kind: "game", tagged: t }));
  const extraSlides: SpotlightSlide[] = [
    ...(wcFeatured ? [{ kind: "wc" as const, fixture: wcFeatured }] : []),
    ...upcomingGames.slice(0, 2).map<SpotlightSlide>((t) => ({ kind: "game", tagged: t })),
  ];
  const slides: SpotlightSlide[] =
    liveSlides.length > 0
      ? [...liveSlides, ...extraSlides].slice(0, Math.max(liveSlides.length, 6))
      : extraSlides.slice(0, 5);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  // Swipe gestures (mobile)
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40 || slides.length < 2) return;
    setIdx((i) => (dx < 0 ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length));
  };

  const totalLive = liveGames.length;

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Layered glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(70% 90% at 50% 0%, oklch(0.78 0.16 75 / 0.25), transparent 60%), radial-gradient(50% 70% at 85% 100%, oklch(0.62 0.22 27 / 0.18), transparent 60%), radial-gradient(40% 60% at 10% 100%, oklch(0.6 0.18 200 / 0.12), transparent 60%)",
        }}
      />
      {/* Grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 ring-1 ring-amber-500/30 text-[11px] uppercase tracking-[0.18em] font-bold text-amber-300 mb-5">
              {totalLive > 0 ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60" />
                    <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                  </span>
                  {totalLive} live now
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Live across 5 leagues
                </>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              One{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                PlaySports
              </span>
              .<br />
              Every Game. Every Score.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Live <strong className="text-foreground">MLB · NBA · NHL · MLS · Cricket</strong>, plus the
              full <strong className="text-foreground">FIFA World Cup</strong> archive 1930 → 2026.
            </p>

            {/* Stat strip */}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
              <StatPill label="Live" value={totalLive} tone="red" />
              <StatPill label="Today" value={totalToday} tone="amber" />
              <StatPill label="Leagues" value={6} tone="sky" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {onWatchLive && (
                <button
                  onClick={onWatchLive}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold shadow-[0_8px_24px_rgba(239,68,68,0.35)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all"
                >
                  <Play className="size-4 fill-white" /> Watch Live
                </button>
              )}
              <Link
                to="/football"
                search={{ year: 2026 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm font-bold hover:bg-white/10 hover:ring-white/20 transition-all"
              >
                <Trophy className="size-4 text-amber-400" /> World Cup Archive
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: rotating spotlight */}
          <div className="relative">
            {slides.length > 0 ? (
              <div
                className="relative h-[280px] sm:h-[300px] touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                role="region"
                aria-roledescription="carousel"
                aria-label="Featured matches"
              >
                {slides.map((s, i) => (
                  <div
                    key={i}
                    aria-hidden={i !== idx}
                    className={`absolute inset-0 transition-all duration-700 ${
                      i === idx
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                    }`}
                  >
                    <SpotlightCard slide={s} />
                  </div>
                ))}
                {slides.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        aria-label={`Show slide ${i + 1} of ${slides.length}`}
                        aria-current={i === idx}
                        className={`tap-target grid place-items-center rounded-full transition-all`}
                      >
                        <span
                          aria-hidden
                          className={`block h-1 rounded-full transition-all ${
                            i === idx ? "w-6 bg-amber-400" : "w-1.5 bg-white/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[280px] rounded-2xl bg-gray-900/50 ring-1 ring-white/10 grid place-items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-amber-400" /> Loading today's slate…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "sky" }) {
  const tones: Record<string, string> = {
    red: "from-red-500/20 to-red-500/5 ring-red-500/30 text-red-300",
    amber: "from-amber-500/20 to-amber-500/5 ring-amber-500/30 text-amber-300",
    sky: "from-sky-500/20 to-sky-500/5 ring-sky-500/30 text-sky-300",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ring-1 px-3 py-2.5 text-center ${tones[tone]}`}>
      <div className="text-2xl font-extrabold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] font-bold mt-0.5">{label}</div>
    </div>
  );
}

// ─── Spotlight slide content ───

type SpotlightSlide =
  | { kind: "game"; tagged: Tagged }
  | { kind: "wc"; fixture: Wc2026Fixture };

function SpotlightCard({ slide }: { slide: SpotlightSlide }) {
  if (slide.kind === "wc") {
    const f = slide.fixture;
    const live = f.status === "inprogress";
    const finished = f.status === "finished";
    const startMs = f.startTs * 1000;
    const deepLink = f.id > 0;
    const commonBody = (
      <>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-amber-300">
            <Trophy className="size-3" /> FIFA WC 2026 · {f.group}
          </span>
          {live ? <LiveBadge minute={f.minute ?? null} /> : finished ? (
            <span className="text-[10px] font-bold text-gray-400">FT</span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-200">{relativeDay(startMs)} · {formatLocalTime(startMs)}</span>
          )}
        </div>
        <div className="space-y-3">
          <TeamRow flag={flagOf(f.home.name)} name={f.home.name} score={f.home.goals} />
          <TeamRow flag={flagOf(f.away.name)} name={f.away.name} score={f.away.goals} />
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
          <span className="truncate">{f.venue ?? "TBD"}</span>
          {!live && !finished && <Countdown ts={startMs} compact />}
        </div>
      </>
    );
    const cls = "group block h-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-900/50 via-gray-900 to-red-900/30 ring-1 ring-amber-500/30 hover:ring-amber-400/60 transition-all p-5 sm:p-6";
    return deepLink ? (
      <Link to="/football/match/$id" params={{ id: String(f.id) }} className={cls}>
        {commonBody}
      </Link>
    ) : (
      <Link to="/football" search={{ year: 2026 }} className={cls}>
        {commonBody}
      </Link>
    );
  }

  const { sport, game } = slide.tagged;
  const live = game.status === "in";
  const finished = game.status === "post";
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`group block h-full rounded-2xl overflow-hidden bg-gradient-to-br ${sport.bgGrad} ring-1 ${sport.ring} hover:ring-2 transition-all p-5 sm:p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold ${sport.accent}`}>
          <span className="text-base">{sport.emoji}</span> {sport.longName}
        </span>
        {live ? <LiveBadge minute={null} detail={game.shortDetail} /> : finished ? (
          <span className="text-[10px] font-bold text-gray-400">FINAL</span>
        ) : (
          <span className={`text-[10px] font-semibold ${sport.accent}`}>{relativeDay(game.startTs)} · {formatLocalTime(game.startTs)}</span>
        )}
      </div>
      <div className="space-y-3">
        <TeamRow logo={game.away.logo} name={game.away.shortName || game.away.name} score={game.away.score} />
        <TeamRow logo={game.home.logo} name={game.home.shortName || game.home.name} score={game.home.score} />
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
        <span className="truncate">{game.venue ?? game.broadcast ?? ""}</span>
        {!live && !finished && <Countdown ts={game.startTs} compact />}
      </div>
    </Link>
  );
}

function TeamRow({ flag, logo, name, score }: { flag?: string; logo?: string | null; name: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3">
      {logo ? (
        <img loading="lazy" decoding="async" src={logo} alt="" className="size-7 shrink-0 object-contain" />
      ) : (
        <span className="text-2xl shrink-0">{flag ?? "🏟️"}</span>
      )}
      <span className="flex-1 truncate font-bold text-base sm:text-lg">{name}</span>
      <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-400">
        <ScoreFlip value={score} />
      </span>
    </div>
  );
}

function LiveBadge({ minute, detail }: { minute?: number | null; detail?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
      </span>
      {minute ? `${minute}'` : detail ?? "LIVE"}
    </span>
  );
}
