/**
 * Head-to-head matchup slug helpers.
 *
 * URL shape used by `/football/$comp/h2h/$matchup`: `germany-vs-spain`.
 * The H2H route normalises order internally, so the on-URL order can safely
 * follow the "home team first" convention from whatever screen linked in.
 */

export function slugifyTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchupSlug(home: string, away: string): string {
  return `${slugifyTeamName(home)}-vs-${slugifyTeamName(away)}`;
}

/** Parse a `foo-bar-vs-baz-qux` slug back into two Title-Case team names. */
export function parseMatchupSlug(slug: string): { a: string; b: string } | null {
  const idx = slug.indexOf("-vs-");
  if (idx <= 0) return null;
  const left = slug.slice(0, idx);
  const right = slug.slice(idx + 4);
  const cap = (s: string) =>
    s
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const a = cap(left);
  const b = cap(right);
  if (!a || !b) return null;
  return { a, b };
}
