import type { WCMatch } from "@/lib/supabase";

function winnerOf(m: WCMatch): "home" | "away" | "draw" {
  const hp = m.home_score_pen, ap = m.away_score_pen;
  if (hp != null && ap != null) return hp > ap ? "home" : "away";
  const h = m.home_score ?? 0, a = m.away_score ?? 0;
  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

export function MatchCard({
  match, onClick, large,
}: { match: WCMatch; onClick: () => void; large?: boolean }) {
  const w = winnerOf(match);
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-lg border bg-card/80 p-3 transition-all cursor-pointer
        hover:border-gold hover:scale-[1.03] hover:shadow-lg hover:shadow-gold/10
        ${large ? "border-gold/60 shadow-lg shadow-gold/10 p-4" : "border-border"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`truncate text-sm ${w === "home" ? "text-gold font-bold" : "text-muted-foreground"}`}>
          {match.home_team}
        </span>
        <span className={`shrink-0 font-bold ${large ? "text-lg" : "text-base"}`}>
          {match.home_score ?? "-"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <span className={`truncate text-sm ${w === "away" ? "text-gold font-bold" : "text-muted-foreground"}`}>
          {match.away_team}
        </span>
        <span className={`shrink-0 font-bold ${large ? "text-lg" : "text-base"}`}>
          {match.away_score ?? "-"}
        </span>
      </div>
      {hasPen && (
        <div className="text-[10px] text-muted-foreground mt-1 text-right">
          ({match.home_score_pen}-{match.away_score_pen} pens)
        </div>
      )}
      {match.stadium && (
        <div className="text-[10px] text-muted-foreground mt-1 truncate">{match.stadium}</div>
      )}
    </button>
  );
}
