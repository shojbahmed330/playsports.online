import { Star } from "lucide-react";
import { useMyTeams } from "@/lib/football-filters";

export function StarTeamButton({ team, size = 14 }: { team: string; size?: number }) {
  const { has, toggle } = useMyTeams();
  const active = has(team);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle(team); }}
      aria-pressed={active}
      title={active ? `Remove ${team} from My Teams` : `Add ${team} to My Teams`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-1 transition-all ${
        active ? "text-amber-300 bg-amber-500/15" : "text-muted-foreground/60 hover:text-amber-300 hover:bg-white/5"
      }`}
    >
      <Star className={active ? "fill-amber-300" : ""} style={{ width: size, height: size }} />
    </button>
  );
}
