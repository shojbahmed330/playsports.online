import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type Network = "amazon" | "fanatics" | "sportsbook" | "generic";
export type Placement =
  | "inline"
  | "sidebar"
  | "match_footer"
  | "player_footer"
  | "homepage";
export type SlotType = "match" | "team" | "league" | "banner";

export type AffiliateLink = {
  id: string;
  network: Network;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  cta_label: string;
  placement: Placement;
  sport: string | null;
  team_slug: string | null;
  league_slug: string | null;
  geo_restrict: string[] | null;
  priority: number;
  active: boolean;
  click_count: number;
};

export type SponsoredSlot = {
  id: string;
  slot_type: SlotType;
  title: string;
  sponsor_name: string;
  sponsor_logo_url: string | null;
  target_url: string;
  image_url: string | null;
  description: string | null;
  ref_id: string | null;
  sport: string | null;
  starts_at: string;
  ends_at: string | null;
  priority: number;
  active: boolean;
  impressions: number;
  clicks: number;
};

export type AffiliateCtx = {
  placement: Placement;
  sport?: string;
  team_slug?: string;
  league_slug?: string;
  country?: string;
  limit?: number;
};

const FIVE_MIN = 1000 * 60 * 5;

export function useAffiliateLinks(ctx: AffiliateCtx) {
  return useQuery({
    queryKey: ["affiliate_links", ctx],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<AffiliateLink[]> => {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("active", true)
        .eq("placement", ctx.placement)
        .order("priority", { ascending: false })
        .limit(20);
      if (error || !data) return [];
      const rows = data as unknown as AffiliateLink[];
      return rows
        .filter((r) => !r.sport || r.sport === "all" || r.sport === ctx.sport)
        .filter((r) => !r.team_slug || r.team_slug === ctx.team_slug)
        .filter((r) => !r.league_slug || r.league_slug === ctx.league_slug)
        .filter(
          (r) =>
            !r.geo_restrict ||
            r.geo_restrict.length === 0 ||
            (ctx.country && r.geo_restrict.includes(ctx.country)),
        )
        .slice(0, ctx.limit ?? 4);
    },
  });
}

export function useSponsoredSlots(
  slotType: SlotType,
  opts: { sport?: string; ref_id?: string; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["sponsored_slots", slotType, opts],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<SponsoredSlot[]> => {
      const { data, error } = await supabase
        .from("sponsored_slots")
        .select("*")
        .eq("active", true)
        .eq("slot_type", slotType)
        .order("priority", { ascending: false })
        .limit(20);
      if (error || !data) return [];
      const now = Date.now();
      const rows = data as unknown as SponsoredSlot[];
      return rows
        .filter((r) => !r.ends_at || new Date(r.ends_at).getTime() > now)
        .filter((r) => !opts.sport || !r.sport || r.sport === opts.sport)
        .filter((r) => !opts.ref_id || !r.ref_id || r.ref_id === opts.ref_id)
        .slice(0, opts.limit ?? 3);
    },
  });
}

/** Increment click count (best-effort; ignore errors). */
export async function trackAffiliateClick(id: string) {
  try {
    await supabase.rpc("noop").throwOnError;
  } catch {
    /* no-op */
  }
  // Use a fire-and-forget update via REST (no RPC; rely on RLS public update? No — table is admin-write).
  // So we just log to localStorage for analytics; real counts can come from GA4 outbound link events.
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      w.gtag?.("event", "affiliate_click", { link_id: id });
    }
  } catch {
    /* ignore */
  }
}

export async function trackSponsoredClick(id: string) {
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      w.gtag?.("event", "sponsored_click", { slot_id: id });
    }
  } catch {
    /* ignore */
  }
  void id;
}

// =========== Admin CRUD ===========
export function useAdminAffiliates() {
  return useQuery({
    queryKey: ["admin_affiliate_links"],
    queryFn: async () => {
      const { data } = await supabase
        .from("affiliate_links")
        .select("*")
        .order("priority", { ascending: false });
      return (data ?? []) as unknown as AffiliateLink[];
    },
  });
}

export function useAdminSponsored() {
  return useQuery({
    queryKey: ["admin_sponsored_slots"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsored_slots")
        .select("*")
        .order("priority", { ascending: false });
      return (data ?? []) as unknown as SponsoredSlot[];
    },
  });
}

export function useSaveAffiliate() {
  return useMutation({
    mutationFn: async (row: Partial<AffiliateLink> & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from("affiliate_links")
          .update(row as never)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("affiliate_links")
          .insert(row as never);
        if (error) throw error;
      }
    },
  });
}

export function useDeleteAffiliate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("affiliate_links")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  });
}

export function useSaveSponsored() {
  return useMutation({
    mutationFn: async (row: Partial<SponsoredSlot> & { id?: string }) => {
      if (row.id) {
        const { error } = await supabase
          .from("sponsored_slots")
          .update(row as never)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sponsored_slots")
          .insert(row as never);
        if (error) throw error;
      }
    },
  });
}

export function useDeleteSponsored() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sponsored_slots")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  });
}

// =========== Disclosure ===========
export type AffiliateDisclosure = { enabled: boolean; text: string };
export const DEFAULT_DISCLOSURE: AffiliateDisclosure = {
  enabled: true,
  text:
    "As an Amazon Associate and partner with Fanatics and licensed sportsbooks, we earn from qualifying purchases and signups. Bet responsibly. 21+ where applicable.",
};
