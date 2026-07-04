import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

// ============= AdSense =============
export type AdSenseSlotKey = "header" | "in_content" | "sidebar" | "footer";

export type AdSenseSettings = {
  enabled: boolean;
  client: string;
  slots: Partial<Record<AdSenseSlotKey, string>>;
  auto_ads: boolean;
  /** Optional raw ads.txt content. If empty, `/ads.txt` is auto-generated from `client`. */
  ads_txt?: string;
};

export const DEFAULT_ADSENSE: AdSenseSettings = {
  enabled: false,
  client: "",
  slots: {},
  auto_ads: false,
  ads_txt: "",
};


// ============= Analytics =============
export type AnalyticsSettings = {
  enabled: boolean;
  ga4_measurement_id: string;
  gtm_container_id: string;
  gsc_verification: string;
};
export const DEFAULT_ANALYTICS: AnalyticsSettings = {
  enabled: false,
  ga4_measurement_id: "",
  gtm_container_id: "",
  gsc_verification: "",
};

// ============= Cookie consent =============
export type ConsentSettings = {
  enabled: boolean;
  banner_text: string;
};
export const DEFAULT_CONSENT: ConsentSettings = {
  enabled: true,
  banner_text:
    "We use cookies to keep PlaySports fast, measure traffic, and show relevant ads. Manage your choice anytime from the footer.",
};

// ============= Newsletter =============
export type NewsletterSettings = {
  enabled: boolean;
  mode: "native" | "beehiiv";
  beehiiv_pub_id: string;
  headline: string;
  sub: string;
};
export const DEFAULT_NEWSLETTER: NewsletterSettings = {
  enabled: true,
  mode: "native",
  beehiiv_pub_id: "",
  headline: "Daily Slate in Your Inbox",
  sub: "Tomorrow's biggest games and last night's scores — every morning at 8am ET.",
};

// ============= Identity / footer =============
export type IdentitySettings = {
  tagline: string;
  footer_text: string;
  social: { x: string; youtube: string; reddit: string; instagram: string };
};
export const DEFAULT_IDENTITY: IdentitySettings = {
  tagline: "Live scores, stats & the complete FIFA World Cup archive.",
  footer_text: "© PlaySports. Data via ESPN, Sofascore & official league feeds.",
  social: { x: "", youtube: "", reddit: "", instagram: "" },
};

// ============= Contact =============
export type ContactSettings = { email: string; response_time: string };
export const DEFAULT_CONTACT: ContactSettings = {
  email: "hello@playsports.online",
  response_time: "We reply within 2 business days.",
};

// ============= Legal pages =============
export type LegalPage = { body: string };
export const LEGAL_KEYS = [
  "legal_privacy",
  "legal_terms",
  "legal_cookies",
  "legal_disclaimer",
  "legal_about",
] as const;
export type LegalKey = (typeof LEGAL_KEYS)[number];
export const DEFAULT_LEGAL: LegalPage = { body: "" };

// ============= IO =============
const TEN_MIN = 1000 * 60 * 10;

export async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return (data.value as T) ?? fallback;
}

export async function saveSetting<T>(key: string, value: T) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as never, updated_at: new Date().toISOString() });
  if (error) throw error;
}

function q<T>(key: string, fallback: T) {
  return {
    queryKey: ["site_settings", key] as const,
    staleTime: TEN_MIN,
    gcTime: TEN_MIN * 3,
    queryFn: () => fetchSetting<T>(key, fallback),
  };
}

export const useAdSenseSettings = () => useQuery(q("adsense", DEFAULT_ADSENSE));
export const useAnalyticsSettings = () => useQuery(q("analytics", DEFAULT_ANALYTICS));
export const useConsentSettings = () => useQuery(q("consent", DEFAULT_CONSENT));
export const useNewsletterSettings = () => useQuery(q("newsletter", DEFAULT_NEWSLETTER));
export const useIdentitySettings = () => useQuery(q("identity", DEFAULT_IDENTITY));
export const useContactSettings = () => useQuery(q("contact", DEFAULT_CONTACT));
export const useLegalPage = (key: LegalKey) => useQuery(q<LegalPage>(key, DEFAULT_LEGAL));

export const saveAdSenseSettings = (v: AdSenseSettings) => saveSetting("adsense", v);
