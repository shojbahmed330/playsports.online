import { readFileSync } from "node:fs";

const base = process.env.BASE_URL || "http://localhost:4317";
const source = readFileSync("src/routes/sitemap[.]xml.ts", "utf8");
const block = source.match(/const STATIC_ROUTES[^=]*=\s*\[([\s\S]*?)\n\];/);
const paths = [...(block?.[1] || "").matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);

async function check(path) {
  const r = await fetch(base + path, { redirect: "follow" });
  const t = await r.text();
  const title = ((t.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  const canonical = ((t.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) || [])[1] || "")
    .replace("https://www.playsports.online", "");
  const robots = ((t.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i) || [])[1] || "");
  return { path, status: r.status, title: title.slice(0, 100), canonical, robots };
}

const results = [];
for (let i = 0; i < paths.length; i += 8) {
  results.push(...(await Promise.all(paths.slice(i, i + 8).map(check))));
}
const bad = results.filter((r) => r.status !== 200 || /noindex/i.test(r.robots));
console.log(JSON.stringify({ total: paths.length, ok: results.length - bad.length, bad }, null, 2));
