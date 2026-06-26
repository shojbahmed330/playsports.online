import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAnalyticsSettings } from "@/lib/site-settings";
import { useConsent } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function AnalyticsLoader() {
  const { data } = useAnalyticsSettings();
  const router = useRouter();
  const { choice } = useConsent();

  const ga4 = data?.ga4_measurement_id?.trim() ?? "";
  const gtm = data?.gtm_container_id?.trim() ?? "";
  const gsc = data?.gsc_verification?.trim() ?? "";
  const enabled = !!data?.enabled && choice.analytics;

  // GSC verification meta — independent of consent.
  useEffect(() => {
    if (typeof document === "undefined" || !gsc) return;
    const ID = "asl-gsc-verify";
    let el = document.getElementById(ID) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.id = ID;
      el.name = "google-site-verification";
      document.head.appendChild(el);
    }
    el.content = gsc;
  }, [gsc]);

  // GA4
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled || !/^G-[A-Z0-9]+$/i.test(ga4)) return;
    const ID = "asl-ga4-loader";
    if (document.getElementById(ID)) return;
    const s = document.createElement("script");
    s.id = ID;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4, { send_page_view: true });
  }, [enabled, ga4]);

  // GTM
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled || !/^GTM-[A-Z0-9]+$/i.test(gtm)) return;
    const ID = "asl-gtm-loader";
    if (document.getElementById(ID)) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.id = ID;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`;
    document.head.appendChild(s);
  }, [enabled, gtm]);

  // Page-view on route changes
  useEffect(() => {
    if (!enabled || !ga4) return;
    const unsub = router.subscribe("onResolved", ({ toLocation }) => {
      if (typeof window === "undefined" || !window.gtag) return;
      window.gtag("event", "page_view", {
        page_path: toLocation.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
    return unsub;
  }, [router, enabled, ga4]);

  return null;
}
