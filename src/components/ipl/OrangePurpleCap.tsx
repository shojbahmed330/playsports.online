import { Trophy, Flame } from "lucide-react";
import type { IplLeader } from "@/lib/ipl.functions";
import { PlayerLink } from "@/components/cricket/PlayerLink";


type Props = {
  orange: IplLeader[];
  purple: IplLeader[];
  fallbackOrange?: { player: string; team: string; runs: number } | null;
  fallbackPurple?: { player: string; team: string; wickets: number } | null;
  seasonYear: number | "current";
};

export function OrangePurpleCap({ orange, purple, fallbackOrange, fallbackPurple, seasonYear }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CapCard
        title="Orange Cap"
        subtitle="Most runs"
        className="ipl-orange-cap"
        icon={<Flame className="size-5" />}
        leaders={orange}
        unit="runs"
        emptyFallback={
          fallbackOrange
            ? { name: fallbackOrange.player, team: fallbackOrange.team, value: fallbackOrange.runs }
            : null
        }
        seasonYear={seasonYear}
      />
      <CapCard
        title="Purple Cap"
        subtitle="Most wickets"
        className="ipl-purple-cap"
        icon={<Trophy className="size-5" />}
        leaders={purple}
        unit="wkts"
        emptyFallback={
          fallbackPurple
            ? { name: fallbackPurple.player, team: fallbackPurple.team, value: fallbackPurple.wickets }
            : null
        }
        seasonYear={seasonYear}
      />
    </div>
  );
}

function CapCard({
  title,
  subtitle,
  className,
  icon,
  leaders,
  unit,
  emptyFallback,
  seasonYear,
}: {
  title: string;
  subtitle: string;
  className: string;
  icon: React.ReactNode;
  leaders: IplLeader[];
  unit: string;
  emptyFallback: { name: string; team: string; value: number } | null;
  seasonYear: number | "current";
}) {
  const top = leaders[0];
  const rest = leaders.slice(1, 5);
  return (
    <article className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900/60 shadow-xl">
      <header className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 ${className}`}>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-90">{subtitle}</div>
          <h3 className="truncate text-lg font-black">{title}</h3>
        </div>
        <div className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">
          {icon}
        </div>
      </header>

      <div className="p-4">
        {top ? (
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            {top.headshot ? (
              <img
                src={top.headshot}
                alt={top.athleteName}
                className="h-14 w-14 shrink-0 rounded-full object-cover bg-gray-800 ring-2 ring-white/10"
                loading="lazy"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-full bg-gray-800 ring-2 ring-white/10 grid place-items-center text-lg font-black text-white/60">
                {top.athleteName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <PlayerLink name={top.athleteName} athleteId={top.athleteId} className="truncate text-base font-bold text-white block">{top.athleteName}</PlayerLink>
              <div className="text-xs text-white/60">{top.teamName || top.teamAbbr}</div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-white">{top.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">{unit}</div>
            </div>
          </div>
        ) : emptyFallback ? (
          <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              Reigning leader · {typeof seasonYear === "number" ? seasonYear - 1 : "last season"}
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-bold text-white">{emptyFallback.name}</div>
                <div className="text-xs text-white/60">{emptyFallback.team}</div>
              </div>
              <div className="text-xl font-black text-white">{emptyFallback.value}</div>
            </div>
            <p className="mt-2 text-[11px] text-white/50">
              Live leaderboard appears once this season's matches begin.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.04] p-4 text-center text-sm text-white/60 ring-1 ring-white/10">
            Leaderboard will appear once matches are played.
          </div>
        )}

        {rest.length > 0 && (
          <ul className="mt-3 divide-y divide-white/5 rounded-xl bg-white/[0.02] ring-1 ring-white/5">
            {rest.map((p) => (
              <li key={p.athleteId} className="flex items-center gap-3 px-3 py-2">
                <span className="w-5 shrink-0 text-center text-[11px] font-black text-white/50">
                  {p.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white/90">{p.athleteName}</span>
                <span className="shrink-0 text-[11px] text-white/50">{p.teamAbbr}</span>
                <span className="w-12 shrink-0 text-right text-sm font-bold text-white">{p.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
