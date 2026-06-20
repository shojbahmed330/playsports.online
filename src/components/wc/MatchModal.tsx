import { X, MapPin, CalendarDays, Pencil, Check, Loader2 } from "lucide-react";
import { supabase, type WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VideoPlayer, detectVideoType } from "./VideoPlayer";

function winnerSide(m: WCMatch): "home" | "away" | "draw" {
  if (m.home_score_pen != null && m.away_score_pen != null) {
    return m.home_score_pen > m.away_score_pen ? "home" : "away";
  }
  const h = m.home_score ?? 0, a = m.away_score ?? 0;
  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

export function MatchModal({ match, onClose }: { match: WCMatch | null; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!match) return;
    setEditing(false);
    setInput(match.video_url ?? "");
    setLocalUrl(match.video_url ?? null);
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [match, onClose]);

  if (!match) return null;
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const win = winnerSide(match);
  const date = match.match_date
    ? new Date(match.match_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : null;
  // Bundled (group) matches use synthetic ids >= 1_000_000 — those rows don't exist in DB.
  const isBundled = match.id >= 1_000_000;

  const save = async () => {
    const url = input.trim() || null;
    setSaving(true);
    const { error } = await supabase
      .from("wc_matches")
      .update({ video_url: url })
      .eq("id", match.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save video URL", { description: error.message });
      return;
    }
    setLocalUrl(url);
    setEditing(false);
    toast.success("Video URL saved!");
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-[10px] uppercase tracking-widest rounded-full px-3 py-1">
            {match.round} · {match.tournament_year}
          </span>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-2">
          {/* Score row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">{flagOf(match.home_team)}</span>
              <span className={`truncate text-base sm:text-lg font-semibold ${win === "home" ? "text-amber-400" : "text-gray-300"}`}>
                {match.home_team}
              </span>
            </div>
            <div className="text-5xl font-black text-amber-400 tabular-nums whitespace-nowrap">
              {match.home_score ?? "-"} <span className="text-gray-600">-</span> {match.away_score ?? "-"}
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
              <span className={`truncate text-base sm:text-lg font-semibold text-right ${win === "away" ? "text-amber-400" : "text-gray-300"}`}>
                {match.away_team}
              </span>
              <span className="text-2xl shrink-0">{flagOf(match.away_team)}</span>
            </div>
          </div>

          {hasPen && (
            <div className="text-center text-sm text-amber-600 mt-2">
              ({match.home_score_pen} - {match.away_score_pen} on penalties)
            </div>
          )}

          {/* Info rows */}
          <div className="mt-5 flex flex-col gap-1.5 text-sm text-gray-400">
            {date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-gray-500" />
                <span>{date}</span>
              </div>
            )}
            {(match.stadium || match.city) && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gray-500" />
                <span>{[match.stadium, match.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="px-6 pt-4">
          <VideoPlayer videoUrl={localUrl} matchTitle={`${match.home_team} vs ${match.away_team}`} />
        </div>

        {/* Admin URL editor */}
        <div className="px-6 pt-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              disabled={isBundled}
              title={isBundled ? "This match isn't in the database yet" : ""}
              className="text-xs text-gray-500 hover:text-amber-400 inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Pencil className="size-3.5" />
              {localUrl ? "Edit video URL" : "Add video URL"}
              {isBundled && <span className="text-gray-600">(unavailable)</span>}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-900 border border-gray-800 focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={save}
                disabled={saving}
                className="px-3 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setInput(localUrl ?? ""); }}
                className="px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
          {input && editing && (
            <div className="text-[10px] text-gray-600 mt-1.5">
              Detected: {detectVideoType(input) ?? "unknown"}
            </div>
          )}
        </div>

        <div className="p-6 pt-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2.5 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
