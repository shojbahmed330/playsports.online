import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const PALETTE =
  /(?:bg|text|border|from|via|to|ring|shadow)-(?:white|black|gray|slate|zinc|neutral|stone|emerald|amber|sky|fuchsia|indigo|red|green|blue|purple|teal|orange|rose|lime|cyan|violet|pink|yellow)(?:-|\/|\b)/;

describe("design system foundation", () => {
  it("defines a type scale in styles.css", () => {
    const css = read("src/styles.css");
    for (const token of [
      "--text-display",
      "--text-h1",
      "--text-h2",
      "--text-h3",
      "--text-body",
      "--text-caption",
      "--text-micro",
    ]) {
      expect(css, `missing ${token}`).toContain(token);
    }
    // Each step carries its own line-height so screens stop inventing one.
    expect(css).toContain("--text-display--line-height");
    expect(css).toContain("--text-h1--line-height");
  });

  it("maps every sport to an accent token", () => {
    const css = read("src/styles.css");
    for (const sport of ["football", "cricket", "mlb", "nba", "nhl", "mls"]) {
      expect(css, `missing accent-${sport}`).toContain(`--color-accent-${sport}`);
    }
  });

  it("ships shared primitives that never hardcode palette colours", () => {
    const path = "src/components/ui/primitives.tsx";
    expect(existsSync(resolve(root, path)), "primitives.tsx not created").toBe(true);
    const src = read(path);
    expect(PALETTE.test(src), "primitives must use semantic tokens only").toBe(false);
    for (const name of ["Card", "StatTile", "ScoreRow", "TableShell", "Hero"]) {
      expect(src, `missing export ${name}`).toContain(`export function ${name}`);
    }
  });

  it("keeps redesigned screens token-only", () => {
    for (const path of [
      "src/routes/index.tsx",
      "src/components/home/CompactHero.tsx",
      "src/components/home/ForYouStrip.tsx",
      "src/components/home/PulseStrip.tsx",
      "src/components/home/SportCard.tsx",
      "src/components/home/LeagueCard.tsx",
      "src/components/home/SportChipTabs.tsx",
      "src/components/home/StatusBar.tsx",
      "src/components/home/TodayInZoneStrip.tsx",
      "src/components/home/HallOfChampionsStrip.tsx",
      "src/components/home/ShowMore.tsx",
      "src/components/sports/LiveTicker.tsx",
      "src/routes/football.index.tsx",
      "src/components/football/FootballHero.tsx",
      "src/components/football/FootballSubNav.tsx",
      "src/components/football/FootballFilterBar.tsx",
      "src/components/football/CurrentLeaguesStrip.tsx",
      "src/lib/sports-config.ts",
    ]) {
      expect(PALETTE.test(read(path)), `${path} hardcodes palette colours`).toBe(false);
    }
  });

  it("keeps interactive primitive targets at 44px", () => {
    const src = read("src/components/ui/primitives.tsx");
    // Any anchor/button rendered by a primitive must carry a 44px minimum.
    const anchors = src.match(/<(?:a|button)[\s\S]*?>/g) ?? [];
    for (const tag of anchors) {
      expect(tag, `interactive target without 44px: ${tag.slice(0, 80)}`).toMatch(
        /min-h-11|size-11|tap-target/,
      );
    }
  });
});
