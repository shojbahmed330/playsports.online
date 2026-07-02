import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Youtube, ExternalLink } from "lucide-react";
import { fetch2026VideoMap, videoKey } from "@/lib/wc-2026-videos";
import { VideoPlayer } from "@/components/wc/VideoPlayer";
import { getChannelHighlights, type YtVideo } from "@/lib/yt-highlights.functions";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ALIAS: Record<string, string[]> = {
  "united states": ["usa", "u s a", "united states", "us"],
  "south korea": ["korea republic", "korea", "south korea"],
  "korea republic": ["korea republic", "korea", "south korea"],
  "ivory coast": ["cote d ivoire", "ivory coast", "cote divoire"],
  "cote d'ivoire": ["cote d ivoire", "ivory coast", "cote divoire"],
  "czech republic": ["czechia", "czech republic"],
  czechia: ["czechia", "czech republic"],
  turkiye: ["turkiye", "turkey", "turkiye"],
  türkiye: ["turkiye", "turkey"],
  "cabo verde": ["cabo verde", "cape verde"],
  "cape verde": ["cabo verde", "cape verde"],
  "bosnia & herzegovina": ["bosnia", "herzegovina", "bosnia and herzegovina", "bih"],
  "bosnia and herzegovina": ["bosnia", "herzegovina", "bosnia and herzegovina", "bih"],
  "dr congo": ["dr congo", "congo dr", "democratic republic of congo", "cod"],
  "congo dr": ["dr congo", "congo dr", "democratic republic of congo", "cod"],
};
const variants = (t: string): Set<string> => {
  const n = norm(t);
  const set = new Set<string>([n]);
  (ALIAS[n] ?? []).forEach((v) => set.add(v));
  return set;
};

function matchVideo(videos: YtVideo[], home: string, away: string): YtVideo | null {
  const h = variants(home);
  const a = variants(away);
  for (const v of videos) {
    const t = norm(v.title);
    const hHit = [...h].some((x) => x.length > 1 && t.includes(x));
    const aHit = [...a].some((x) => x.length > 1 && t.includes(x));
    if (hHit && aHit) return v;
  }
  return null;
}

export function MatchHighlightCard({
  home,
  away,
  videoUrl = null,
}: {
  home: string;
  away: string;
  videoUrl?: string | null;
}) {
  const mapQ = useQuery({
    queryKey: ["wc2026", "video-map"],
    queryFn: () => fetch2026VideoMap(),
    staleTime: 5 * 60_000,
  });

  const stored = videoUrl ?? mapQ.data?.get(videoKey(home, away)) ?? null;

  // Fallback: scan @robi_axiata YouTube channel and fuzzy-match on team names.
  const channelFn = useServerFn(getChannelHighlights);
  const ytQ = useQuery({
    queryKey: ["yt_highlights", "@robi_axiata"],
    queryFn: () => channelFn({ data: { handle: "@robi_axiata" } }),
    staleTime: 10 * 60_000,
    enabled: mapQ.isFetched && !stored,
  });

  const scanned = useMemo(
    () => (stored || !ytQ.data?.videos ? null : matchVideo(ytQ.data.videos, home, away)),
    [stored, ytQ.data, home, away],
  );

  const url = stored ?? scanned?.url ?? null;
  if (!url) return null;

  return (
    <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.06] to-black p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Youtube className="size-4 text-red-400" />
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
            Match Highlights
          </h2>
        </div>
        {scanned && !stored && (
          <a
            href={scanned.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-widest text-red-300/70 hover:text-red-200 inline-flex items-center gap-1"
            title="Open on YouTube"
          >
            via @robi_axiata <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <VideoPlayer videoUrl={url} matchTitle={`${home} v ${away}`} />
    </section>
  );
}
