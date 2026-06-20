import { Play } from "lucide-react";

export type VideoType = "youtube" | "vimeo" | "direct" | null;

export function detectVideoType(url: string | null | undefined): VideoType {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  return "direct";
}

function youtubeId(url: string): string | null {
  // Handles youtu.be/<id>, watch?v=<id>, /embed/<id>, /shorts/<id>
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace(/^\//, "").split(/[/?#]/)[0] || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/(embed|shorts)\/([^/?#]+)/);
    if (m) return m[2];
  } catch { /* ignore */ }
  return null;
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/(\d+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

export function VideoPlayer({
  videoUrl, matchTitle,
}: { videoUrl: string | null; matchTitle: string }) {
  const type = detectVideoType(videoUrl);

  if (!videoUrl || !type) {
    return (
      <div className="h-[200px] rounded-xl bg-gray-800/50 border-2 border-dashed border-gray-700 hover:border-amber-500/30 transition-colors grid place-items-center">
        <div className="text-center">
          <Play className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="text-sm text-gray-500 mt-2">Match Footage</div>
          <div className="text-xs text-gray-600">Video will be available soon</div>
        </div>
      </div>
    );
  }

  if (type === "youtube") {
    const id = youtubeId(videoUrl);
    if (!id) return null;
    return (
      <iframe
        className="w-full rounded-xl border border-gray-800"
        height={315}
        src={`https://www.youtube.com/embed/${id}`}
        title={matchTitle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (type === "vimeo") {
    const id = vimeoId(videoUrl);
    if (!id) return null;
    return (
      <iframe
        className="w-full rounded-xl border border-gray-800"
        height={315}
        src={`https://player.vimeo.com/video/${id}`}
        title={matchTitle}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video src={videoUrl} controls className="w-full rounded-xl border border-gray-800" />
  );
}
