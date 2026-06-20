import type { WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { Check } from "lucide-react";

export type RoundKey = "round_of_16" | "quarter_final" | "semi_final" | "final" | "third_place";

const ROUND_GRADIENT: Record<RoundKey, string> = {
  round_of_16: "from-blue-600 to-blue-500",
  quarter_final: "from-purple-600 to-purple-500",
  semi_final: "from-orange-600 to-orange-500",
  final: "from-amber-500 to-yellow-400",
  third_place: "from-zinc-600 to-zinc-500",
};

function winnerOf(m: WCMatch): "home" | "away" | "draw" {
  const hp = m.home_score_pen, ap = m.away_score_pen;
  if (hp != null && ap != null) return hp > ap ? "home" : "away";
  const h = m.home_score ?? 0, a = m.away_score ?? 0;
  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

function formatDate(d: string | null): string | null {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return null; }
}

export function MatchCard({
  match, onClick, round, isFinal, index = 0,
}: {
  match: WCMatch;
  onClick: () => void;
  round: RoundKey;
  isFinal?: boolean;
  index?: number;
}) {
  const w = winnerOf(match);
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const grad = ROUND_GRADIENT[round];
  const date = formatDate(match.match_date);

  const card = (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`wc-card group relative w-full text-left rounded-xl overflow-hidden bg-gray-900
        border border-white/[0.08] transition-all duration-[250ms] cursor-pointer
        hover:-translate-y-[3px] hover:border-amber-500/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${isFinal ? "shadow-[0_0_40px_rgba(245,158,11,0.2)]" : ""}`}
    >
      {/* top accent */}
      <div className={`h-[3px] bg-gradient-to-r ${grad} ${isFinal ? "h-[4px]" : ""}`} />

      {/* match number badge */}
      {match.match_number != null && (
        <span className="absolute top-1.5 left-2 text-[10px] text-gray-700 font-mono">
          M{match.match_number}
        </span>
      )}

      {/* home */}
      <TeamRow
        team={match.home_team}
        score={match.home_score}
        win={w === "home"}
        large={isFinal}
      />
      <div className="h-px bg-white/[0.05]" />
      {/* away */}
      <TeamRow
        team={match.away_team}
        score={match.away_score}
        win={w === "away"}
        large={isFinal}
      />

      {hasPen && (
        <div className="flex justify-center py-1.5">
          <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full">
            {match.home_score_pen}-{match.away_score_pen} pens
          </span>
        </div>
      )}

      {match.stadium && (
        <div className="bg-gray-800/50 px-3 py-1.5 text-[10px] text-gray-500 truncate">
          {match.stadium}
        </div>
      )}

      {date && (
        <div className="absolute bottom-1 right-2 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          {date}
        </div>
      )}
    </button>
  );

  if (isFinal) {
    return (
      <div className="rounded-xl p-[1.5px] bg-gradient-to-br from-amber-500 to-amber-700">
        {card}
      </div>
    );
  }
  return card;
}

function TeamRow({
  team, score, win, large,
}: { team: string; score: number | null; win: boolean; large?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 ${large ? "h-12" : "h-10"}
        ${win ? "bg-gradient-to-r from-amber-500/15 to-transparent" : ""}`}
    >
      <span className="text-lg leading-none shrink-0">{flagOf(team)}</span>
      <span
        className={`flex-1 min-w-0 truncate text-sm ${
          win ? "text-amber-400 font-semibold" : "text-gray-500"
        }`}
      >
        {team}
        {win && <Check className="inline ml-1 size-3 text-green-500" />}
      </span>
      <span
        className={`shrink-0 tabular-nums ${
          win
            ? `text-amber-400 font-black ${large ? "text-4xl" : "text-lg"}`
            : "text-gray-500 font-bold"
        }`}
      >
        {score ?? "-"}
      </span>
    </div>
  );
}
