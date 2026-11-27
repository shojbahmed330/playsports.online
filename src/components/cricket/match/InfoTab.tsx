import type { CricketMatch } from "@/lib/cricket.functions";
import { MapPin, Tv, Info, Calendar } from "lucide-react";
import { formatLocalTime, relativeDay } from "@/lib/time";

export function InfoTab({ match }: { match: CricketMatch }) {
  const rows: { label: string; value: string; icon?: React.ElementType }[] = [
    { label: "Series", value: match.leagueName || match.leagueAbbr || "—" },
    { label: "Format", value: match.format || "—" },
    { label: "Match", value: match.description || "—" },
    {
      label: "Start",
      value: `${relativeDay(match.startTs)} · ${formatLocalTime(match.startTs)}`,
      icon: Calendar,
    },
    {
      label: "Venue",
      value: [match.venue, match.city, match.country].filter(Boolean).join(", ") || "—",
      icon: MapPin,
    },
    ...(match.note ? [{ label: "Note", value: match.note, icon: Info }] : []),
    ...(match.broadcast ? [{ label: "Broadcast", value: match.broadcast, icon: Tv }] : []),
  ];
  const mapsHref = match.venue
    ? `https://www.google.com/maps/search/${encodeURIComponent([match.venue, match.city].filter(Boolean).join(", "))}`
    : null;

  return (
    <div className="rounded-2xl border border-gray-800 overflow-hidden">
      <dl className="divide-y divide-gray-800">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 px-4 py-3 text-sm"
            >
              <dt className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold pt-0.5">
                {r.label}
              </dt>
              <dd className="text-gray-100 min-w-0 flex items-start gap-2">
                {Icon && <Icon className="size-4 shrink-0 mt-0.5 text-emerald-300" />}
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
          className="block bg-emerald-500/10 hover:bg-emerald-500/15 text-center text-emerald-200 text-sm font-semibold py-3 border-t border-emerald-500/20"
        >
          View venue on Google Maps
        </a>
      )}
    </div>
  );
}
