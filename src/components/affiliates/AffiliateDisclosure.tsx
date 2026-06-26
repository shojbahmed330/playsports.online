import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSetting } from "@/lib/site-settings";
import { DEFAULT_DISCLOSURE, type AffiliateDisclosure as Disc } from "@/lib/affiliates";

export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  const { data } = useQuery({
    queryKey: ["site_settings", "affiliate_disclosure"],
    staleTime: 1000 * 60 * 10,
    queryFn: () => fetchSetting<Disc>("affiliate_disclosure", DEFAULT_DISCLOSURE),
  });
  if (!data?.enabled || !data.text) return null;

  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground " +
        (compact ? "px-3 py-2" : "px-4 py-3")
      }
      role="note"
    >
      <Info className="size-3.5 shrink-0 mt-0.5 text-gold/80" />
      <p className="leading-snug">{data.text}</p>
    </div>
  );
}
