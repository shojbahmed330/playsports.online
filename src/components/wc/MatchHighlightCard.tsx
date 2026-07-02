import { useQuery } from "@tanstack/react-query";
import { Youtube } from "lucide-react";
import { fetch2026VideoMap, videoKey } from "@/lib/wc-2026-videos";
import { VideoPlayer } from "@/components/wc/VideoPlayer";

export function MatchHighlightCard({ home, away }: { home: string; away: string }) {
  const q = useQuery({
    queryKey: ["wc2026", "video-map"],
    queryFn: () => fetch2026VideoMap(),
    staleTime: 5 * 60_000,
  });

  if (!q.data) return null;
  const url = q.data.get(videoKey(home, away)) ?? null;
  if (!url) return null;

  return (
    <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.06] to-black p-4">
      <div className="flex items-center gap-2 mb-3">
        <Youtube className="size-4 text-red-400" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
          Match Highlights
        </h2>
      </div>
      <VideoPlayer videoUrl={url} matchTitle={`${home} v ${away}`} />
    </section>
  );
}
