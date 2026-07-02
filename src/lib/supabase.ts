// Thin re-export layer over the generated Supabase client.
// Table shapes are derived from the auto-generated Database types in
// `@/integrations/supabase/types` — no manual overrides.
//
// New code should import directly from `@/integrations/supabase/client`.
// This module exists so the many WC components/hooks that already import
// `WCMatch` / `WCTournament` / `WCGroup` / `WC_YEARS` keep working.
import type { Tables } from "@/integrations/supabase/types";
import { FOOTBALL_WC } from "./tournament-config";

export { supabase } from "@/integrations/supabase/client";

// `created_at` / `updated_at` are DB-managed; UI literals (predictions,
// seed brackets, seeded fixtures) don't set them, so mark them optional
// on the shared UI type. DB reads still satisfy this shape.
type UiRow<T> = Omit<T, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export type WCTournament = UiRow<Tables<"wc_tournaments">>;
export type WCGroup = UiRow<Tables<"wc_groups">>;

// UI-only fields (predicted, seed labels) sit alongside the real row shape;
// callers strip them before writing to the DB.
export type WCMatch = UiRow<Tables<"wc_matches">> & {
  predicted?: boolean;
  home_seed_label?: string | null;
  away_seed_label?: string | null;
};

export const WC_YEARS: number[] = [...FOOTBALL_WC.years];
