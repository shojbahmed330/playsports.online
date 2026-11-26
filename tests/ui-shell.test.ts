import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(resolve(ROOT, path), "utf8");

function walk(dir: string): string[] {
  const full = resolve(ROOT, dir);
  return readdirSync(full).flatMap((entry) => {
    const child = join(dir, entry);
    return statSync(resolve(ROOT, child)).isDirectory() ? walk(child) : [child];
  });
}

describe("site shell invariants", () => {
  it("renders one footer at the root shell, not in page routes", () => {
    for (const route of [
      "src/routes/index.tsx",
      "src/routes/football.index.tsx",
      "src/routes/football.$comp.tsx",
    ]) {
      const source = read(route);
      expect(source, `${route} must not render the home footer`).not.toContain(
        'from "@/components/home/SiteFooter"',
      );
      expect(source, `${route} must not render <SiteFooter />`).not.toContain(
        "<SiteFooter />",
      );
    }
  });

  it("has exactly one footer implementation outside the unused home footer", () => {
    const allowed = new Set([
      "src/components/site/SiteFooter.tsx",
      "src/components/home/SiteFooter.tsx",
    ]);
    const offenders = walk("src")
      .filter((file) => /\.tsx$/.test(file))
      .filter((file) => !allowed.has(file.replaceAll("\\", "/")))
      .filter((file) => read(file).includes("<footer"));
    expect(offenders).toEqual([]);
  });

  it("keeps team detail routes out of the teams hub layout", () => {
    for (const sport of ["mlb", "nba", "nhl", "mls"]) {
      expect(
        existsSync(resolve(ROOT, `src/routes/${sport}.teams_.$slug.tsx`)),
        `${sport} team detail route must escape the teams hub layout`,
      ).toBe(true);
      expect(
        existsSync(resolve(ROOT, `src/routes/${sport}.teams.$slug.tsx`)),
        `${sport} team detail route must not be nested under the hub`,
      ).toBe(false);
    }
  });

  it("lets football leaf routes own the canonical, not the layout", () => {
    const layout = read("src/routes/football.$comp.tsx");
    expect(layout).not.toContain("buildCompetitionHead");
    expect(layout).toContain("return { meta: [] }");
  });

  it("does not publish retired WC match numbers or the noindex search page in sitemaps", () => {
    const sitemap = read("src/routes/sitemap[.]xml.ts");
    expect(sitemap).not.toContain("wc2026MatchUrls()");
    expect(sitemap).not.toContain('{ path: "/search"');
  });

  it("noindexes unavailable match pages instead of publishing a generic title", () => {
    const matchPage = read("src/routes/football.match.$id.tsx");
    expect(matchPage).toContain('name: "robots", content: "noindex, follow"');
  });

  it("uses the PlaySports brand everywhere", () => {
    const offenders = walk("src")
      .filter((file) => /\.(tsx?|css)$/.test(file))
      .filter((file) => read(file).includes("AllSports"));
    expect(offenders).toEqual([]);
  });

  it("does not use the Lovable preview image as the home OG image", () => {
    const home = read("src/routes/index.tsx");
    expect(home).not.toContain("lovable.app-");
    expect(home).not.toContain("r2.dev/");
  });

  it("positions the site as cricket + football, not a World Cup archive", () => {
    const title = "PlaySports — Live Cricket & Football Scores, Stats & History";
    expect(read("src/routes/__root.tsx")).toContain(title);
    expect(read("src/routes/index.tsx")).toContain(title);
  });
});
