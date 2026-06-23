import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Tv, Sparkles, ShieldCheck } from "lucide-react";
import { broadcastersFor, sortFreeFirst } from "@/lib/broadcasters";
import { detectCountry, COMMON_COUNTRIES } from "@/lib/geo";
import { CountrySelector } from "./CountrySelector";

/** "Where to Watch" panel. Pure UI — no piracy / IPTV. */
export function WatchLivePanel({
  compact = false,
}: { compact?: boolean }) {
  const [cc, setCc] = useState("US");
  useEffect(() => { setCc(detectCountry()); }, []);

  const data = useMemo(() => broadcastersFor(cc), [cc]);
  const meta = COMMON_COUNTRIES.find((c) => c.code === cc);
  const list = sortFreeFirst(data.broadcasters);

  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black/60 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-700/10 grid place-items-center ring-1 ring-emerald-500/30">
            <Tv className="size-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Watch Free / Live</div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" />
              Official broadcasters in {meta?.flag} {data.region}
            </div>
          </div>
        </div>
        <CountrySelector onChange={(c) => setCc(c)} />
      </div>

      <div className="space-y-2">
        {list.map((b) => (
          <a
            key={`${b.name}-${b.url}`}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              b.free
                ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-gray-800 bg-gray-900/40 hover:bg-gray-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">{b.logo ?? "📺"}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{b.name}</div>
                {b.note && (
                  <div className="text-[10.5px] text-gray-500 truncate">{b.note}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {b.free && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="size-2.5" /> Free
                </span>
              )}
              <ExternalLink className="size-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-3 text-[10px] text-gray-600 leading-relaxed">
        We only list <span className="text-emerald-400 font-medium">licensed</span> broadcasters and FIFA's
        own free streams. No IPTV or pirate links — that protects you and keeps the
        platform compliant.
      </div>
    </div>
  );
}
