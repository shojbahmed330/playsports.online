// Re-exports the project's real Supabase client so legacy imports
// (`@/lib/supabase`) keep working. The actual client is auto-generated at
// `@/integrations/supabase/client` and reads env vars — never hardcode URLs/keys here.
export { supabase } from "@/integrations/supabase/client";

export type WCTournament = {
  year: number;
  host_country: string | null;
  champion: string | null;
  runner_up: string | null;
  third_place: string | null;
  fourth_place: string | null;
};

export type WCMatch = {
  id: number;
  tournament_year: number;
  round: string;
  match_number: number | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  home_score_pen: number | null;
  away_score_pen: number | null;
  match_date: string | null;
  stadium: string | null;
  city: string | null;
  video_url: string | null;
  /** True for synthesized fixtures (e.g. predicted Round of 32 before FIFA/ESPN publishes the real matchup). */
  predicted?: boolean;
  /** Human-readable seed hint for the home slot of a predicted KO fixture (e.g. "Winner Group A"). */
  home_seed_label?: string | null;
  /** Human-readable seed hint for the away slot of a predicted KO fixture (e.g. "Best 3rd #1"). */
  away_seed_label?: string | null;
};

export type WCGroup = {
  tournament_year: number;
  group_name: string;
  team: string;
  position: number | null;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goals_for: number | null;
  goals_against: number | null;
  points: number | null;
  qualified: boolean | null;
};

import { FOOTBALL_WC } from "./tournament-config";

/** Single source of truth — see src/lib/tournament-config.ts. */
export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
