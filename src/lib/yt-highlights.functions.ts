import { createServerFn } from "@tanstack/react-start";

/**
 * Fetch latest videos from a YouTube channel without an API key by
 * scraping the channel page for `channelId`, then parsing the public
 * RSS feed (`feeds/videos.xml?channel_id=...`) which exposes the last
 * ~15 uploads. Cached for 15 min.
 */

type CacheEntry = { at: number; data: unknown };
const cache = new Map<string, CacheEntry>();
const TTL = 15 * 60_000;

export type YtVideo = {
  videoId: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnail: string;
};

async function resolveChannelId(handle: string): Promise<string | null> {
  const url = `https://www.youtube.com/${handle.startsWith("@") ? handle : "@" + handle}`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m =
    html.match(/"channelId":"(UC[\w-]{20,})"/) ||
    html.match(/"externalId":"(UC[\w-]{20,})"/) ||
    html.match(/channel\/(UC[\w-]{20,})/);
  return m ? m[1] : null;
}

function parseRss(xml: string): YtVideo[] {
  const out: YtVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml))) {
    const block = m[1];
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    out.push({
      videoId: id,
      title: title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      url: `https://www.youtube.com/watch?v=${id}`,
      publishedAt: published ?? "",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }
  return out;
}

export const getChannelHighlights = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => d)
  .handler(async ({ data }): Promise<{ videos: YtVideo[]; error: string | null; channelId: string | null }> => {
    const key = `ch:${data.handle}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.data as any;
    try {
      const channelId = await resolveChannelId(data.handle);
      if (!channelId) throw new Error("Could not resolve channel id for " + data.handle);
      const rss = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
        { headers: { "user-agent": "lovable-sports-archive/1.0" } },
      );
      if (!rss.ok) throw new Error(`RSS ${rss.status}`);
      const xml = await rss.text();
      const videos = parseRss(xml);
      const payload = { videos, channelId, error: null as string | null };
      cache.set(key, { at: Date.now(), data: payload });
      return payload;
    } catch (e) {
      return {
        videos: [],
        channelId: null,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });
