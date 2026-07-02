import { createClient } from "@supabase/supabase-js";

// ⚠️ LEGACY WORLD CUP ARCHIVE BACKEND ⚠️
// This is a SEPARATE, read-only Supabase project that hosts the historical
// FIFA World Cup dataset (wc_matches, wc_tournaments, wc_groups, wc2026_*).
// It is NOT the project's main Lovable Cloud backend — for auth, memberships,
// admin, newsletter, affiliates, digest, etc. use:
//   import { supabase } from "@/integrations/supabase/client";
//
// If you want to fully own this data, migrate these tables into Lovable Cloud
// and swap this import out — until then this client stays hardcoded because
// the anon key belongs to a different Supabase org.
const SUPABASE_URL = "https://vagqeperdsumxwukwbes.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZ3FlcGVyZHN1bXh3dWt3YmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzM1NjcsImV4cCI6MjA5NzU0OTU2N30.NGV1fXknh7dqhjld8lr65tZGgEWhZ7BktzEfRshCSs4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    detectSessionInUrl: typeof window !== "undefined",
  },
});

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

/** Single source of truth — see src/lib/tournament-config.ts. */
export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
