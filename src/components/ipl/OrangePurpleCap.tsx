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

export function OrangePurpleCap({
  orange,
  purple,
  fallbackOrange,
  fallbackPurple,
  seasonYear,
}: Props) {
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
            ? {
                name: fallbackPurple.player,
                team: fallbackPurple.team,
                value: fallbackPurple.wickets,
              }
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
    <article className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
      <header
        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 ${className}`}
      >
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-90">
            {subtitle}
          </div>
          <h3 className="truncate text-lg font-black">{title}</h3>
        </div>
        <div className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-muted ring-1 ring-border">
          {icon}
        </div>
      </header>

      <div className="p-4">
        {top ? (
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3 ring-1 ring-border">
            {top.headshot ? (
              <img
                src={top.headshot}
                alt={top.athleteName}
                className="h-14 w-14 shrink-0 rounded-full object-cover bg-card ring-2 ring-border"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-full bg-card ring-2 ring-border grid place-items-center text-lg font-black text-foreground">
                {top.athleteName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <PlayerLink
                name={top.athleteName}
                athleteId={top.athleteId}
                className="truncate text-base font-bold text-foreground block"
              >
                {top.athleteName}
              </PlayerLink>
              <div className="text-xs text-foreground">{top.teamName || top.teamAbbr}</div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-foreground">{top.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-foreground">{unit}</div>
            </div>
          </div>
        ) : emptyFallback ? (
          <div className="rounded-xl bg-muted p-3 ring-1 ring-border">
            <div className="text-[10px] uppercase tracking-widest text-foreground">
              Reigning leader · {typeof seasonYear === "number" ? seasonYear - 1 : "last season"}
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <PlayerLink
                  name={emptyFallback.name}
                  className="truncate text-base font-bold text-foreground block"
                >
                  {emptyFallback.name}
                </PlayerLink>
                <div className="text-xs text-foreground">{emptyFallback.team}</div>
              </div>

              <div className="text-xl font-black text-foreground">{emptyFallback.value}</div>
            </div>
            <p className="mt-2 text-[11px] text-foreground">
              Live leaderboard appears once this season's matches begin.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-muted p-4 text-center text-sm text-foreground ring-1 ring-border">
            Leaderboard will appear once matches are played.
          </div>
        )}

        {rest.length > 0 && (
          <ul className="mt-3 divide-y divide-border rounded-xl bg-muted ring-1 ring-border">
            {rest.map((p) => (
              <li key={p.athleteId} className="flex items-center gap-3 px-3 py-2">
                <span className="w-5 shrink-0 text-center text-[11px] font-black text-foreground">
                  {p.rank}
                </span>
                <PlayerLink
                  name={p.athleteName}
                  athleteId={p.athleteId}
                  className="min-w-0 flex-1 truncate text-sm text-foreground"
                >
                  {p.athleteName}
                </PlayerLink>
                <span className="shrink-0 text-[11px] text-foreground">{p.teamAbbr}</span>
                <span className="w-12 shrink-0 text-right text-sm font-bold text-foreground">
                  {p.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
