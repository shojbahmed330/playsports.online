// Local type augmentation for tables that exist in your Supabase project
// (vagqeperdsumxwukwbes) but are not yet reflected in the auto-generated
// `types.ts`. Regenerate types from your own project to remove this file:
//   npx supabase gen types typescript --project-id vagqeperdsumxwukwbes \
//     > src/integrations/supabase/types.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedSupabase } from "@/integrations/supabase/client";

type WcMatchesRow = {
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
};

type WcTournamentsRow = {
  year: number;
  host_country: string | null;
  champion: string | null;
  runner_up: string | null;
  third_place: string | null;
  fourth_place: string | null;
};

type WcGroupsRow = {
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

export type WcExtendedDatabase = {
  public: {
    Tables: {
      wc_matches: { Row: WcMatchesRow; Insert: Partial<WcMatchesRow> & { id?: number }; Update: Partial<WcMatchesRow> };
      wc_tournaments: { Row: WcTournamentsRow; Insert: WcTournamentsRow; Update: Partial<WcTournamentsRow> };
      wc_groups: { Row: WcGroupsRow; Insert: WcGroupsRow; Update: Partial<WcGroupsRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Reuse the same underlying connection; cast to expose wc_* tables.
export const supabase = typedSupabase as unknown as SupabaseClient<WcExtendedDatabase> &
  typeof typedSupabase;

// Re-exported types used across the WC UI.
export type WCTournament = WcTournamentsRow;
export type WCMatch = WcMatchesRow & {
  predicted?: boolean;
  home_seed_label?: string | null;
  away_seed_label?: string | null;
};
export type WCGroup = WcGroupsRow;

import { FOOTBALL_WC } from "./tournament-config";
export const WC_YEARS: number[] = [...FOOTBALL_WC.years];

// Silence unused-import warning for createClient (kept for future direct use).
export { createClient };
