import { Link } from "@tanstack/react-router";
import { TeamCrest } from "./TeamCrest";
import { Flame, Clock, MapPin, ArrowRight, Trophy } from "lucide-react";
import type { CricketMatch } from "@/lib/cricket.functions";

/**
 * CricketHero — spotlight for the next/live featured match.
 * - If any match is live, picks the first live match.
 * - Else picks the soonest upcoming match.
 * - Else shows a generic welcome card.
 */
export function CricketHero({ matches, liveCount }: { matches: CricketMatch[]; liveCount: number }) {
  const live = matches.find((m) => m.status === "in");
  const upcoming = [...matches]
    .filter((m) => m.status === "pre" && m.startTs > Date.now())
    .sort((a, b) => a.startTs - b.startTs)[0];
  const featured = live ?? upcoming ?? null;

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* layered pitch gradient */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(80% 100% at 20% 0%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(60% 80% at 90% 20%, rgba(251,191,36,0.16), transparent 60%), radial-gradient(70% 70% at 50% 100%, rgba(239,68,68,0.12), transparent 60%), linear-gradient(180deg, #04140f 0%, #050817 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 14px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-center">
          {/* left — branding */}
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-bold text-amber-300 mb-3 px-2.5 py-1 rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              {liveCount > 0 ? `${liveCount} match${liveCount === 1 ? "" : "es"} live` : "Cricket hub"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                Every ball.
              </span>{" "}
              <span className="text-white">Every series.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
              Live scoreboards, fixtures, standings, player profiles and records — from IPL and the
              ICC World Cup to Big Bash, PSL and the international calendar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <HeroChip to="/cricket/scores" label="Scores" icon={<Flame className="size-3.5" />} grad="from-rose-500 to-red-500" />
              <HeroChip to="/cricket/series" label="Series" icon={<Trophy className="size-3.5" />} grad="from-amber-500 to-orange-500" />
              <HeroChip to="/cricket/players" label="Players" icon={<ArrowRight className="size-3.5" />} grad="from-fuchsia-500 to-purple-500" />
              <HeroChip to="/cricket/rankings" label="Rankings" icon={<ArrowRight className="size-3.5" />} grad="from-indigo-500 to-violet-500" />
            </div>
          </div>

          {/* right — featured match card */}
          <div>
            {featured ? <FeaturedCard match={featured} /> : <EmptyFeatured />}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroChip({
  to, label, icon, grad,
}: { to: string; label: string; icon: React.ReactNode; grad: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${grad} ring-1 ring-white/15 hover:-translate-y-0.5 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)] transition-transform`}
    >
      {icon} {label}
    </Link>
  );
}

function FeaturedCard({ match }: { match: CricketMatch }) {
  const isLive = match.status === "in";
  const isPre = match.status === "pre";
  return (
    <Link
      to="/cricket/match/$id"
      params={{ id: match.id }}
      search={{ leagueId: match.leagueId }}
      className="group block relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 via-emerald-950/40 to-black/70 backdrop-blur p-5 sm:p-6 hover:border-emerald-400/40 transition-all hover:-translate-y-0.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300/90 truncate">
            {match.leagueName || match.leagueAbbr || "Cricket"}
          </div>
          <div className="text-[11px] text-emerald-100/70 mt-0.5 truncate">{match.description}</div>
        </div>
        {isLive ? (
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-200 bg-red-500/20 ring-1 ring-red-400/40 px-2 py-1 rounded-full">
            <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> Live
          </span>
        ) : isPre ? (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/15 ring-1 ring-amber-500/30 px-2 py-1 rounded-full">
            <Clock className="size-3" /> Upcoming
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold uppercase text-gray-400">FT</span>
        )}
      </div>

      <div className="space-y-3">
        <TeamRow side={match.home} />
        <div className="h-px bg-white/5" />
        <TeamRow side={match.away} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 text-[11px] text-emerald-100/70 truncate">
          {match.venue ? (
            <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {match.venue}{match.city ? `, ${match.city}` : ""}</span>
          ) : isPre ? (
            new Date(match.startTs).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
          ) : match.statusDetail}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 group-hover:gap-2 transition-all">
          Open <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function TeamRow({ side }: { side: CricketMatch["home"] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <TeamCrest src={side.logo} abbr={side.abbr} name={side.name} className="size-9 shrink-0" rounded />
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">{side.name || side.shortName}</div>
          {side.scoreSummary && (
            <div className="text-[11px] text-emerald-200/70 truncate font-mono">{side.scoreSummary}</div>
          )}
        </div>
      </div>
      {side.totalRuns > 0 && !side.scoreSummary && (
        <div className="shrink-0 text-lg font-extrabold tabular-nums text-white">{side.totalRuns}</div>
      )}
    </div>
  );
}

function EmptyFeatured() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <Trophy className="mx-auto size-10 text-emerald-300/60 mb-2" />
      <div className="text-sm font-semibold text-emerald-100/80">No live or upcoming match right now</div>
      <div className="text-xs text-emerald-100/50 mt-1">Check the scores tab for recent results.</div>
    </div>
  );
}
