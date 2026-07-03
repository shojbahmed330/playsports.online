import { Link } from "@tanstack/react-router";

export type RelatedLink = {
  label: string;
  href: string;
  hint?: string;
};

/**
 * Semantic internal-linking block. Rendered as a real <nav> with descriptive
 * anchor text so crawlers (and AI Overviews) treat it as an authoritative
 * "See also" section, not a footer widget.
 */
export function RelatedLinks({
  title = "Related on PlaySports",
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;
  return (
    <nav aria-label={title} className="mt-8 rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              to={l.href}
              className="group block rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm transition hover:border-gold/60 hover:bg-accent"
            >
              <span className="font-medium group-hover:text-gold">{l.label}</span>
              {l.hint && (
                <span className="ml-1 text-xs text-muted-foreground">— {l.hint}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
