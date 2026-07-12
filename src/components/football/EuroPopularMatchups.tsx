import { Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { matchupSlug } from "@/lib/matchup";

const PAIRS: [string, string, string][] = [
  ["Portugal", "France", "🇵🇹 🇫🇷"],
  ["Italy", "Spain", "🇮🇹 🇪🇸"],
  ["England", "Germany", "🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇩🇪"],
  ["Netherlands", "Germany", "🇳🇱 🇩🇪"],
  ["Italy", "England", "🇮🇹 🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
  ["Greece", "Portugal", "🇬🇷 🇵🇹"],
];

/** Quick tap-in chips of famous Euro rivalries — feeds the H2H picker. */
export function EuroPopularMatchups() {
  return (
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
        Popular matchups
      </div>
      <div className="flex flex-wrap gap-2">
        {PAIRS.map(([a, b, flags]) => (
          <Link
            key={`${a}-${b}`}
            to="/football/$comp/h2h/$matchup"
            params={{ comp: "euro", matchup: matchupSlug(a, b) }}
            className="tap-target inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08] px-3 py-1.5 text-xs font-semibold"
          >
            <Swords className="size-3.5 text-muted-foreground" />
            <span className="leading-none" aria-hidden>{flags}</span>
            <span>{a} vs {b}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
