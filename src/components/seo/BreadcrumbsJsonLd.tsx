import { breadcrumbList } from "@/lib/seo/jsonld";

export type BreadcrumbCrumb = { name: string; path: string };

/**
 * Emits BreadcrumbList JSON-LD as an inline <script>. Pair with the
 * visible <Breadcrumbs /> component using the same crumb source so the
 * two never drift. The visible trail is already rendered elsewhere;
 * this component adds the structured-data half.
 *
 * Preferred for leaf entity pages where the crumb data is computed in
 * the loader/component. For static top-level pages, emit JSON-LD from
 * the route's head() instead.
 */
export function BreadcrumbsJsonLd({ crumbs }: { crumbs: BreadcrumbCrumb[] }) {
  if (!crumbs.length) return null;
  return (
    <script
      type="application/ld+json"
      // Deterministic string → same HTML on every crawl
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList(crumbs)) }}
    />
  );
}
