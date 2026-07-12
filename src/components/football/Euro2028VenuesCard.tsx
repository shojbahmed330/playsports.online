import { MapPin } from "lucide-react";
import { EURO_2028_VENUES } from "@/data/euro2028_venues";

/** Grid of the 10 Euro 2028 host stadiums with capacity and country. */
export function Euro2028VenuesCard() {
  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <MapPin className="size-4" /> Euro 2028 Host Venues
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EURO_2028_VENUES.map((v) => (
          <div
            key={v.stadium}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none" aria-hidden>{v.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">{v.stadium}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {v.city} · {v.country}
                </div>
              </div>
              <div className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                {v.capacity.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Final scheduled for Wembley Stadium, London.
      </p>
    </section>
  );
}
