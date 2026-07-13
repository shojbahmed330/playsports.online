// IndexNow protocol — notifies Bing, Yandex, Seznam, Naver instantly on
// new/updated URLs. Google ignores it. One-way ping, no auth needed beyond
// hosting the verification key at /{key}.txt. See https://www.indexnow.org
//
// Usage from any server function:
//   import { pingIndexNow } from "@/lib/seo/indexnow.server";
//   await pingIndexNow(["/mlb/game/123"]);
//
// Setup requirements before it works in production:
// 1. Generate a random 32-char key, store in INDEXNOW_KEY secret.
// 2. Serve that same key at https://www.playsports.online/{key}.txt
//    (add a static file under public/ named "<key>.txt" whose body is the key).

const HOST = "www.playsports.online";
const ORIGIN = `https://${HOST}`;

export async function pingIndexNow(paths: string[]): Promise<{ ok: boolean; status?: number; error?: string }> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { ok: false, error: "INDEXNOW_KEY not configured" };
  if (paths.length === 0) return { ok: true };

  const urlList = paths.map((p) => (p.startsWith("http") ? p : `${ORIGIN}${p.startsWith("/") ? p : `/${p}`}`));

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${ORIGIN}/${key}.txt`,
        urlList,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
