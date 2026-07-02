// Bridge until you regenerate types.ts from your own Supabase project:
//   npx supabase gen types typescript --project-id vagqeperdsumxwukwbes \
//     > src/integrations/supabase/types.ts
//
// Until then, we merge WC table types into the auto-generated Database
// and re-cast the shared client so `wc_matches`, `wc_tournaments`, and
// `wc_groups` are queryable without breaking the existing typed tables.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedSupabase } from "@/integrations/supabase/client";
import type { Database as BaseDatabase } from "@/integrations/supabase/types";

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

type WcTables = {
  wc_matches: {
    Row: WcMatchesRow;
    Insert: Partial<WcMatchesRow> & { id?: number };
    Update: Partial<WcMatchesRow>;
    Relationships: [];
  };
  wc_tournaments: {
    Row: WcTournamentsRow;
    Insert: WcTournamentsRow;
    Update: Partial<WcTournamentsRow>;
    Relationships: [];
  };
  wc_groups: {
    Row: WcGroupsRow;
    Insert: WcGroupsRow;
    Update: Partial<WcGroupsRow>;
    Relationships: [];
  };
};

export type ExtendedDatabase = BaseDatabase & {
  public: BaseDatabase["public"] & {
    Tables: BaseDatabase["public"]["Tables"] & WcTables;
  };
};

export const supabase = typedSupabase as unknown as SupabaseClient<ExtendedDatabase>;

export type WCTournament = WcTournamentsRow;
export type WCMatch = WcMatchesRow & {
  predicted?: boolean;
  home_seed_label?: string | null;
  away_seed_label?: string | null;
};
export type WCGroup = WcGroupsRow;

import { FOOTBALL_WC } from "./tournament-config";
export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
