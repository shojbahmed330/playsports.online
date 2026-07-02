import { ExternalLink, Play } from "lucide-react";

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

function isDirectMedia(url: string): boolean {
  try {
    const u = new URL(url);
    return /\.(mp4|webm|ogg|m3u8)$/i.test(u.pathname);
  } catch {
    return /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(url);
  }
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
  if (isDirectMedia(videoUrl)) {
    return (
      <video src={videoUrl} controls className="w-full rounded-xl border border-gray-800" />
    );
  }

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-6 text-center transition-colors hover:bg-amber-500/[0.10]"
    >
      <Play className="size-12 text-amber-300 transition-transform group-hover:scale-110" />
      <div className="mt-3 text-sm font-bold text-amber-200">Open official highlights</div>
      <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-300/70">
        Watch on the broadcaster site <ExternalLink className="size-3" />
      </div>
    </a>
  );
}
