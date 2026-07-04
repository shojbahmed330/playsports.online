import { supabase, type WCMatch } from "@/lib/supabase";
import bundledHighlights from "@/data/wc2026_highlights.json";


/**
 * 2026 video links can't live in `wc_matches` because there is no
 * `wc_tournaments` row for 2026 yet (FK constraint). We store them in
 * `site_settings` under the `wc2026_videos` key as { [pairKey]: url }.
 */

export function videoKey(home: string, away: string) {
  const pair = [canonicalTeamKey(home), canonicalTeamKey(away)].sort();
  return pair.join("|");
}

function baseTeamKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TEAM_CANONICAL: Record<string, string> = {
  usa: "united states",
  us: "united states",
  "u s a": "united states",
  "united states of america": "united states",
  korea: "south korea",
  "korea republic": "south korea",
  "republic of korea": "south korea",
  turkiye: "turkey",
  turkiyee: "turkey",
  czechia: "czech republic",
  "cote d ivoire": "ivory coast",
  "cote divoire": "ivory coast",
  "cote dvoire": "ivory coast",
  "ivory coast": "ivory coast",
  "bosnia herzegovina": "bosnia and herzegovina",
  "bosnia and herzegovina": "bosnia and herzegovina",
  bih: "bosnia and herzegovina",
  "congo dr": "dr congo",
  "congo d r": "dr congo",
  "democratic republic of congo": "dr congo",
  cod: "dr congo",
  "cabo verde": "cape verde",
  curacao: "curacao",
};

function canonicalTeamKey(team: string) {
  const k = baseTeamKey(team);
  return TEAM_CANONICAL[k] ?? k;
}

function addVideo(out: Map<string, string>, rawKey: string, url: string) {
  const [a, b] = rawKey.split("|");
  if (!a || !b) return;
  out.set(videoKey(a, b), url);
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
  // 0) Bundled highlights (curated from @robi_axiata) — baseline.
  for (const [k, v] of Object.entries(bundledHighlights as Record<string, string>)) {
    if (v) addVideo(out, k, v);
  }
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
  for (const [k, v] of Object.entries(map)) if (v) addVideo(out, k, v);
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

export async function bulkSet2026Videos(
  entries: { home: string; away: string; url: string }[],
  opts: { overwrite?: boolean } = {},
) {
  const map = await readMap();
  let added = 0, skipped = 0, updated = 0;
  for (const e of entries) {
    const k = videoKey(e.home, e.away);
    if (map[k]) {
      if (!opts.overwrite) { skipped++; continue; }
      if (map[k] === e.url) { skipped++; continue; }
      map[k] = e.url;
      updated++;
    } else {
      map[k] = e.url;
      added++;
    }
  }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: map, updated_at: new Date().toISOString() });
  if (error) throw error;
  return { added, skipped, updated };
}
