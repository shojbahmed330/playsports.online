import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function LeagueCard({
  slug,
  name,
  emoji,
  season,
  accent,
}: {
  slug: string;
  name: string;
  emoji: string;
  season: string;
  accent: "pl" | "ucl";
}) {
  return (
    <Link
      to="/football/$comp"
      params={{ comp: slug }}
      className="group relative overflow-hidden rounded-2xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklch, var(--color-accent-${accent}) 28%, var(--background)) 0%, var(--background) 78%)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-micro font-bold text-muted-foreground ring-1 ring-border">
          {season}
        </span>
      </div>
      <div className="mt-3 text-h3 leading-tight text-foreground">{name}</div>
      <div className="mt-1 text-caption text-muted-foreground">Scores · Table · Fixtures</div>
      <div className="mt-3 inline-flex items-center gap-1 text-caption font-bold text-foreground transition-all group-hover:gap-2">
        Open <ArrowRight className="size-3" aria-hidden="true" />
      </div>
    </Link>
  );
}
