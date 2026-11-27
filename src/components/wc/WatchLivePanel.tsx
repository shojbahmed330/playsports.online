import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Radio, ShieldCheck } from "lucide-react";
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
        className={`group relative w-full overflow-hidden rounded-2xl border border-live/40 bg-live text-live-foreground shadow-[var(--shadow-elevated)] transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${compact ? "min-h-11 px-4 py-3 text-caption" : "min-h-11 px-5 py-4 text-body"} font-bold`}
        aria-label="Open live stream"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[linear-gradient(110deg,transparent_30%,color-mix(in_oklch,var(--live-foreground)_25%,transparent)_50%,transparent_70%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite] motion-reduce:hidden"
        />
        <span className="relative flex items-center justify-center gap-3">
          <span className="relative grid place-items-center">
            <span className="absolute size-5 rounded-full bg-live-foreground/40 animate-ping motion-reduce:animate-none" aria-hidden="true" />
            <Radio className="relative size-5" aria-hidden="true" />
          </span>
          <span className="uppercase tracking-wide">Watch Live Now</span>
          <span className="hidden items-center gap-1 rounded-full bg-background/30 px-2 py-0.5 text-micro uppercase sm:inline-flex">
            Free · FIFA+
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl border-border bg-background p-0">
          <DialogHeader className="px-4 pb-2 pt-4">
            <DialogTitle className="flex items-center gap-2 text-body">
              <Radio className="size-4 text-live" aria-hidden="true" />
              Live Football — FIFA Official Stream
            </DialogTitle>
          </DialogHeader>

          {/* Embed FIFA's live YouTube channel feed. Shows whatever they
              are currently broadcasting; otherwise YouTube serves a fallback
              with related videos. 100% legal, no IPTV. */}
          <div className="relative aspect-video w-full bg-background">
            <iframe
              src={`https://www.youtube.com/embed/live_stream?channel=${FIFA_CHANNEL_ID}&autoplay=1`}
              title="FIFA Live"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="px-4 pb-2 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-caption text-muted-foreground">
                <ShieldCheck className="size-3.5 text-positive" aria-hidden="true" />
                Official broadcasters in <span aria-hidden="true">{meta?.flag}</span> {data.region}
              </div>
              <CountrySelector onChange={(c) => setCc(c)} />
            </div>
            <div className="grid max-h-[40vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {list.map((b) => (
                <a
                  key={`${b.name}-${b.url}`}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-caption transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    b.free
                      ? "border-positive/30 bg-positive/5 hover:bg-positive/10"
                      : "border-border bg-card/50 hover:bg-accent"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-base" aria-hidden="true">{b.logo ?? "📺"}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">{b.name}</span>
                      {b.note && <span className="block truncate text-micro text-muted-foreground">{b.note}</span>}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {b.free && (
                      <span className="text-micro uppercase text-positive">
                        Free
                      </span>
                    )}
                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-3 text-micro leading-relaxed text-muted-foreground">
              Stream is FIFA's official YouTube live feed. Region-specific links above are
              <span className="font-medium text-positive"> licensed broadcasters</span> only — no IPTV / pirate sources.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
