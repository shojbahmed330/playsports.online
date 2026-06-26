/**
 * Knockout format registry.
 *
 * Step 4 of the Auto-Update plan. Maps a format key (held in
 * tournament-config → FOOTBALL_WC.seasonWindows[year].format) to the
 * generator that produces predicted knockout fixtures from group standings.
 *
 * Adding a new tournament (e.g. WC 2030) is now zero-component work:
 *   1. Set seasonWindows[2030].format = "r32_48team_v1" in tournament-config
 *      → reuses the same 48-team R32 generator.
 *   2. Or, if FIFA changes the bracket layout for a future cycle, build
 *      `r32_48team_v2.ts` and add { r32_48team_v2: { compute… } } below.
 *
 * Callers (Wc2026View) should look up the format by year via
 * `getKnockoutFormat(year)` instead of importing the 2026-specific module.
 */

import type { WCMatch } from "@/lib/supabase";
import type { Wc2026Group } from "@/lib/wc2026.functions";
import { FOOTBALL_WC } from "@/lib/tournament-config";
import { computePredictedKnockout as compute_r32_48team_v1 } from "@/lib/wc2026-r32-format";

export type KnockoutFormat = {
  /** Produce the predicted knockout bracket (R32 → Final) from group standings. */
  computePredictedKnockout: (groups: Wc2026Group[]) => WCMatch[];
};

export const KNOCKOUT_FORMATS: Record<string, KnockoutFormat> = {
  r32_48team_v1: {
    computePredictedKnockout: compute_r32_48team_v1,
  },
};

/**
 * Resolve the knockout-format generator for a given WC year.
 * Falls back to `r32_48team_v1` if the year is unknown — safe default
 * because every confirmed future WC (2026/2030/2034) uses the same matrix.
 */
export function getKnockoutFormat(year: number): KnockoutFormat {
  const key = FOOTBALL_WC.seasonWindows[year]?.format ?? "r32_48team_v1";
  return KNOCKOUT_FORMATS[key] ?? KNOCKOUT_FORMATS.r32_48team_v1;
}
