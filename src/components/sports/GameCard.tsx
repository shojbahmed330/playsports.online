import type { SportGame } from "@/lib/espn.functions";

export function GameCard({ game }: { game: SportGame }) {
  const isLive = game.status === "in";
  const isFinal = game.status === "post";
  const winnerHome = game.home.winner === true;
  const winnerAway = game.away.winner === true;

  return (
    <div
      className={`rounded-xl border bg-gray-900/70 overflow-hidden transition-all hover:-translate-y-0.5
        ${isLive
          ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          : "border-gray-800 hover:border-amber-500/30"}`}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-wider border-b border-gray-800/80">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-red-300 font-bold">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            Live · {game.shortDetail || "In progress"}
          </span>
        ) : isFinal ? (
          <span className="text-gray-400 font-semibold">{game.shortDetail || "Final"}</span>
        ) : (
          <span className="text-gray-500">{game.shortDetail || "Scheduled"}</span>
        )}
        {game.broadcast && (
          <span className="text-gray-600 truncate ml-2 max-w-[100px]" title={game.broadcast}>
            {game.broadcast}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="divide-y divide-gray-800/60">
        <TeamRow t={game.away} winner={winnerAway} dim={isFinal && winnerHome} />
        <TeamRow t={game.home} winner={winnerHome} dim={isFinal && winnerAway} />
      </div>

      {game.venue && (
        <div className="px-3 py-1.5 text-[10px] text-gray-500 truncate border-t border-gray-800/80 bg-gray-950/40">
          {game.venue}
        </div>
      )}
    </div>
  );
}

function TeamRow({
  t,
  winner,
  dim,
}: {
  t: import("@/lib/espn.functions").SportTeam;
  winner: boolean;
  dim: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 ${winner ? "bg-amber-500/[0.06]" : ""}`}>
      <div className="shrink-0 size-7 rounded bg-gray-800/60 grid place-items-center overflow-hidden">
        {t.logo ? (
          <img src={t.logo} alt="" loading="lazy" className="size-6 object-contain" />
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
      <div
        className={`shrink-0 text-xl tabular-nums font-extrabold ${
          dim ? "text-gray-600" : winner ? "text-amber-400" : "text-gray-100"
        }`}
      >
        {t.score ?? "–"}
      </div>
    </div>
  );
}
