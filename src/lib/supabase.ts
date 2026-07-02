// Single source of truth for the browser Supabase client.
// The env-driven client at `@/integrations/supabase/client` connects to
// your own Supabase project (vagqeperdsumxwukwbes) via VITE_SUPABASE_*
// env vars — see `.env`. Everything re-exports from here.
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
  predicted?: boolean;
  home_seed_label?: string | null;
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
export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
