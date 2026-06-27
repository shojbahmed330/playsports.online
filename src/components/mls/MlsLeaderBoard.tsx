import { Link } from "@tanstack/react-router";
import type { MlsLeaderCategory } from "@/lib/mls.functions";

export function MlsLeaderBoard({ category, compact = false }: { category: MlsLeaderCategory; compact?: boolean }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-[#17408b]/40 to-transparent">
        <h3 className="text-sm font-bold text-white">{category.label}</h3>
        <span className="text-[10px] uppercase tracking-wider text-orange-300/80 font-semibold">{category.group}</span>
      </div>
      <ul className="divide-y divide-border">
        {category.entries.slice(0, compact ? 5 : 10).map((e) => (
          <li key={`${category.key}-${e.rank}-${e.athleteId}`}>
            <Link
              to="/mls/player/$id"
              params={{ id: e.athleteId }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
            >
              <span className="w-6 text-center text-xs font-bold tabular-nums text-muted-foreground">{e.rank}</span>
              <div className="size-8 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden grid place-items-center shrink-0">
                {e.headshot
                  ? <img src={e.headshot} alt="" className="size-full object-cover" loading="lazy" />
                  : <span className="text-[10px] text-muted-foreground">{e.position ?? "?"}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">{e.athleteName}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  {e.teamLogo && <img loading="lazy" decoding="async" src={e.teamLogo} alt="" className="size-3 object-contain" />}
                  <span>{e.teamAbbr ?? "—"}</span>
                  {e.position && <span>· {e.position}</span>}
                </div>
              </div>
              <div className="text-base font-extrabold tabular-nums text-orange-300">{e.value}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
