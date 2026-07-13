import type { SportGame } from "@/lib/espn.functions";
import { Link } from "@tanstack/react-router";
import { matchupSlug } from "@/lib/matchup";
import { Swords } from "lucide-react";

/**
 * Compact soccer match card list. Used for scores + fixtures.
 * When `h2hCompSlug` is passed, each row exposes a Head-to-Head link scoped
 * to that competition so users can dive from any score into the rivalry page.
 */
export function CompetitionMatchList({
  games,
  emptyLabel,
  h2hCompSlug,
}: {
  games: SportGame[];
  emptyLabel: string;
  h2hCompSlug?: string;
}) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {games.map((g) => (
        <li key={g.id} className="relative">
          {h2hCompSlug ? (
            <Link
              to="/football/$comp/matches/$matchId"
              params={{ comp: h2hCompSlug, matchId: g.id }}
              className="block"
            >
              <MatchRow g={g} />
            </Link>
          ) : (
            <MatchRow g={g} />
          )}
          {h2hCompSlug && g.home.name && g.away.name && (
            <Link
              to="/football/$comp/h2h/$matchup"
              params={{ comp: h2hCompSlug, matchup: matchupSlug(g.home.name, g.away.name) }}
              className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/25"
              title={`${g.home.name} vs ${g.away.name} head-to-head`}
              onClick={(e) => e.stopPropagation()}
            >
              <Swords className="size-3" /> H2H
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function MatchRow({ g }: { g: SportGame }) {
  const isLive = g.status === "in";
  const isFinal = g.status === "post";
  const kickoff = g.startTs
    ? new Date(g.startTs).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 transition ${
        isLive
          ? "border-red-500/40 bg-red-500/[0.06] shadow-[0_0_30px_-16px_rgba(239,68,68,0.5)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
        <span
          className={
            isLive
              ? "text-red-300 font-bold flex items-center gap-1"
              : "text-muted-foreground"
          }
        >
          {isLive && <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />}
          {isLive ? g.shortDetail || "Live" : isFinal ? "Final" : kickoff}
        </span>
        {g.venue && (
          <span className="truncate max-w-[45%] text-muted-foreground">{g.venue}</span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] gap-y-1.5 items-center">
        <TeamRow name={g.home.name} logo={g.home.logo} winner={g.home.winner} />
        <ScoreCell score={g.home.score} isLive={isLive || isFinal} />
        <TeamRow name={g.away.name} logo={g.away.logo} winner={g.away.winner} />
        <ScoreCell score={g.away.score} isLive={isLive || isFinal} />
      </div>

      {g.broadcast && (
        <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          on {g.broadcast}
        </div>
      )}
    </div>
  );
}

function TeamRow({
  name,
  logo,
  winner,
}: {
  name: string;
  logo: string | null;
  winner: boolean | null;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logo ? (
        <img
          src={logo}
          alt=""
          className="size-6 rounded-full bg-white/5 object-contain"
          loading="lazy"
         decoding="async" />
      ) : (
        <span className="size-6 rounded-full bg-white/10" />
      )}
      <span
        className={`truncate text-sm ${
          winner ? "font-bold text-foreground" : "font-medium text-foreground/90"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function ScoreCell({ score, isLive }: { score: number | null; isLive: boolean }) {
  if (score == null || !isLive) return <span className="tabular-nums text-sm text-muted-foreground">—</span>;
  return <span className="tabular-nums text-base font-bold text-foreground">{score}</span>;
}
