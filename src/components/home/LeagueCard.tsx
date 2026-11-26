import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function LeagueCard({
  slug,
  name,
  emoji,
  season,
  gradient,
}: {
  slug: string;
  name: string;
  emoji: string;
  season: string;
  gradient: string;
}) {
  return (
    <Link
      to="/football/$comp"
      params={{ comp: slug }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20"
      style={{ background: gradient }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white/80">
          {season}
        </span>
      </div>
      <div className="mt-3 text-base font-extrabold text-white leading-tight">{name}</div>
      <div className="mt-1 text-[11px] text-white/70">Scores · Table · Fixtures</div>
      <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white group-hover:gap-2 transition-all">
        Open <ArrowRight className="size-3" />
      </div>
    </Link>
  );
}
