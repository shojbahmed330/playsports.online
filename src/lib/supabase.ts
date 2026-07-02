// Thin re-export layer over the generated Supabase client.
// All table shapes below are derived from the auto-generated Database types
// in `@/integrations/supabase/types` — no manual overrides.
//
// New code should import directly from `@/integrations/supabase/client`.
// This file exists only so the many WC components/hooks that already
// import `WCMatch` / `WCTournament` / `WCGroup` / `WC_YEARS` keep working.
import type { Tables } from "@/integrations/supabase/types";
import { FOOTBALL_WC } from "./tournament-config";

export { supabase } from "@/integrations/supabase/client";

export type WCTournament = Tables<"wc_tournaments">;
export type WCGroup = Tables<"wc_groups">;

// UI-only fields (predicted, seed labels) sit alongside the real row shape;
// callers strip them before writing to the DB.
export type WCMatch = Tables<"wc_matches"> & {
  predicted?: boolean;
  home_seed_label?: string | null;
  away_seed_label?: string | null;
};

export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
