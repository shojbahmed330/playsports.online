import { useEffect } from "react";
import { useAdSenseSettings } from "@/lib/site-settings";

/**
 * Injects the Google AdSense loader script (pagead) once when AdSense is
 * enabled in site_settings. Mount this once in the root layout.
 */
export function AdSenseLoader() {
  const { data } = useAdSenseSettings();
  const enabled = data?.enabled && /^ca-pub-\d+$/.test(data?.client ?? "");

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
