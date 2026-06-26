import { Sparkles, ExternalLink } from "lucide-react";
import { useSponsoredSlots, trackSponsoredClick } from "@/lib/affiliates";

type Props = {
  slotType?: "banner" | "match" | "team" | "league";
  sport?: string;
  refId?: string;
  className?: string;
};

/** Homepage / sport-hub sponsored banner. Renders nothing if no active slot. */
export function SponsoredHero({ slotType = "banner", sport, refId, className }: Props) {
  const { data } = useSponsoredSlots(slotType, { sport, ref_id: refId, limit: 1 });
  const slot = data?.[0];
  if (!slot) return null;

  return (
    <a
      href={slot.target_url}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={() => trackSponsoredClick(slot.id)}
      className={
        "group block rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-amber-500/5 to-gold/10 p-4 hover:border-gold/60 transition-all " +
        (className ?? "")
      }
      aria-label={`Sponsored: ${slot.title}`}
    >
      <div className="flex items-center gap-4">
        {slot.sponsor_logo_url ? (
          <img
            src={slot.sponsor_logo_url}
            alt={slot.sponsor_name}
            loading="lazy"
            className="size-12 rounded-lg object-contain bg-background/60 p-1.5 shrink-0"
          />
        ) : (
          <div className="size-12 rounded-lg bg-gold/20 grid place-items-center shrink-0">
            <Sparkles className="size-5 text-gold" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">
            Sponsored · {slot.sponsor_name}
          </div>
          <div className="font-bold text-base sm:text-lg leading-tight truncate">
            {slot.title}
          </div>
          {slot.description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {slot.description}
            </div>
          )}
        </div>
        <ExternalLink className="size-4 text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}
