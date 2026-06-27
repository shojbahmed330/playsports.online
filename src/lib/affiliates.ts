import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { detectCountry } from "./geo";

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

/** Normalize incoming sport string (e.g. "football_wc", "cricket_t20") to an
 *  affiliate-row sport key ("football", "cricket", "mlb", "nba", "nhl", "mls"). */
export function normalizeAffiliateSport(s?: string | null): string | undefined {
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower.startsWith("football") || lower === "soccer" || lower === "wc") return "football";
  if (lower.startsWith("cricket") || lower === "ipl") return "cricket";
  if (lower.startsWith("mlb") || lower === "baseball") return "mlb";
  if (lower.startsWith("nba") || lower === "basketball") return "nba";
  if (lower.startsWith("nhl") || lower === "hockey") return "nhl";
  if (lower.startsWith("mls")) return "mls";
  return lower;
}

export function useAffiliateLinks(ctx: AffiliateCtx) {
  // Stable cache key — derive country once per call site if not passed.
  const country =
    ctx.country ??
    (typeof window !== "undefined" ? detectCountry() : undefined);
  const sport = normalizeAffiliateSport(ctx.sport);
  const resolved: AffiliateCtx = { ...ctx, sport, country };
  return useQuery({
    queryKey: ["affiliate_links", resolved],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<AffiliateLink[]> => {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("active", true)
        .eq("placement", resolved.placement)
        .order("priority", { ascending: false })
        .limit(20);
      if (error || !data) return [];
      const rows = data as unknown as AffiliateLink[];
      return rows
        .filter((r) => !r.sport || r.sport === "all" || r.sport === resolved.sport)
        .filter((r) => !r.team_slug || r.team_slug === resolved.team_slug)
        .filter((r) => !r.league_slug || r.league_slug === resolved.league_slug)
        .filter(
          (r) =>
            !r.geo_restrict ||
            r.geo_restrict.length === 0 ||
            (resolved.country && r.geo_restrict.includes(resolved.country)),
        )
        .slice(0, resolved.limit ?? 4);
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

function postClick(kind: "affiliate" | "sponsored", id: string) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ kind, id });
    const url = "/api/public/track-click";
    const ok =
      "sendBeacon" in navigator &&
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (!ok) {
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => null);
    }
  } catch { /* ignore */ }
}

/** Increment click count in DB + fire gtag event (best effort). */
export function trackAffiliateClick(id: string) {
  postClick("affiliate", id);
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      w.gtag?.("event", "affiliate_click", { link_id: id });
    }
  } catch { /* ignore */ }
}

export function trackSponsoredClick(id: string) {
  postClick("sponsored", id);
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      w.gtag?.("event", "sponsored_click", { slot_id: id });
    }
  } catch { /* ignore */ }
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
