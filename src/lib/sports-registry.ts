/**
 * Config-driven sport registry. The cron sync endpoint iterates this list;
 * adding a new sport is a one-liner, not a code overhaul.
 *
 * Each entry lists the "warmup" URLs to hit on each sync cycle. Those URLs
 * pass through the shared cache (`sports_data_cache`), so a scheduled sync
 * is really just "keep the cache warm and fresh for these keys".
 *
 * Season/tournament auto-switch is handled by:
 *   - `tournament-config.ts` for FIFA WC, EURO, COPA (fixed 4-year cycles)
 *   - ESPN's own "current season" convention for league sports (MLB, NBA…)
 *
 * That means when 2030 arrives you don't touch this file — the ESPN URLs
 * naturally point at whatever ESPN calls "current".
 */

import { FOOTBALL_WC, liveWcYear } from "@/lib/tournament-config";

export type SportRegistryEntry = {
  id: string;                // "football" | "cricket" | "mlb" …
  label: string;
  /** Warmup URLs. `{season}` is expanded from `seasonFn` if provided. */
  warmup: string[];
  /** Optional dynamic season resolver (returns current year/id). */
  seasonFn?: () => number | string;
  /** ISO-week-style peak days (0=Sun..6=Sat) — if omitted, always peak. */
  peakDays?: number[];
};

const espn = "https://site.api.espn.com/apis/site/v2/sports";
const espnCore = "https://site.web.api.espn.com/apis/common/v3/sports";

function worldCupRange() {
  const season = liveWcYear();
  const window = FOOTBALL_WC.seasonWindows[season];
  return {
    season,
    dates: window ? `${window.start.replace(/-/g, "")}-${window.end.replace(/-/g, "")}` : "20260611-20260719",
  };
}

// Football (World Cup + friendlies). tournament-config resolves the live WC.
export const FOOTBALL_WC_SEASON = () => {
  // Late import so client bundles don't pull server-only chains.
  // tournament-config is client-safe though.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { liveWcYear } = require("@/lib/tournament-config") as {
    liveWcYear: () => number;
  };
  return liveWcYear();
};

export const SPORTS: SportRegistryEntry[] = [
  (() => {
    const wc = worldCupRange();
    return {
      id: "football",
      label: "FIFA World Cup",
      warmup: [
        `${espn}/soccer/fifa.world/scoreboard?dates=${wc.dates}&limit=200`,
        `${espnCore}/soccer/fifa.world/standings?season=${wc.season}`,
      ],
    };
  })(),
  {
    id: "euro",
    label: "UEFA EURO",
    warmup: [`${espn}/soccer/uefa.euro/scoreboard`],
  },
  {
    id: "copa",
    label: "COPA América",
    warmup: [`${espn}/soccer/conmebol.america/scoreboard`],
  },
  {
    id: "mls",
    label: "MLS",
    warmup: [
      `${espn}/soccer/usa.1/scoreboard`,
      `${espn}/soccer/usa.1/standings`,
    ],
  },
  {
    id: "cricket",
    label: "Cricket",
    warmup: [`${espn}/cricket/scoreboard`],
  },
  {
    id: "ipl",
    label: "IPL",
    warmup: [`${espn}/cricket/8048/scoreboard`], // 8048 = ESPN "current IPL"
  },
  {
    id: "mlb",
    label: "MLB",
    warmup: [
      `${espn}/baseball/mlb/scoreboard`,
      `${espnCore}/baseball/mlb/standings`,
    ],
  },
  {
    id: "nba",
    label: "NBA",
    warmup: [
      `${espn}/basketball/nba/scoreboard`,
      `${espnCore}/basketball/nba/standings`,
    ],
  },
  {
    id: "nhl",
    label: "NHL",
    warmup: [
      `${espn}/hockey/nhl/scoreboard`,
      `${espnCore}/hockey/nhl/standings`,
    ],
  },
];

export function findSport(id: string): SportRegistryEntry | undefined {
  return SPORTS.find((s) => s.id === id);
}
