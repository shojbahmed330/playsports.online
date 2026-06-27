import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";
import {
  useAdSenseSettings,
  useAnalyticsSettings,
  useNewsletterSettings,
} from "@/lib/site-settings";
import { useAdminAffiliates, useAdminSponsored } from "@/lib/affiliates";
import { supabase } from "@/lib/supabase";
import type { AdminSection } from "./AdminSidebar";

type Status = "ok" | "warn" | "neutral";
type Pill = { id: string; label: string; status: Status; hint: string };

/**
 * Compact, at-a-glance status strip rendered above the cards in each section.
 * Tells the admin which cards are configured and which need attention without
 * having to scroll through long forms.
 */
export function SectionStatusStrip({
  section,
  matchStats,
}: {
  section: AdminSection;
  matchStats?: { total: number; withVideo: number; missing: number };
}) {
  const ad = useAdSenseSettings();
  const an = useAnalyticsSettings();
  const nl = useNewsletterSettings();
  const aff = useAdminAffiliates();
  const spons = useAdminSponsored();

  const subsCount = useQuery({
    queryKey: ["admin", "subs_count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const pills: Pill[] = useMemo(() => {
    switch (section) {
      case "monetize":
        return [
          {
            id: "adsense",
            label: "AdSense",
            status: ad.data?.enabled && ad.data?.client ? "ok" : "warn",
            hint: ad.data?.enabled ? "Publisher ID set" : "Add publisher ID to start earning",
          },
          {
            id: "affiliates",
            label: "Affiliates",
            status: (aff.data?.length ?? 0) > 0 ? "ok" : "warn",
            hint: `${aff.data?.length ?? 0} active link${(aff.data?.length ?? 0) === 1 ? "" : "s"}`,
          },
          {
            id: "sponsored",
            label: "Sponsored",
            status: (spons.data?.length ?? 0) > 0 ? "ok" : "neutral",
            hint: `${spons.data?.length ?? 0} slot${(spons.data?.length ?? 0) === 1 ? "" : "s"}`,
          },
          {
            id: "memberships",
            label: "Memberships",
            status: "neutral",
            hint: "Optional supporter tiers",
          },
        ];
      case "audience":
        return [
          {
            id: "newsletter",
            label: "Newsletter",
            status: nl.data?.enabled ? "ok" : "warn",
            hint: nl.data?.enabled ? "Signups enabled" : "Disabled — enable in Settings",
          },
          {
            id: "subscribers",
            label: "Subscribers",
            status: (subsCount.data ?? 0) > 0 ? "ok" : "neutral",
            hint: `${subsCount.data ?? 0} total`,
          },
        ];
      case "content":
        return [
          {
            id: "seed",
            label: "Video seed",
            status: "neutral",
            hint: "On-demand bulk import",
          },
          {
            id: "highlights",
            label: "WC 2026 highlights",
            status: "neutral",
            hint: "Curate via Robi Axiata feed",
          },
        ];
      case "matches":
        if (!matchStats) return [];
        return [
          {
            id: "videos",
            label: "Match videos",
            status: matchStats.missing === 0 && matchStats.total > 0 ? "ok" : "warn",
            hint: `${matchStats.withVideo}/${matchStats.total} mapped, ${matchStats.missing} missing`,
          },
        ];
      case "settings":
        return [
          {
            id: "ga4",
            label: "Analytics (GA4)",
            status: an.data?.enabled && an.data?.ga4_measurement_id ? "ok" : "warn",
            hint: an.data?.ga4_measurement_id ? "Measurement ID set" : "Add GA4 ID to track traffic",
          },
        ];
      default:
        return [];
    }
  }, [section, ad.data, an.data, nl.data, aff.data, spons.data, subsCount.data, matchStats]);

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p) => (
        <span
          key={p.id}
          title={p.hint}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
            p.status === "ok"
              ? "bg-emerald-500/10 ring-emerald-500/30 text-emerald-300"
              : p.status === "warn"
              ? "bg-amber-500/10 ring-amber-500/30 text-amber-300"
              : "bg-muted/40 ring-border text-muted-foreground"
          }`}
        >
          {p.status === "ok" && <CheckCircle2 className="size-3" />}
          {p.status === "warn" && <AlertCircle className="size-3" />}
          {p.status === "neutral" && <MinusCircle className="size-3" />}
          <span>{p.label}</span>
          <span className="opacity-70 font-normal hidden sm:inline">· {p.hint}</span>
        </span>
      ))}
    </div>
  );
}
