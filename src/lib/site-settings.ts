import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type AdSenseSlotKey = "header" | "in_content" | "sidebar" | "footer";

export type AdSenseSettings = {
  enabled: boolean;
  client: string;          // e.g. "ca-pub-1234567890123456"
  slots: Partial<Record<AdSenseSlotKey, string>>;
  auto_ads: boolean;       // run Google's Auto Ads in addition to manual slots
};

export const DEFAULT_ADSENSE: AdSenseSettings = {
  enabled: false,
  client: "",
  slots: {},
  auto_ads: false,
};

const TEN_MIN = 1000 * 60 * 10;

/** Fetch a single setting row by key. Public read (RLS allows anon SELECT). */
export async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return (data.value as T) ?? fallback;
}

export function useAdSenseSettings() {
  return useQuery({
    queryKey: ["site_settings", "adsense"],
    staleTime: TEN_MIN,
    gcTime: TEN_MIN * 3,
    queryFn: () => fetchSetting<AdSenseSettings>("adsense", DEFAULT_ADSENSE),
  });
}

export async function saveAdSenseSettings(value: AdSenseSettings) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "adsense", value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
