import type { SportGame } from "@/lib/espn.functions";
import { Link } from "@tanstack/react-router";
import { Countdown } from "./Countdown";
import { ScoreFlip } from "./ScoreFlip";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { MapPin, Tv } from "lucide-react";

export function GameCard({ game, linkTo }: { game: SportGame; linkTo?: string }) {
  const isLive = game.status === "in";
  const isFinal = game.status === "post";
  const isPre = game.status === "pre";
  const winnerHome = game.home.winner === true;
  const winnerAway = game.away.winner === true;

  const Wrapper: any = linkTo ? Link : "div";
  const wrapperProps = linkTo ? { to: linkTo } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`block group rounded-xl border bg-gray-900/70 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg
        ${isLive
          ? "border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.15)]"
          : "border-gray-800 hover:border-amber-500/30"}`}
    >

      {/* Status bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] uppercase tracking-wider border-b border-gray-800/80 bg-gray-950/40">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-red-300 font-bold">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            Live · {game.shortDetail || "In progress"}
          </span>
        ) : isFinal ? (
          <span className="text-gray-400 font-semibold">{game.shortDetail || "Final"}</span>
        ) : (
          <span className="text-gray-300 font-semibold flex items-center gap-1.5">
            <span className="text-amber-400">{relativeDay(game.startTs)}</span>
            <span className="text-gray-500">·</span>
            <span>{formatLocalTime(game.startTs)}</span>
          </span>
        )}
        {isPre && <Countdown ts={game.startTs} />}
        {(isLive || isFinal) && game.broadcast && (
          <span className="text-gray-500 truncate ml-1 max-w-[110px] inline-flex items-center gap-1" title={game.broadcast}>
            <Tv className="size-3" /> {game.broadcast}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="divide-y divide-gray-800/60">
        <TeamRow t={game.away} winner={winnerAway} dim={isFinal && winnerHome} showScore={!isPre} />
        <TeamRow t={game.home} winner={winnerHome} dim={isFinal && winnerAway} showScore={!isPre} />
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-gray-500 border-t border-gray-800/80 bg-gray-950/40">
        {game.venue ? (
          <span className="truncate inline-flex items-center gap-1">
            <MapPin className="size-3" /> {game.venue}
          </span>
        ) : <span />}
        {isPre && game.broadcast && (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Tv className="size-3" /> {game.broadcast}
          </span>
        )}
      </div>
    </Wrapper>

  );
}

function TeamRow({
  t,
  winner,
  dim,
  showScore,
}: {
  t: import("@/lib/espn.functions").SportTeam;
  winner: boolean;
  dim: boolean;
  showScore: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 ${winner ? "bg-amber-500/[0.06]" : ""}`}>
      <div className="shrink-0 size-7 rounded bg-gray-800/60 grid place-items-center overflow-hidden">
        {t.logo ? (
          <img src={t.logo} alt="" loading="lazy" className="size-6 object-contain" / decoding="async">
        ) : (
          <span className="text-[10px] text-gray-500">{t.abbr}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm truncate ${dim ? "text-gray-500" : winner ? "text-white font-semibold" : "text-gray-200"}`}>
          {t.shortName || t.name}
        </div>
        {t.record && (
          <div className="text-[10px] text-gray-500 leading-tight">{t.record}</div>
        )}
      </div>
      {showScore ? (
        <div
          className={`shrink-0 text-xl font-extrabold ${
            dim ? "text-gray-600" : winner ? "text-amber-400" : "text-gray-100"
          }`}
        >
          <ScoreFlip value={t.score} />
        </div>
      ) : (
        <div className="shrink-0 text-[10px] text-gray-600 font-bold">{t.abbr}</div>
      )}
    </div>
  );
}
