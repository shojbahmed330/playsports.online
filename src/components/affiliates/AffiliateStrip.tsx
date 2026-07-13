import { ExternalLink, ShoppingBag, Trophy, Dices, Tag, ShieldAlert } from "lucide-react";
import {
  useAffiliateLinks,
  trackAffiliateClick,
  type AffiliateCtx,
  type Network,
} from "@/lib/affiliates";
import { AgeGateDialog, useAgeGate } from "./AgeGate";

const NETWORK_ICON: Record<Network, typeof ShoppingBag> = {
  amazon: ShoppingBag,
  fanatics: Trophy,
  sportsbook: Dices,
  generic: Tag,
};

const NETWORK_LABEL: Record<Network, string> = {
  amazon: "Amazon",
  fanatics: "Fanatics",
  sportsbook: "Sportsbook",
  generic: "Partner",
};

type Props = AffiliateCtx & {
  heading?: string;
  className?: string;
};

/**
 * Auto-injects matching affiliate offers. Renders nothing if no offers match.
 * Sportsbook tiles only show after age verification (21+).
 */
export function AffiliateStrip({ heading = "Shop the matchup", className, ...ctx }: Props) {
  const { data } = useAffiliateLinks(ctx);
  const hasSportsbook = !!data?.some((l) => l.network === "sportsbook");
  const { verified, open, confirm, decline } = useAgeGate(hasSportsbook);

  if (!data || data.length === 0) return null;

  const visible = verified ? data : data.filter((l) => l.network !== "sportsbook");
  if (visible.length === 0 && !hasSportsbook) return null;

  return (
    <>
      <AgeGateDialog open={open} onConfirm={confirm} onDecline={decline} />
      <section
        className={"rounded-2xl border border-border bg-card/40 p-4 my-6 " + (className ?? "")}
        aria-label="Sponsored partner offers"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
            {heading}
          </h3>
          <span className="text-[10px] text-muted-foreground uppercase">
            Affiliate · we may earn
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="text-xs text-muted-foreground p-3 text-center">
            Sportsbook offers hidden — verify age above to view.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((link) => {
              const Icon = NETWORK_ICON[link.network];
              const isBook = link.network === "sportsbook";
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  onClick={() => trackAffiliateClick(link.id)}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-background/60 hover:bg-background hover:border-gold/50 transition-all p-3"
                >
                  <div className="flex items-center gap-3">
                    {link.image_url ? (
                      <img
                        src={link.image_url}
                        alt=""
                        loading="lazy"
                        className="size-14 rounded-lg object-cover bg-muted"
                       decoding="async" />
                    ) : (
                      <div className="size-14 rounded-lg bg-muted grid place-items-center">
                        <Icon className="size-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Icon className="size-3" />
                        {NETWORK_LABEL[link.network]}
                      </div>
                      <div className="font-semibold text-sm leading-tight truncate">
                        {link.title}
                      </div>
                      {link.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {link.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gold inline-flex items-center gap-1 shrink-0">
                      {link.cta_label}
                      <ExternalLink className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  {isBook && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 border-t border-amber-500/20 pt-1.5">
                      <ShieldAlert className="size-3 shrink-0" />
                      <span>21+ · Gamble responsibly · 1-800-GAMBLER · T&Cs apply</span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
