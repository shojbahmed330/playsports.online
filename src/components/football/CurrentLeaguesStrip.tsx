import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COMPETITIONS, formatSeasonLabel } from "@/lib/competitions";

const CURRENT_SLUGS = ["premier-league", "champions-league", "laliga"];

export function CurrentLeaguesStrip() {
  const competitions = CURRENT_SLUGS.map((slug) =>
    COMPETITIONS.find((comp) => comp.slug === slug),
  ).filter((comp): comp is NonNullable<typeof comp> => Boolean(comp));

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Live football
          </h2>
          <p className="text-lg sm:text-xl font-extrabold mt-1">
            Premier League · Champions League · La Liga
          </p>
        </div>
        <Link
          to="/live/football"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-sky-200"
        >
          All live football <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {competitions.map((comp) => (
          <Link
            key={comp.slug}
            to="/football/$comp"
            params={{ comp: comp.slug }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-500/40"
            style={{ background: comp.hero.gradient }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl leading-none" aria-hidden>
                {comp.hero.emoji}
              </span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                {formatSeasonLabel(comp, comp.currentSeason)}
              </span>
            </div>
            <div className="mt-3 text-base font-extrabold text-white">{comp.name}</div>
            <div className="mt-1 text-[11px] text-white/70">
              Live scores · Fixtures · Table
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white group-hover:gap-2 transition-all">
              Open <ArrowRight className="size-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
