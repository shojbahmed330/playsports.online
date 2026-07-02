import { Star } from "lucide-react";
import { useStarred, type Sport } from "@/lib/starred";

/**
 * Cross-sport star toggle. Persists per-sport starred entities to
 * localStorage. Use this on team crests or player rows in NBA/NHL/MLB/MLS/
 * cricket to feed the unified /mine page.
 */
export function StarButton({ sport, name, size = 14 }: { sport: Sport; name: string; size?: number }) {
  const { has, toggle } = useStarred(sport);
  const active = has(name);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(name); }}
      aria-pressed={active}
      title={active ? `Remove ${name}` : `Star ${name}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-1 transition-all ${
        active ? "text-amber-300 bg-amber-500/15" : "text-muted-foreground/60 hover:text-amber-300 hover:bg-white/5"
      }`}
    >
      <Star className={active ? "fill-amber-300" : ""} style={{ width: size, height: size }} />
    </button>
  );
}
