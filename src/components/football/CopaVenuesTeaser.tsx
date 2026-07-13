import { MapPin, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

/** Placeholder venue teaser until Copa 2028 host is confirmed. */
export function CopaVenuesTeaser() {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        <MapPin className="size-3.5" /> Host cities · Copa 2028
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 p-2">
            <MapPin className="size-5 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black">Host: TBC</div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              CONMEBOL will confirm the 2028 host nation and venue list closer to the qualifying window.
              In the meantime, revisit the 14 US host cities that staged Copa América 2024 — from
              Mercedes-Benz Stadium in Atlanta to the Hard Rock Stadium final in Miami Gardens.
            </p>
            <Link
              to="/football/$comp/history/$year"
              params={{ comp: "copa-america", year: "2024" }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest hover:border-white/30 transition"
            >
              Explore 2024 venues <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
