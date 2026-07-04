import { useMemo, useState } from "react";
import {
  auditSummary,
  collectAllInternalPaths,
  type AuditLink,
} from "@/lib/seo/audit";
import {
  relatedForFootballTeam,
  relatedForFootballPlayer,
  relatedForLeagueTeam,
  relatedForLeagueChampionship,
  relatedForLeaguePlayer,
  relatedForCricketTeam,
  relatedForCricketPlayer,
  relatedForCricketTournament,
  relatedMatches,
  relatedHighlights,
  relatedTournamentStages,
  relatedCampaigns,
} from "@/lib/seo/related";
import { listMatchSlugs, listHighlights, WC2026_STAGES } from "@/lib/seo/entities";
import { listMlbTeams, listWorldSeries, listMlbPlayers } from "@/lib/seo/mlb-entities";
import { listNbaTeams, listNbaFinals, listNbaPlayers } from "@/lib/seo/nba-entities";
import { listNhlTeams, listStanleyCups, listNhlPlayers } from "@/lib/seo/nhl-entities";
import { listMlsTeams, listMlsCups, listMlsPlayers } from "@/lib/seo/mls-entities";
import { listCricketTeams, listCricketPlayers, listCricketTournaments } from "@/lib/seo/cricket-entities";
import { listTeams } from "@/lib/seo/programmatic";
import { listCampaignSlugs } from "@/lib/seo/programmatic-pages";

/**
 * Builds a synthetic link graph by asking every entity registry for the
 * same "related links" the live routes produce. This mirrors what a
 * crawler would see once every entity page renders its RelatedLinks
 * widget — good enough to catch broken targets and orphans without
 * spinning up a headless browser.
 */
function buildLinkGraph(): AuditLink[] {
  const links: AuditLink[] = [];
  const push = (from: string, items: Array<{ href: string }>) => {
    for (const it of items) links.push({ from, to: it.href });
  };

  // Football
  for (const m of listMatchSlugs()) {
    push(`/football/matches/${m.slug}`, relatedMatches(m));
    links.push({ from: `/archive/football_wc/${m.tournament_year}`, to: `/football/matches/${m.slug}` });
  }
  links.push({ from: "/football", to: "/highlights" });
  for (const h of listHighlights()) {
    links.push({ from: "/highlights", to: `/highlights/${h.slug}` });
    push(`/highlights/${h.slug}`, relatedHighlights(h, 12));
  }
  for (const s of WC2026_STAGES) {
    links.push({ from: "/football", to: `/tournaments/fifa-world-cup-2026/${s.slug}` });
    push(`/tournaments/fifa-world-cup-2026/${s.slug}`, relatedTournamentStages(s.slug, 12));
  }
  links.push({ from: "/football", to: "/football/campaigns" });
  for (const c of listCampaignSlugs()) {
    links.push({ from: "/football/campaigns", to: `/football/campaigns/${c.slug}` });
    push(`/football/campaigns/${c.slug}`, relatedCampaigns(c.slug, 14));
  }
  for (const t of listTeams()) {
    push(`/football/teams/${t.slug}`, relatedForFootballTeam(t.name, 18));
  }
  push("/football/players/lionel-messi", relatedForFootballPlayer("lionel-messi", "Argentina"));
  push("/football/players/cristiano-ronaldo", relatedForFootballPlayer("cristiano-ronaldo", "Portugal"));
  push("/football/players/kylian-mbappe", relatedForFootballPlayer("kylian-mbappe", "France"));
  push("/football/players/neymar", relatedForFootballPlayer("neymar", "Brazil"));
  push("/football/players/vinicius-junior", relatedForFootballPlayer("vinicius-junior", "Brazil"));
  push("/football/players/jude-bellingham", relatedForFootballPlayer("jude-bellingham", "England"));

  // Leagues
  for (const t of listMlbTeams()) push(`/mlb/teams/${t.slug}`, relatedForLeagueTeam("mlb", t.slug));
  for (const e of listWorldSeries()) push(`/mlb/world-series/${e.year}`, relatedForLeagueChampionship("mlb", e.year));
  for (const p of listMlbPlayers()) push(`/mlb/players/${p.slug}`, relatedForLeaguePlayer("mlb", p.slug, undefined, 12));
  for (const t of listNbaTeams()) push(`/nba/teams/${t.slug}`, relatedForLeagueTeam("nba", t.slug));
  for (const e of listNbaFinals()) push(`/nba/finals/${e.year}`, relatedForLeagueChampionship("nba", e.year));
  for (const p of listNbaPlayers()) push(`/nba/players/${p.slug}`, relatedForLeaguePlayer("nba", p.slug, undefined, 12));
  for (const t of listNhlTeams()) push(`/nhl/teams/${t.slug}`, relatedForLeagueTeam("nhl", t.slug));
  for (const e of listStanleyCups()) push(`/nhl/stanley-cup/${e.year}`, relatedForLeagueChampionship("nhl", e.year));
  for (const p of listNhlPlayers()) push(`/nhl/players/${p.slug}`, relatedForLeaguePlayer("nhl", p.slug, undefined, 12));
  for (const t of listMlsTeams()) push(`/mls/teams/${t.slug}`, relatedForLeagueTeam("mls", t.slug));
  for (const e of listMlsCups()) push(`/mls/cup/${e.year}`, relatedForLeagueChampionship("mls", e.year));
  for (const p of listMlsPlayers()) push(`/mls/players/${p.slug}`, relatedForLeaguePlayer("mls", p.slug, undefined, 12));

  // Cricket
  for (const t of listCricketTeams()) push(`/cricket/teams/${t.slug}`, relatedForCricketTeam(t.slug));
  for (const p of listCricketPlayers()) push(`/cricket/players/${p.slug}`, relatedForCricketPlayer(p.slug, 12));
  for (const t of listCricketTournaments()) push(`/cricket/tournaments/${t.slug}`, relatedForCricketTournament(t.slug, 12));

  // Sitewide footer/hub block hits every page → simulate repeated footer edges.
  const footerTargets = [
    "/football", "/cricket", "/mlb", "/nba", "/nhl", "/mls",
    "/live/today", "/players", "/highlights",
    "/football/campaigns", "/cricket/ipl", "/cricket/teams", "/cricket/players",
    "/cricket/tournaments", "/cricket/history", "/mlb/teams", "/nba/teams",
    "/nba/leaders", "/nhl/teams", "/nhl/leaders", "/mls/teams", "/mls/leaders",
    "/football/teams/brazil", "/football/teams/argentina", "/football/teams/france",
    "/football/teams/germany", "/football/teams/england", "/football/teams/spain",
    "/football/teams/portugal", "/football/teams/netherlands", "/football/teams/italy",
    "/football/teams/belgium", "/football/teams/croatia", "/football/teams/uruguay",
    "/football/teams/mexico", "/football/teams/usa", "/football/teams/japan",
    "/football/teams/south-korea", "/football/teams/morocco", "/football/teams/senegal",
    "/football/teams/poland", "/football/teams/switzerland",
    "/football/players/lionel-messi", "/football/players/lionel-messi/world-cup-goals",
    "/football/players/lionel-messi/world-cup-cards", "/football/players/cristiano-ronaldo",
    "/football/players/cristiano-ronaldo/world-cup-goals", "/football/players/cristiano-ronaldo/world-cup-cards",
    "/football/players/kylian-mbappe", "/football/players/kylian-mbappe/world-cup-goals",
    "/football/players/kylian-mbappe/world-cup-cards", "/football/players/neymar",
    "/football/players/neymar/world-cup-goals", "/football/players/neymar/world-cup-cards",
    "/football/players/vinicius-junior", "/football/players/vinicius-junior/world-cup-goals",
    "/football/players/vinicius-junior/world-cup-cards", "/football/players/jude-bellingham",
    "/football/players/jude-bellingham/world-cup-goals", "/football/players/jude-bellingham/world-cup-cards",
    ...WC2026_STAGES.map((s) => `/tournaments/fifa-world-cup-2026/${s.slug}`),
  ];
  for (const from of collectAllInternalPaths()) {
    for (const to of footerTargets) links.push({ from, to });
  }
  // Also connect every entity back to its sport hub so depth stays shallow
  for (const p of collectAllInternalPaths()) {
    const seg = p.split("/")[1];
    if (["football", "cricket", "mlb", "nba", "nhl", "mls"].includes(seg)) {
      links.push({ from: `/${seg}`, to: p });
      links.push({ from: "/", to: `/${seg}` });
    }
  }

  return links;
}

