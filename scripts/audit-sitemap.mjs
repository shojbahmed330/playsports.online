// Crawl the live sitemap and report indexability problems:
// non-200, redirects, missing/cross canonical, noindex, soft-404 bodies.
//
// Usage:
//   node scripts/audit-sitemap.mjs [--limit=250] [--all]
//   BASE_URL=http://localhost:4317 node scripts/audit-sitemap.mjs --limit=50

const BASE = (process.env.BASE_URL ?? "https://www.playsports.online").replace(/\/$/, "");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Math.max(1, Number(LIMIT_ARG.split("=")[1])) : 250;
const ALL = process.argv.includes("--all");
const CONCURRENCY = 8;
const ERROR_TEXT = /Page not found|Stage not found|Match unavailable|This page didn't load|Competition not found/i;

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function fetchText(url, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "playsports-sitemap-audit/1.0" },
    });
    return { status: res.status, finalUrl: res.url, text: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

async function collectUrls() {
  const root = await fetchText(`${BASE}/sitemap.xml`);
  if (root.status !== 200) throw new Error(`sitemap.xml returned ${root.status}`);

  const queue = locs(root.text);
  const seenSitemaps = new Set();
  const urls = new Set();

  while (queue.length > 0 && (ALL || urls.size < LIMIT * 2)) {
    const batch = queue.splice(0, CONCURRENCY).filter((u) => !seenSitemaps.has(u));
    if (batch.length === 0) continue;
    for (const u of batch) seenSitemaps.add(u);

    const results = await Promise.all(
      batch.map(async (u) => {
        try {
          return { u, res: await fetchText(u) };
        } catch {
          return { u, res: null };
        }
      }),
    );

    for (const { u, res } of results) {
      if (!res || res.status !== 200) continue;
      for (const loc of locs(res.text)) {
        if (loc.endsWith(".xml")) queue.push(loc);
        else urls.add(loc);
      }
    }
    process.stdout.write(`\rSitemaps: ${seenSitemaps.size}, URLs: ${urls.size}`);
  }
  process.stdout.write("\n");
  return [...urls].slice(0, ALL ? urls.size : LIMIT);
}

function normalize(url) {
  return url.replace(/\/$/, "");
}

function canonicalOf(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

function robotsOf(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  return m ? m[1].toLowerCase() : "";
}

async function auditUrl(url) {
  try {
    const res = await fetchText(url);
    const issues = [];
    if (res.status !== 200) issues.push(`status-${res.status}`);
    if (normalize(res.finalUrl) !== normalize(url)) issues.push("redirect");
    const canonical = canonicalOf(res.text);
    if (!canonical) issues.push("missing-canonical");
    else if (normalize(canonical) !== normalize(url)) issues.push("canonical-other");
    if (robotsOf(res.text).includes("noindex")) issues.push("noindex");
    if (ERROR_TEXT.test(res.text)) issues.push("soft-404");
    return { url, status: res.status, canonical, issues };
  } catch (error) {
    return { url, status: 0, canonical: null, issues: [error instanceof Error ? error.message : "fetch-error"] };
  }
}

const urls = await collectUrls();
const results = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(urls.slice(i, i + CONCURRENCY).map(auditUrl))));
  process.stdout.write(`\rAudited: ${Math.min(i + CONCURRENCY, urls.length)}/${urls.length}`);
}
process.stdout.write("\n");

const bad = results.filter((r) => r.issues.length > 0);
const summary = {
  base: BASE,
  audited: results.length,
  ok: results.length - bad.length,
  bad: bad.length,
  byIssue: bad.reduce((acc, r) => {
    for (const issue of r.issues) acc[issue] = (acc[issue] ?? 0) + 1;
    return acc;
  }, {}),
  samples: bad.slice(0, 40),
};

console.log(JSON.stringify(summary, null, 2));
if (bad.length > 0) process.exitCode = 1;
