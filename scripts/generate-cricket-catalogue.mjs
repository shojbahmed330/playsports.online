import { readFileSync, writeFileSync } from "node:fs";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/cricket";
const CONCURRENCY = 6;
const TIMEOUT_MS = 12_000;

const source = readFileSync("src/lib/cricket-leagues.ts", "utf8");
const rows = [...source.matchAll(/^\s*"(\d+)",\s*\/\/\s*(.+)$/gm)].map((m) => ({
  id: m[1],
  label: m[2].trim(),
}));

if (rows.length === 0) {
  throw new Error("No cricket series IDs found in src/lib/cricket-leagues.ts");
}

async function fetchSeries(row) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/${row.id}/scoreboard`, {
      signal: controller.signal,
      headers: { "user-agent": "playsports-catalogue/1.0" },
    });
    if (!res.ok) return { ...row, error: `HTTP ${res.status}` };
    const json = await res.json();
    const league = json?.leagues?.[0] ?? {};
    const events = Array.isArray(json?.events) ? json.events : [];
    const mapped = events.map((event) => {
      const competitors = event?.competitions?.[0]?.competitors ?? [];
      const names = competitors
        .map((c) => c?.team?.displayName ?? c?.team?.name)
        .filter(Boolean);
      return {
        id: String(event.id ?? ""),
        name: event.name ?? names.join(" v "),
        date: event.date ?? null,
        state: event?.status?.type?.state ?? null,
        detail: event?.status?.type?.detail ?? null,
        teams: names,
      };
    });
    const now = Date.now();
    const upcoming = mapped
      .filter((e) => e.date && Date.parse(e.date) >= now - 86_400_000)
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const finished = mapped
      .filter((e) => e.date && Date.parse(e.date) < now)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const live = mapped.some((e) => e.state === "in");
    return {
      id: row.id,
      label: row.label,
      leagueName: league.name ?? null,
      leagueAbbr: league.abbreviation ?? null,
      format: league?.format?.name ?? null,
      live,
      nextEventAt: upcoming[0]?.date ?? null,
      nextEventName: upcoming[0]?.name ?? null,
      nextEventTeams: upcoming[0]?.teams ?? [],
      lastEventAt: live ? null : finished[0]?.date ?? null,
      lastEventName: live ? null : finished[0]?.name ?? null,
      eventCount: mapped.length,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...row,
      error: error instanceof Error ? error.message : String(error),
      updatedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (let i = 0; i < rows.length; i += CONCURRENCY) {
  const batch = rows.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(fetchSeries))));
  process.stdout.write(`\r${Math.min(i + CONCURRENCY, rows.length)}/${rows.length}`);
}
process.stdout.write("\n");

const payload = {
  generatedAt: new Date().toISOString(),
  source: "espn-site-api",
  windowNote:
    "nextEventAt is the next scheduled/live event; lastEventAt is the most recent completed event. Refresh daily.",
  series: results.sort((a, b) => {
    const at = a.nextEventAt ? Date.parse(a.nextEventAt) : Number.POSITIVE_INFINITY;
    const bt = b.nextEventAt ? Date.parse(b.nextEventAt) : Number.POSITIVE_INFINITY;
    return at - bt || a.label.localeCompare(b.label);
  }),
};

writeFileSync("src/data/cricket/series-catalogue.json", JSON.stringify(payload, null, 2) + "\n");
console.log(`Wrote ${results.length} series to src/data/cricket/series-catalogue.json`);
