import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Tv, Radio, ShieldCheck, X, Play } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { broadcastersFor, sortFreeFirst } from "@/lib/broadcasters";
import { detectCountry, COMMON_COUNTRIES } from "@/lib/geo";
import { CountrySelector } from "./CountrySelector";

// FIFA's official YouTube channel handle resolves to this channel ID — used by
// YouTube's `live_stream` embed which auto-plays whatever the channel is
// currently broadcasting live (and shows a placeholder when offline).
const FIFA_CHANNEL_ID = "UCpcTrCXblq78GZrTUTLWeBw";

/**
 * Single bold "Watch Live" button. Opens a dialog that embeds the FIFA
 * YouTube live stream (legal, free, AdSense-safe) and lists the official
 * regional broadcasters as deep-links. No third-party IPTV / pirate feeds.
 *
 * The export name is unchanged (`WatchLivePanel`) so existing imports keep
 * working — the panel is now a button + modal experience.
 */
export function WatchLivePanel({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [cc, setCc] = useState("US");
  useEffect(() => { setCc(detectCountry()); }, []);

  const data = useMemo(() => broadcastersFor(cc), [cc]);
  const meta = COMMON_COUNTRIES.find((c) => c.code === cc);
  const list = sortFreeFirst(data.broadcasters);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative w-full overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-bold shadow-[0_10px_40px_-12px_rgba(244,63,94,0.55)] hover:shadow-[0_14px_50px_-10px_rgba(244,63,94,0.75)] transition-all hover:-translate-y-0.5 active:translate-y-0 ${compact ? "py-3 px-4 text-sm" : "py-4 px-5 text-base"}`}
        aria-label="Open live stream"
      >
        <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]" />
        <span className="relative flex items-center justify-center gap-3">
          <span className="relative grid place-items-center">
            <span className="absolute size-5 rounded-full bg-white/40 animate-ping" />
            <Radio className="relative size-5" />
          </span>
          <span className="tracking-wide uppercase">Watch Live Now</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-black/30 rounded-full px-2 py-0.5">
            Free · FIFA+
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 bg-black border-gray-800">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Radio className="size-4 text-red-400" />
              Live Football — FIFA Official Stream
            </DialogTitle>
          </DialogHeader>

          {/* Embed FIFA's live YouTube channel feed. Shows whatever they
              are currently broadcasting; otherwise YouTube serves a fallback
              with related videos. 100% legal, no IPTV. */}
          <div className="relative bg-black aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/live_stream?channel=${FIFA_CHANNEL_ID}&autoplay=1`}
              title="FIFA Live"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="px-4 pb-2 pt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Official broadcasters in {meta?.flag} {data.region}
              </div>
              <CountrySelector onChange={(c) => setCc(c)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1">
              {list.map((b) => (
                <a
                  key={`${b.name}-${b.url}`}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                    b.free
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-gray-800 bg-gray-900/50 hover:bg-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{b.logo ?? "📺"}</span>
                    <span className="min-w-0">
                      <span className="block font-medium text-white truncate">{b.name}</span>
                      {b.note && <span className="block text-[10px] text-gray-500 truncate">{b.note}</span>}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {b.free && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        Free
                      </span>
                    )}
                    <ExternalLink className="size-3 text-gray-500 group-hover:text-white" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-gray-600 leading-relaxed">
              Stream is FIFA's official YouTube live feed. Region-specific links above are
              <span className="text-emerald-400 font-medium"> licensed broadcasters</span> only — no IPTV / pirate sources.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
