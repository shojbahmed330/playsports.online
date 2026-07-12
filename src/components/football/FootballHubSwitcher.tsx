import { Link } from "@tanstack/react-router";
import { COMPETITIONS, type Competition } from "@/lib/competitions";

/**
 * Sitewide-style pill row for switching between football competitions.
 * Renders above the hero on `/football` and every `/football/<comp>/...` page.
 */
export function FootballHubSwitcher({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav
      aria-label="Football competitions"
      className="w-full border-b border-border/60 bg-background/60 backdrop-blur"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {COMPETITIONS.map((c) => (
          <CompChip key={c.slug} comp={c} active={c.slug === activeSlug} />
        ))}
      </div>
    </nav>
  );
}

function CompChip({ comp, active }: { comp: Competition; active: boolean }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold transition-all border";
  const cls = active
    ? `${base} ${comp.hero.chipAccent} border-transparent shadow-md`
    : `${base} border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10`;
  return (
    <Link
      to="/football/$comp"
      params={{ comp: comp.slug }}
      className={cls}
      aria-current={active ? "page" : undefined}
    >
      <span aria-hidden>{comp.hero.emoji}</span>
      <span>{comp.shortName}</span>
    </Link>
  );
}
