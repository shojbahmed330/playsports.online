import { useEffect, useRef } from "react";
import { useAdSenseSettings, type AdSenseSlotKey } from "@/lib/site-settings";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: AdSenseSlotKey;
  /** layout="in-article" gives a nicer in-content format on mobile */
  layout?: "default" | "in-article";
  className?: string;
  /** Minimum height (px) to reserve while the ad loads, to avoid CLS. */
  minHeight?: number;
};

/**
 * Reusable AdSense ad unit. Reads the publisher client + slot ID from
 * site_settings; renders nothing until both are configured, so it's safe to
 * drop into any page — no extra code needed for future routes.
 */
export function AdSlot({ slot, layout = "default", className, minHeight = 100 }: Props) {
  const { data } = useAdSenseSettings();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const client = data?.client;
  const slotId = data?.slots?.[slot];
  const enabled = !!data?.enabled && !!client && !!slotId;

  useEffect(() => {
    if (!enabled || pushedRef.current) return;
    if (typeof window === "undefined") return;
    // Wait one tick to ensure the loader script tag is in <head>.
    const t = window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // Loader not ready yet; will retry on next mount.
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [enabled, slot, slotId]);

  if (!enabled) return null;

  return (
    <div
      className={"ad-slot mx-auto w-full max-w-[970px] my-4 " + (className ?? "")}
      data-ad-slot={slot}
      aria-label="Advertisement"
    >
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={layout === "in-article" ? "fluid" : "auto"}
        {...(layout === "in-article" ? { "data-ad-layout": "in-article" } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
