import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Youtube, Sparkles, Check, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getChannelHighlights, type YtVideo } from "@/lib/yt-highlights.functions";
import { getWc2026Fixtures } from "@/lib/wc2026.functions";
import { bulkSet2026Videos, fetch2026VideoMap, videoKey } from "@/lib/wc-2026-videos";

const DEFAULT_HANDLE = "@robi_axiata";

// fuzzy: normalise team names
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ALIAS: Record<string, string[]> = {
  "united states": ["usa", "u s a", "united states"],
  "south korea": ["korea republic", "korea", "south korea"],
  "ivory coast": ["cote d ivoire", "ivory coast"],
  "czech republic": ["czechia", "czech republic"],
};
const variants = (t: string) => {
  const n = norm(t);
  return new Set([n, ...(ALIAS[n] ?? [])]);
};

type Match = {
  video: YtVideo;
  fixtureKey: string;
  home: string;
  away: string;
  saved: boolean;
};

export function Wc2026HighlightsCard() {
  const queryClient = useQueryClient();
  const [handle, setHandle] = useState(DEFAULT_HANDLE);
  const [submitting, setSubmitting] = useState(false);

  const channelFn = useServerFn(getChannelHighlights);
  const fixturesFn = useServerFn(getWc2026Fixtures);

  const ytQ = useQuery({
    queryKey: ["yt_highlights", handle],
    queryFn: () => channelFn({ data: { handle } }),
    staleTime: 10 * 60_000,
  });
  const fxQ = useQuery({
    queryKey: ["wc2026_fixtures_for_admin"],
    queryFn: () => fixturesFn(),
    staleTime: 5 * 60_000,
  });
  const mapQ = useQuery({
    queryKey: ["wc2026", "video_map"],
    queryFn: () => fetch2026VideoMap(),
    staleTime: 60_000,
  });

  const matches: Match[] = useMemo(() => {
    const videos = ytQ.data?.videos ?? [];
    const fixtures = fxQ.data?.fixtures ?? [];
    const savedMap = mapQ.data ?? new Map<string, string>();
    if (!videos.length || !fixtures.length) return [];

    const out: Match[] = [];
    for (const v of videos) {
      const t = norm(v.title);
      const f = fixtures.find((fx) => {
        const h = variants(fx.home.name);
        const a = variants(fx.away.name);
        const hHit = [...h].some((x) => t.includes(x));
        const aHit = [...a].some((x) => t.includes(x));
        return hHit && aHit;
      });
      if (!f) continue;
      const k = videoKey(f.home.name, f.away.name);
      out.push({
        video: v,
        fixtureKey: k,
        home: f.home.name,
        away: f.away.name,
        saved: savedMap.get(k) === v.url,
      });
    }
    return out;
  }, [ytQ.data, fxQ.data, mapQ.data]);

  const unsaved = matches.filter((m) => !m.saved);

  const applyAll = async (overwrite: boolean) => {
    setSubmitting(true);
    try {
      const targets = overwrite ? matches : unsaved;
      if (!targets.length) {
        toast.info("Nothing to apply");
        return;
      }
      const res = await bulkSet2026Videos(
        targets.map((m) => ({ home: m.home, away: m.away, url: m.video.url })),
      );
      toast.success(`Imported ${res.added} highlights`, {
        description: res.skipped ? `${res.skipped} already had a video` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_wc_matches", 2026] });
      queryClient.invalidateQueries({ queryKey: ["wc2026", "video_map"] });
      queryClient.invalidateQueries({ queryKey: ["wc_matches", 2026] });
    } catch (e) {
      toast.error("Import failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-red-500/15 grid place-items-center ring-1 ring-red-500/30 shrink-0">
          <Youtube className="size-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">2026 highlights — auto-import from YouTube</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Pulls the latest uploads from a channel's public feed and fuzzy-matches titles to
            2026 fixtures. Default: Robi Axiata.
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.trim() || DEFAULT_HANDLE)}
          placeholder="@channel-handle"
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-red-400 focus:outline-none font-mono"
        />
        <a
          href={`https://www.youtube.com/${handle.startsWith("@") ? handle : "@" + handle}`}
          target="_blank"
          rel="noreferrer"
          className="size-9 grid place-items-center rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800"
          title="Open channel"
        >
          <ExternalLink className="size-4 text-muted-foreground" />
        </a>
        <button
          onClick={() => ytQ.refetch()}
          disabled={ytQ.isFetching}
          className="px-3 py-2 text-xs rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 inline-flex items-center gap-1.5 disabled:opacity-40"
        >
          {ytQ.isFetching ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </button>
      </div>

      {ytQ.data?.error && (
        <div className="mt-3 text-xs text-red-400">YouTube fetch failed: {ytQ.data.error}</div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Videos found" value={ytQ.data?.videos.length ?? 0} />
        <Stat label="Auto-matched" value={matches.length} tone="good" />
        <Stat label="To import" value={unsaved.length} tone="warn" />
      </div>

      {ytQ.isLoading || fxQ.isLoading ? (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <Loader2 className="size-4 inline animate-spin mr-1.5" /> Loading…
        </div>
      ) : matches.length > 0 ? (
        <>
          <div className="mt-3 max-h-72 overflow-auto divide-y divide-border rounded-lg border border-border bg-background/40">
            {matches.map((m) => (
              <div key={m.video.videoId} className="flex items-center gap-3 px-3 py-2 text-xs">
                <img loading="lazy" decoding="async" src={m.video.thumbnail} alt="" className="w-14 h-9 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{m.video.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    → <span className="text-emerald-400">{m.home}</span> vs <span className="text-emerald-400">{m.away}</span>
                  </div>
                </div>
                {m.saved ? (
                  <span className="text-[10px] text-emerald-400 inline-flex items-center gap-1 shrink-0">
                    <Check className="size-3" /> saved
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 shrink-0">new</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => applyAll(true)}
              disabled={submitting || !matches.length}
              className="px-3 py-2 text-xs rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40"
            >
              Overwrite all
            </button>
            <button
              onClick={() => applyAll(false)}
              disabled={submitting || !unsaved.length}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-400 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              Import {unsaved.length || ""} missing
            </button>
          </div>
        </>
      ) : ytQ.data ? (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          No videos matched current 2026 fixtures yet. Highlights will appear here once the
          channel uploads match recaps with team names in the title.
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "good" | "warn" }) {
  const c = tone === "good"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : tone === "warn"
    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-border bg-card/60 text-foreground";
  return (
    <div className={`rounded-lg border px-3 py-2 ${c}`}>
      <div className="text-[9px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}
