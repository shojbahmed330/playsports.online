import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Wind, Thermometer, Clock } from "lucide-react";
import { getMatchWeather } from "@/lib/weather.functions";
import { formatLocalTime } from "@/lib/time";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

export function VenueCard({ fx }: { fx: Wc2026Fixture }) {
  const fn = useServerFn(getMatchWeather);
  const q = useQuery({
    queryKey: ["weather", fx.city ?? ""],
    queryFn: () => fn({ data: { city: fx.city ?? "" } }),
    staleTime: 30 * 60_000,
    enabled: !!fx.city && fx.status !== "finished",
  });
  const w = q.data;
  const kickoff = new Date(fx.startTs * 1000);
  const local = formatLocalTime(kickoff.getTime());
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!fx.venue && !fx.city) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="size-4 text-sky-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Venue & kickoff</h2>
      </div>
      <div className="space-y-2 text-sm">
        {fx.venue && (
          <div className="text-white font-bold">{fx.venue}</div>
        )}
        {fx.city && (
          <div className="text-gray-400 text-xs">{fx.city}</div>
        )}
        <div className="inline-flex items-center gap-2 text-xs text-gray-300 pt-1">
          <Clock className="size-3.5 text-gray-500" />
          <span className="font-semibold">{local}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500 truncate">{tz}</span>
        </div>
        {w && (
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-black/40 px-3 py-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-200">
              <Thermometer className="size-3.5 text-amber-300" />
              <span className="font-bold tabular-nums">{w.temperatureC != null ? `${Math.round(w.temperatureC)}°C` : "—"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-200">
              <Wind className="size-3.5 text-sky-300" />
              <span className="font-bold tabular-nums">{w.windKph != null ? `${w.windKph} km/h` : "—"}</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 ml-auto truncate">{w.description}</span>
          </div>
        )}
      </div>
    </section>
  );
}
