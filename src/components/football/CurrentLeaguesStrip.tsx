import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COMPETITIONS, formatSeasonLabel } from "@/lib/competitions";
import { SectionHeader } from "@/components/ui/state";

const CURRENT_SLUGS = ["premier-league", "champions-league", "laliga"];

export function CurrentLeaguesStrip() {
  const competitions = CURRENT_SLUGS.map((slug) =>
    COMPETITIONS.find((comp) => comp.slug === slug),
  ).filter((comp): comp is NonNullable<typeof comp> => Boolean(comp));

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <SectionHeader
          kicker="Live football"
          title="Premier League · Champions League · La Liga"
          className="mb-0"
        />
        <Link
          to="/live/$sport"
          params={{ sport: "football" }}
          className="hidden min-h-11 items-center gap-1 text-caption font-bold text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
        >
          All live football <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {competitions.map((comp) => (
          <Link
            key={comp.slug}
            to="/football/$comp"
            params={{ comp: comp.slug }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: comp.hero.gradient }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl leading-none" aria-hidden="true">
                {comp.hero.emoji}
              </span>
              <span className="rounded-full bg-background/60 px-2 py-0.5 text-micro font-bold uppercase text-muted-foreground ring-1 ring-border">
                {formatSeasonLabel(comp, comp.currentSeason)}
              </span>
            </div>
            <div className="mt-3 text-h3 text-foreground">{comp.name}</div>
            <div className="mt-1 text-caption text-muted-foreground">
              Live scores · Fixtures · Table
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-caption font-bold text-foreground transition-all group-hover:gap-2">
              Open <ArrowRight className="size-3" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
