import type { CricketMatch } from "@/lib/cricket.functions";
import { MapPin, Tv, Info, Calendar } from "lucide-react";
import { formatLocalTime, relativeDay } from "@/lib/time";

export function InfoTab({ match }: { match: CricketMatch }) {
  const rows: { label: string; value: string; icon?: React.ElementType }[] = [
    { label: "Series", value: match.leagueName || match.leagueAbbr || "â€”" },
    { label: "Format", value: match.format || "â€”" },
    { label: "Match", value: match.description || "â€”" },
    {
      label: "Start",
      value: `${relativeDay(match.startTs)} Â· ${formatLocalTime(match.startTs)}`,
      icon: Calendar,
    },
    {
      label: "Venue",
      value: [match.venue, match.city, match.country].filter(Boolean).join(", ") || "â€”",
      icon: MapPin,
    },
    ...(match.note ? [{ label: "Note", value: match.note, icon: Info }] : []),
    ...(match.broadcast ? [{ label: "Broadcast", value: match.broadcast, icon: Tv }] : []),
  ];
  const mapsHref = match.venue
    ? `https://www.google.com/maps/search/${encodeURIComponent([match.venue, match.city].filter(Boolean).join(", "))}`
    : null;

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <dl className="divide-y divide-border">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-4 py-3 text-sm"
            >
              <dt className="text-[11px] uppercase tracking-wider text-foreground font-semibold pt-0.5">
                {r.label}
              </dt>
              <dd className="text-foreground min-w-0 flex items-start gap-2">
                {Icon && <Icon className="size-4 shrink-0 mt-0.5 text-[var(--color-accent-cricket)]" />}
                <span className="min-w-0 break-words">{r.value}</span>
              </dd>
            </div>
          );
        })}
      </dl>
      {mapsHref && (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[var(--color-accent-cricket)]/10 hover:bg-[var(--color-accent-cricket)]/15 text-center text-[var(--color-accent-cricket)] text-sm font-semibold py-3 border-t border-[var(--color-accent-cricket)]/20"
        >
          View venue on Google Maps
        </a>
      )}
    </div>
  );
}
