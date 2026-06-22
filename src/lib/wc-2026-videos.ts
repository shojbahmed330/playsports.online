import { supabase, type WCMatch } from "@/lib/supabase";

/**
 * Normalize a match key so a Sofascore fixture (live) can be paired with
 * a wc_matches row (admin-saved video URL) for the same 2026 game.
 *
 * Uses team-pair (order-agnostic) only, ignoring round/date — admins set
 * the video once and it surfaces whether the match is currently group-stage
 * or has progressed to knockout.
 */
export function videoKey(home: string, away: string) {
  const pair = [home.toLowerCase().trim(), away.toLowerCase().trim()].sort();
  return pair.join("|");
}

export async function fetch2026VideoMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("wc_matches")
    .select("home_team,away_team,video_url")
    .eq("tournament_year", 2026)
    .not("video_url", "is", null);
  const out = new Map<string, string>();
  if (error || !data) return out;
  for (const r of data as Pick<WCMatch, "home_team" | "away_team" | "video_url">[]) {
    if (!r.video_url) continue;
    out.set(videoKey(r.home_team, r.away_team), r.video_url);
  }
  return out;
}