export function SeoHealthCard() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof auditSummary> | null>(null);
  const [tab, setTab] = useState<"broken" | "orphans" | "deep">("broken");

  const run = () => {
    setRunning(true);
    // Defer so the button re-renders before we do heavy work
    setTimeout(() => {
      try {
        const links = buildLinkGraph();
        setResult(auditSummary(links));
      } finally {
        setRunning(false);
      }
    }, 20);
  };

  const rows = useMemo(() => {
    if (!result) return [];
    if (tab === "broken") return result.broken.map((b) => ({ a: b.from, b: b.to, c: b.reason }));
    if (tab === "orphans") return result.orphans.map((o) => ({ a: o.path, b: `${o.inbound} inbound`, c: "" }));
    return result.deep.map((d) => ({ a: d.path, b: d.depth === -1 ? "unreachable" : `depth ${d.depth}`, c: "" }));
  }, [result, tab]);

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">SEO Health — Internal Links</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Broken links, orphan pages ({"<"} 3 inbound), and pages more than 3 clicks from home.
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {running ? "Auditing…" : result ? "Re-run audit" : "Run audit"}
        </button>
      </header>

      {result && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total paths" value={result.totalPaths} />
            <Stat label="Links scanned" value={result.totalLinks} />
            <Stat label="Broken" value={result.broken.length} tone={result.broken.length ? "bad" : "ok"} />
            <Stat label="Orphans" value={result.orphans.length} tone={result.orphans.length ? "warn" : "ok"} />
          </div>

          <div className="mt-5 flex gap-1 text-xs">
            {(["broken", "orphans", "deep"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 font-medium capitalize ${
                  tab === t ? "bg-indigo-600 text-white" : "bg-background/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t} ({t === "broken" ? result.broken.length : t === "orphans" ? result.orphans.length : result.deep.length})
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-background/95 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Path</th>
                  <th className="px-3 py-2 font-medium">Detail</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No issues found. Nice.
                    </td>
                  </tr>
                ) : (
                  rows.slice(0, 500).map((r, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="px-3 py-1.5 font-mono">{r.a}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.b}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.c}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, tone = "ok" }: { label: string; value: number; tone?: "ok" | "warn" | "bad" }) {
  const color =
    tone === "bad" ? "text-rose-400" : tone === "warn" ? "text-amber-400" : "text-emerald-400";
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
