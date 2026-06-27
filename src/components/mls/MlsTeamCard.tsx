import { Link } from "@tanstack/react-router";
import type { MlsTeam } from "@/lib/mls.functions";

export function MlsTeamCard({ team }: { team: MlsTeam }) {
  const bg = team.color ?? "#001f5b";
  const alt = team.alt ?? "#ed1c24";
  return (
    <Link
      to="/mls/team/$id"
      params={{ id: team.id }}
      className="group relative rounded-2xl overflow-hidden ring-1 ring-border bg-card hover:ring-orange-400/50 transition-all hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: `radial-gradient(120% 80% at 30% 20%, ${bg}, transparent 60%), radial-gradient(80% 70% at 90% 100%, ${alt}, transparent 60%)` }}
      />
      <div className="relative p-4 flex items-center gap-3">
        {team.logo && <img src={team.logo} alt="" className="size-12 object-contain" loading="lazy" />}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{team.abbr}</div>
          <div className="text-sm font-bold text-white truncate">{team.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{team.location}</div>
        </div>
      </div>
    </Link>
  );
}
