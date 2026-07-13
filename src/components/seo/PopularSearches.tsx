// Phase 2.2 — Internal-link strip for high-volume long-tail keyword pages.
// Renders on homepage and sport hubs to spread PageRank + give crawlers
// entry points to the SSR landing pages. When `sport` is passed, the
// strip is filtered to that sport (+ multi-sport queries) so hub context
// stays tight.

import { Link } from "@tanstack/react-router";
import {
  popularTargets,
  popularTargetsBySport,
  type KeywordSport,
} from "@/lib/seo/keyword-map";

export function PopularSearches({
  limit = 8,
  sport,
  className = "",
}: {
  limit?: number;
  sport?: KeywordSport;
  className?: string;
}) {
  const items = sport ? popularTargetsBySport(sport, limit) : popularTargets(limit);
  if (!items.length) return null;
  return (
    <section aria-labelledby="popular-searches-heading" className={className}>
      <h2
        id="popular-searches-heading"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3"
      >
        Popular searches
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t.url}>
            <Link
              to={t.url}
              className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors"
            >
              {t.keyword}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
