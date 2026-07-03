import { Link } from "@tanstack/react-router";

export type CloudLink = { label: string; href: string };

/**
 * Compact chip-style link cloud for high-volume internal linking
 * (e.g. every scorer in a match, every team in a group, every year
 * in a championship). Use when you have many links and want them to
 * fit in a small visual footprint without dominating the page.
 *
 * Uses <a> because href strings are dynamic and not typable against
 * TanStack Router's typed routes.
 */
export function EntityLinkCloud({
  title,
  links,
  className = "",
}: {
  title?: string;
  links: CloudLink[];
  className?: string;
}) {
  if (!links.length) return null;
  return (
    <nav aria-label={title ?? "Related links"} className={`mt-6 ${className}`}>
      {title && (
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
      )}
      <ul className="flex flex-wrap gap-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="inline-block rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition hover:border-indigo-400/60 hover:text-indigo-400"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Typed variant that uses <Link> when both href and params are known.
 * Prefer this only when the target is a static route (no $params).
 */
export function StaticEntityLinkCloud({
  title,
  links,
}: {
  title?: string;
  links: Array<{ label: string; to: string }>;
}) {
  if (!links.length) return null;
  return (
    <nav aria-label={title ?? "Related links"} className="mt-6">
      {title && (
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
      )}
      <ul className="flex flex-wrap gap-1.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-block rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition hover:border-indigo-400/60 hover:text-indigo-400"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
