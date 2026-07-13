// Content freshness signals. Uses module-load ISO timestamp — stable per
// deploy on the server, resets on client hydration but the SSR-rendered
// meta is what crawlers see.

export const BUILD_ISO: string = new Date().toISOString();

export function formatFreshDate(iso: string = BUILD_ISO): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

// Meta tags advertising last-updated time to crawlers and social platforms.
export function freshnessMeta(section?: string): Array<Record<string, string>> {
  const meta: Array<Record<string, string>> = [
    { property: "article:modified_time", content: BUILD_ISO },
    { property: "og:updated_time", content: BUILD_ISO },
    { name: "last-modified", content: BUILD_ISO },
  ];
  if (section) meta.push({ property: "article:section", content: section });
  return meta;
}
