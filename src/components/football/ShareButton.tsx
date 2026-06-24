import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const abs = url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + url : url);
    try {
      const nav = typeof navigator !== "undefined" ? navigator : null;
      if (nav && "share" in nav && typeof nav.share === "function") {
        await nav.share({ title, url: abs });
        return;
      }
      if (nav?.clipboard) {
        await nav.clipboard.writeText(abs);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch { /* user cancelled */ }
  };
  return (
    <button
      onClick={onShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      title="Share match"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
