import { useEffect } from "react";
import { useAdSenseSettings } from "@/lib/site-settings";
import { useConsent } from "@/lib/consent";

/**
 * Injects the Google AdSense loader script (pagead) once when AdSense is
 * enabled in site_settings AND the user has consented to advertising
 * (or hasn't decided yet — Google's own non-personalized fallback applies).
 */
export function AdSenseLoader() {
  const { data } = useAdSenseSettings();
  const { choice } = useConsent();
  const configured = data?.enabled && /^ca-pub-\d+$/.test(data?.client ?? "");
  // Block ads outright only when the user explicitly rejected advertising.
  const blocked = choice.decided && !choice.advertising;
  const enabled = configured && !blocked;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled || !data) return;

    const SCRIPT_ID = "adsense-loader-script";
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      // Already loaded — if client changed, the easiest correct thing is a hard reload.
      if (existing.dataset.client !== data.client) window.location.reload();
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.client}`;
    s.dataset.client = data.client;
    document.head.appendChild(s);

    if (data.auto_ads) {
      const init = document.createElement("script");
      init.id = "adsense-auto-init";
      init.text = `(adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: "${data.client}", enable_page_level_ads: true });`;
      document.head.appendChild(init);
    }
  }, [enabled, data]);

  return null;
}
