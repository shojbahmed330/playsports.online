/** SEO-friendly cricket player slugs: "Shai Hope" → "shai-hope". */
export function cricketPlayerSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Best-effort name from a slug: "shai-hope" → "Shai Hope". */
export function cricketPlayerNameFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Known ESPN athlete ids for slugs where ESPN's name search does not find the
 * player (e.g. scorecards print "Kannaur Lokesh", ESPN knows "KL Rahul").
 * Keep this small: the `?athlete` link is the general fallback.
 */
export const CRICKET_PLAYER_ALIASES: Record<string, string> = {
  "kannaur-lokesh": "422108",
  "kannaur-lokesh-rahul": "422108",
  "kl-rahul": "422108",
};

export function cricketPlayerAliasId(slug: string): string | null {
  return CRICKET_PLAYER_ALIASES[decodeURIComponent(slug)] ?? null;
}
