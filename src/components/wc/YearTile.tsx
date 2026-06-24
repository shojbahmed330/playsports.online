import { Trophy } from "lucide-react";
import { getChampion } from "@/data/wc_champions";
import { flagOf } from "@/lib/flags";

export function YearTile({
  year, active, isCurrent, onClick,
}: {
  year: number;
  active: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const champ = getChampion(year);
  const tooltip = champ
    ? `${champ.champion} — ${champ.finalScore ?? ""}${champ.runnerUp ? ` vs ${champ.runnerUp}` : ""} · Host: ${champ.host}`
    : `${year} World Cup`;

  return (
    <button
      data-year={year}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={tooltip}
      className={`group relative shrink-0 snap-center min-w-[96px] sm:min-w-[112px] px-3 py-2.5 rounded-xl text-sm font-bold tabular-nums transition-all overflow-hidden ${
        active
          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-[1.04]"
          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/40"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span>{year}</span>
        {champ && (
          <span
            className={`text-base leading-none transition-transform group-hover:scale-110 ${
              active ? "" : "opacity-90"
            }`}
            aria-label={`Champion: ${champ.champion}`}
          >
            {flagOf(champ.champion)}
          </span>
        )}
      </div>
      {champ && (
        <div
          className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
            active ? "bg-black/15 text-black/80" : "bg-amber-500/10 text-amber-300"
          }`}
        >
          <Trophy className="size-2.5" />
          {champ.champion === "West Germany" ? "W.GER" : champ.champion.length > 8 ? champ.champion.slice(0, 5).toUpperCase() : champ.champion.toUpperCase()}
        </div>
      )}

      {isCurrent && !active && (
        <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
      )}
      {isCurrent && active && (
        <span className="absolute -top-1 right-1 text-[8px] font-black bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none animate-pulse">
          LIVE
        </span>
      )}
    </button>
  );
}
