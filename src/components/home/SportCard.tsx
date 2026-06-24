import { Link } from "@tanstack/react-router";
import { ArrowRight, Trophy } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import { Countdown } from "@/components/sports/Countdown";
import { formatLocalTime } from "@/lib/time";

export function SportCard({
  sport,
  liveCount,
  next,
  recent,
}: {
  sport: SportConfig;
  liveCount: number;
  next: SportGame | null;
  recent: SportGame | null;
}) {
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${sport.bgGrad} border border-white/[0.06] hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]`}
    >
      {/* Animated sweep */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 0%, rgba(255,255,255,0.08), transparent 60%)",
        }}
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`size-12 rounded-xl ${sport.chipBg} ring-1 ${sport.ring} grid place-items-center text-2xl shrink-0`}>
            {sport.emoji}
          </div>
          {liveCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
              </span>
              {liveCount} live
            </span>
          ) : next ? (
            <Countdown ts={next.startTs} compact />
          ) : null}
        </div>

        <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${sport.accent}`}>
          {liveCount > 0 ? "Live now" : next ? "Up next" : "Open"}
        </div>
        <div className="text-lg font-extrabold leading-tight mt-0.5">{sport.label}</div>

        {next ? (
          <div className="mt-3 text-[11px] text-gray-300 space-y-0.5">
            <div className="truncate font-semibold">
              {next.away.shortName || next.away.abbr} @ {next.home.shortName || next.home.abbr}
            </div>
            <div className="text-gray-500">{formatLocalTime(next.startTs)}</div>
          </div>
        ) : recent ? (
          <div className="mt-3 text-[11px] text-gray-400">
            <span className="font-semibold text-gray-300">
              {recent.away.abbr} {recent.away.score} – {recent.home.score} {recent.home.abbr}
            </span>{" "}
            <span className="text-gray-500">· Final</span>
          </div>
        ) : (
          <div className="mt-3 text-[11px] text-gray-500 line-clamp-2">{sport.tagline}</div>
        )}

        <div className={`mt-3 inline-flex items-center gap-1 text-[11px] font-bold ${sport.accent} group-hover:gap-2 transition-all`}>
          Open <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  );
}

export function FifaCard() {
  return (
    <Link
      to="/football"
      search={{ year: 2026 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/50 via-gray-900 to-red-900/30 border border-amber-500/30 hover:border-amber-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 0%, rgba(252,211,77,0.15), transparent 60%)",
        }}
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="size-12 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/40 grid place-items-center shrink-0">
            <Trophy className="size-6 text-amber-400" />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 ring-1 ring-amber-500/30 text-[10px] font-bold text-amber-300">
            ⭐ Archive
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">FIFA World Cup</div>
        <div className="text-lg font-extrabold leading-tight mt-0.5">1930 → 2026</div>
        <div className="mt-3 text-[11px] text-gray-400 leading-snug">
          Every match, every goal, every player — plus live 2026.
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:gap-2 transition-all">
          Explore <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  );
}

export function CricketCard() {
  return (
    <Link
      to="/cricket"
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 via-gray-900 to-teal-900/30 border border-emerald-500/30 hover:border-emerald-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 0%, rgba(110,231,183,0.15), transparent 60%)",
        }}
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="size-12 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/40 grid place-items-center text-2xl shrink-0">
            🏏
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-[10px] font-bold text-emerald-300">
            All formats
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-400">Cricket</div>
        <div className="text-lg font-extrabold leading-tight mt-0.5">Live · IPL · WC</div>
        <div className="mt-3 text-[11px] text-gray-400 leading-snug">
          Scores, series hubs, points tables and history.
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:gap-2 transition-all">
          Explore <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  );
}
