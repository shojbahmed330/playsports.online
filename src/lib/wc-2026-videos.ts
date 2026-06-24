import { supabase, type WCMatch } from "@/lib/supabase";

/**
 * 2026 video links can't live in `wc_matches` because there is no
 * `wc_tournaments` row for 2026 yet (FK constraint). We store them in
 * `site_settings` under the `wc2026_videos` key as { [pairKey]: url }.
 */

export function videoKey(home: string, away: string) {
  const pair = [home.toLowerCase().trim(), away.toLowerCase().trim()].sort();
  return pair.join("|");
}

type VideoMap = Record<string, string>;
const SETTING_KEY = "wc2026_videos";

async function readMap(): Promise<VideoMap> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .maybeSingle();
  if (error || !data?.value) return {};
  return (data.value as VideoMap) ?? {};
}

export async function fetch2026VideoMap(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  // 1) Anything that *did* get saved to wc_matches in the past — keep honouring it.
  const { data } = await supabase
    .from("wc_matches")
    .select("home_team,away_team,video_url")
    .eq("tournament_year", 2026)
    .not("video_url", "is", null);
  for (const r of (data ?? []) as Pick<WCMatch, "home_team" | "away_team" | "video_url">[]) {
    if (r.video_url) out.set(videoKey(r.home_team, r.away_team), r.video_url);
  }
  // 2) Primary store — site_settings (works without a wc_tournaments row).
  const map = await readMap();
  for (const [k, v] of Object.entries(map)) if (v) out.set(k, v);
  return out;
}

export async function set2026Video(home: string, away: string, url: string | null) {
  const map = await readMap();
  const k = videoKey(home, away);
  if (url) map[k] = url;
  else delete map[k];
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: map, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function bulkSet2026Videos(entries: { home: string; away: string; url: string }[]) {
  const map = await readMap();
  let added = 0, skipped = 0;
  for (const e of entries) {
    const k = videoKey(e.home, e.away);
    if (map[k]) { skipped++; continue; }
    map[k] = e.url;
    added++;
  }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: map, updated_at: new Date().toISOString() });
  if (error) throw error;
  return { added, skipped };
}
