import { Link } from "@tanstack/react-router";
import type { MlbTeam } from "@/lib/mlb.functions";

export function TeamCard({ team }: { team: MlbTeam }) {
  return (
    <Link
      to="/mlb/team/$id"
      params={{ id: team.id }}
      className="group relative block rounded-2xl bg-card ring-1 ring-border hover:ring-[#d50032]/50 transition-all overflow-hidden"
      style={team.color ? { boxShadow: `inset 0 -2px 0 0 ${team.color}` } : undefined}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: team.color
            ? `linear-gradient(135deg, ${team.color}30 0%, transparent 70%)`
            : undefined,
        }}
      />
      <div className="relative p-4 flex items-center gap-3">
        <div className="size-14 grid place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 shrink-0">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="size-11 object-contain" loading="lazy" / decoding="async">
          ) : (
            <span className="text-xs font-bold">{team.abbr}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {team.location}
          </div>
          <div className="text-sm font-bold text-white truncate">{team.shortName}</div>
          {team.record && (
            <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{team.record}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
