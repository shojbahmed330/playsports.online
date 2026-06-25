import { createClient } from "@supabase/supabase-js";

// Publishable anon key — safe to expose in frontend code.
const SUPABASE_URL = "https://vagqeperdsumxwukwbes.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZ3FlcGVyZHN1bXh3dWt3YmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzM1NjcsImV4cCI6MjA5NzU0OTU2N30.NGV1fXknh7dqhjld8lr65tZGgEWhZ7BktzEfRshCSs4";

// Session persistence enabled so admin login survives page reloads.
// `storage: undefined` on the server avoids referencing window during SSR.
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

export const WC_YEARS = [
  1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974,
  1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014,
  2018, 2022, 2026,
];
