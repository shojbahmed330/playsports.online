import type { WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { fmtDateShort, fmtTime } from "@/lib/timezone";
import { useTimezone } from "./TimezonePicker";
import { Check, Play } from "lucide-react";

export type RoundKey = "round_of_32" | "round_of_16" | "quarter_final" | "semi_final" | "final" | "third_place";

function roundAccent(round: RoundKey): string {
  if (round === "final") return "bg-gold";
  if (round === "third_place") return "bg-muted-foreground/60";
  return "bg-primary";
}

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
  return fmtDateShort(d) || null;
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
  useTimezone();
  const w = winnerOf(match);
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const date = formatDate(match.match_date);
  const time = match.match_date ? fmtTime(match.match_date) : "";
  const isUnplayed = match.home_score == null && match.away_score == null;

  const card = (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`wc-card group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-card text-left transition-all duration-[250ms] hover:-translate-y-[3px] hover:border-primary/50 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${match.predicted ? "border-dashed border-[var(--color-accent-mlb)]/40" : "border-border"}
        ${isFinal ? "shadow-[0_0_40px_-12px_var(--gold)]" : ""}`}
    >
      {/* top accent */}
      <div className={`h-[3px] ${roundAccent(round)} ${isFinal ? "h-[4px]" : ""}`} aria-hidden="true" />

      {/* match number badge */}
      {match.match_number != null && (
        <span className="absolute left-2 top-1.5 font-mono text-micro text-muted-foreground">
          M{match.match_number}
        </span>
      )}

      {/* video badge */}
      {match.video_url && (
        <span
          title="Highlights available"
          className="absolute right-2 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-micro font-bold text-primary ring-1 ring-primary/40"
        >
          <Play className="size-2.5 fill-primary" aria-hidden="true" /> HL
        </span>
      )}

      {/* predicted badge — synthesized R32 fixture before FIFA/ESPN publishes the real pairing */}
      {match.predicted && (
        <span
          title="Predicted from current standings — actual fixture will replace this once published"
          className={`absolute ${match.video_url ? "top-7" : "top-1.5"} right-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-mlb)]/15 px-1.5 py-0.5 text-micro font-bold text-[var(--color-accent-mlb)] ring-1 ring-[var(--color-accent-mlb)]/40`}
        >
          <span className="size-1 rounded-full bg-[var(--color-accent-mlb)] animate-pulse motion-reduce:animate-none" aria-hidden="true" /> PREDICTED
        </span>
      )}

      {/* home */}
      <TeamRow
        team={match.home_team}
        score={match.home_score}
        win={w === "home"}
        large={isFinal}
        seedLabel={match.predicted ? match.home_seed_label ?? null : null}
      />
      <div className="h-px bg-border" aria-hidden="true" />
      {/* away */}
      <TeamRow
        team={match.away_team}
        score={match.away_score}
        win={w === "away"}
        large={isFinal}
        seedLabel={match.predicted ? match.away_seed_label ?? null : null}
      />

      {hasPen && (
        <div className="flex justify-center py-1.5">
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-micro text-primary">
            {match.home_score_pen}-{match.away_score_pen} pens
          </span>
        </div>
      )}

      {match.stadium && (
        <div className="truncate bg-muted/50 px-3 py-1.5 text-micro text-muted-foreground">
          {match.stadium}
        </div>
      )}

      {match.match_date ? (
        <div className={`flex items-center justify-between gap-2 border-t px-3 py-1.5 text-micro
          ${isUnplayed
            ? "border-[var(--color-accent-mlb)]/20 bg-[var(--color-accent-mlb)]/10"
            : "border-border bg-muted/40"}`}>
          <span className={`font-semibold uppercase ${isUnplayed ? "text-[var(--color-accent-mlb)]" : "text-muted-foreground"}`}>{date}</span>
          {time && (
            <span className={`font-bold tabular-nums ${isUnplayed ? "text-[var(--color-accent-mlb)]" : "text-foreground"}`}>{time}</span>
          )}
        </div>
      ) : isUnplayed ? (
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-1.5 text-micro">
          <span className="font-semibold uppercase text-muted-foreground">Kickoff TBD</span>
          <span className="italic text-muted-foreground">awaiting schedule</span>
        </div>
      ) : null}
    </button>
  );

  if (isFinal) {
    return <div className="rounded-xl bg-gradient-to-br from-gold to-primary p-[1.5px]">{card}</div>;
  }
  return card;
}

function TeamRow({
  team, score, win, large, seedLabel,
}: { team: string; score: number | null; win: boolean; large?: boolean; seedLabel?: string | null }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 ${large ? "h-12" : "h-11"}
        ${win ? "bg-gradient-to-r from-primary/15 to-transparent" : ""}`}
    >
      <span className="shrink-0 text-lg leading-none" aria-hidden="true">{flagOf(team)}</span>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-caption ${win ? "font-semibold text-primary" : "text-foreground"}`}>
          {team}
          {win && <Check className="ml-1 inline size-3 text-positive" aria-hidden="true" />}
        </div>
        {seedLabel && (
          <div className="-mt-0.5 truncate text-micro uppercase text-[var(--color-accent-mlb)]/80">
            {seedLabel}
          </div>
        )}
      </div>
      <span
        className={`shrink-0 tabular-nums ${
          win
            ? `font-black text-primary ${large ? "text-4xl" : "text-lg"}`
            : "font-bold text-muted-foreground"
        }`}
      >
        {score ?? "-"}
      </span>
    </div>
  );
}
