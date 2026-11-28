import { useMemo, useState } from "react";
import { EmptyState } from "./ScorecardTab";

export type Comment = { text: string; period: number; scoreValue: number; time: string };

type Filter = "all" | "wickets" | "boundaries" | "overs";

function classify(c: Comment): Filter[] {
  const t = c.text.toLowerCase();
  const kinds: Filter[] = ["all"];
  if (/wicket|\bout\b|caught|bowled|lbw|stumped|run out/.test(t)) kinds.push("wickets");
  if (c.scoreValue === 4 || c.scoreValue === 6 || /\bfour\b|\bsix\b|boundary/.test(t))
    kinds.push("boundaries");
  if (/end of over|over\s+\d/i.test(t)) kinds.push("overs");
  return kinds;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wickets", label: "Wickets" },
  { id: "boundaries", label: "4s & 6s" },
  { id: "overs", label: "Overs" },
];

export function CommentaryTab({ commentary }: { commentary: Comment[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(
    () => commentary.filter((c) => classify(c).includes(filter)),
    [commentary, filter],
  );

  if (commentary.length === 0) return <EmptyState label="Commentary not available yet." />;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-[36px] px-3 rounded-full text-xs font-semibold ring-1 transition ${
              filter === f.id
                ? "bg-[var(--color-accent-cricket)]/20 text-[var(--color-accent-cricket)] ring-[var(--color-accent-cricket)]/50"
                : "bg-background text-foreground ring-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={`No ${filter === "all" ? "" : filter + " "}events yet.`} />
      ) : (
        <ol className="space-y-2">
          {filtered.map((c, i) => {
            const isWicket = classify(c).includes("wickets");
            const isBoundary = classify(c).includes("boundaries");
            return (
              <li
                key={i}
                className={`rounded-lg border p-3 text-sm leading-relaxed ${
                  isWicket
                    ? "border-[var(--color-live)]/30 bg-[var(--color-live)]/[0.06]"
                    : isBoundary
                      ? "border-[var(--color-gold)]/25 bg-[var(--color-gold)]/[0.05]"
                      : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-foreground mb-1">
                  {isWicket && <span className="text-[var(--color-live)] font-bold">Wicket</span>}
                  {!isWicket && isBoundary && (
                    <span className="text-[var(--color-gold)] font-bold">
                      {c.scoreValue === 6 ? "SIX" : "FOUR"}
                    </span>
                  )}
                  {c.time && <span className="tabular-nums">{c.time}</span>}
                  {c.period > 0 && <span>· Innings {c.period}</span>}
                </div>
                <p className="text-foreground">{c.text}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
