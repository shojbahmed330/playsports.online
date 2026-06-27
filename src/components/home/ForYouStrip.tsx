import { Link } from "@tanstack/react-router";
import { Flame, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { formatLocalTime } from "@/lib/time";

type Tagged = { sport: SportConfig; game: SportGame };

/**
 * "For You" — 3 smart cards: live now / next up / just finished.
 * Quick-scan summary for users who want the headline without scrolling.
 */
export function ForYouStrip({
  liveGames,
  upcomingGames,
  finalGames,
  wcFixtures,
}: {
  liveGames: Tagged[];
  upcomingGames: Tagged[];
  finalGames: Tagged[];
  wcFixtures: Wc2026Fixture[];
}) {
  // Live: prefer WC2026 live, else first ESPN live
  const wcLive = wcFixtures.find((f) => f.status === "inprogress") ?? null;
  const live = wcLive
    ? { kind: "wc" as const, f: wcLive }
    : liveGames[0]
      ? { kind: "espn" as const, t: liveGames[0] }
      : null;

  // Next: prefer WC2026 upcoming, else first ESPN upcoming
  const wcNext = wcFixtures
    .filter((f) => f.status === "notstarted")
    .sort((a, b) => a.startTs - b.startTs)[0] ?? null;
  const espnNext = upcomingGames[0] ?? null;
  // Whichever starts sooner
  let next: { kind: "wc"; f: Wc2026Fixture } | { kind: "espn"; t: Tagged } | null = null;
  if (wcNext && (!espnNext || wcNext.startTs < espnNext.game.startTs)) {
    next = { kind: "wc", f: wcNext };
  } else if (espnNext) {
    next = { kind: "espn", t: espnNext };
  }

  // Recent: latest finished
  const wcRecent = wcFixtures
    .filter((f) => f.status === "finished")
    .sort((a, b) => b.startTs - a.startTs)[0] ?? null;
  const espnRecent = finalGames[0] ?? null;
  let recent: { kind: "wc"; f: Wc2026Fixture } | { kind: "espn"; t: Tagged } | null = null;
  if (wcRecent && (!espnRecent || wcRecent.startTs > espnRecent.game.startTs)) {
    recent = { kind: "wc", f: wcRecent };
  } else if (espnRecent) {
    recent = { kind: "espn", t: espnRecent };
  }

  if (!live && !next && !recent) return null;

  return (
    <section className="space-y-3" aria-labelledby="for-you-heading">
      <div className="flex items-center justify-between">
        <h2 id="for-you-heading" className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
          For you
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Slot
          tone="red"
          icon={<Flame className="size-4" />}
          label="Live now"

          item={recent}
          fallback="No recent results"
        />
      </div>
    </section>
  );
}

function Slot({
  tone,
  icon,
  label,
  item,
  fallback,
}: {
  tone: "red" | "amber" | "gray";
  icon: React.ReactNode;
  label: string;
  item: { kind: "wc"; f: Wc2026Fixture } | { kind: "espn"; t: Tagged } | null;
  fallback: string;
}) {
  const accent =
    tone === "red"
      ? "text-red-300 border-red-500/30 from-red-950/40"
      : tone === "amber"
        ? "text-amber-300 border-amber-500/30 from-amber-950/40"
        : "text-gray-300 border-gray-700/50 from-gray-900/40";

  if (!item) {
    return (
      <div className={`relative rounded-xl border bg-gradient-to-br to-gray-950 p-3 sm:p-4 min-h-[120px] flex flex-col ${accent}`}>
        <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : "text-gray-400"}`}>
          {icon} {label}
        </div>
        <div className="flex-1 grid place-items-center text-xs text-gray-500">{fallback}</div>
      </div>
    );
  }

  if (item.kind === "wc") {
    const f = item.f;
    return (
      <Link
        to="/football"
        search={{ year: 2026 }}
        className={`group relative rounded-xl border bg-gradient-to-br to-gray-950 p-3 sm:p-4 min-h-[120px] flex flex-col hover:-translate-y-0.5 transition-transform ${accent}`}
      >
        <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : "text-gray-400"}`}>
          {icon} {label}
        </div>
        <div className="mt-2 flex-1 flex items-center gap-2 min-w-0">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{flagOf(f.home.name)}</span>
              <span className="truncate text-sm font-bold">{f.home.name}</span>
              {f.status !== "notstarted" && <span className="ml-auto text-sm font-black tabular-nums">{f.home.goals ?? 0}</span>}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{flagOf(f.away.name)}</span>
              <span className="truncate text-sm font-bold">{f.away.name}</span>
              {f.status !== "notstarted" && <span className="ml-auto text-sm font-black tabular-nums">{f.away.goals ?? 0}</span>}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
          <span className="truncate">WC2026 · {f.group}</span>
          <span className="font-semibold">
            {f.status === "notstarted" ? formatLocalTime(f.startTs * 1000) : f.status === "inprogress" ? `${f.minute ?? ""}'` : "FT"}
            <ArrowRight className="inline ml-1 size-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    );
  }

  const { sport, game } = item.t;
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`group relative rounded-xl border bg-gradient-to-br to-gray-950 p-3 sm:p-4 min-h-[120px] flex flex-col hover:-translate-y-0.5 transition-transform ${accent}`}
    >
      <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : "text-gray-400"}`}>
        {icon} {label}
      </div>
      <div className="mt-2 flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-bold flex-1">{game.home.name}</span>
          {game.status !== "pre" && <span className="text-sm font-black tabular-nums">{game.home.score ?? 0}</span>}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-bold flex-1">{game.away.name}</span>
          {game.status !== "pre" && <span className="text-sm font-black tabular-nums">{game.away.score ?? 0}</span>}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
        <span className="truncate">{sport.emoji} {sport.label}</span>
        <span className="font-semibold">
          {game.status === "pre" ? formatLocalTime(game.startTs * 1000) : game.statusDetail || (game.status === "in" ? "Live" : "Final")}
          <ArrowRight className="inline ml-1 size-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
