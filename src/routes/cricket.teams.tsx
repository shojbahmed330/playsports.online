import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { getCricketTeamsForLeague, type CricketTeamSummary } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/cricket/teams")({
  head: () => ({
    meta: [
      { title: "Cricket Teams — Squads across IPL, BBL, PSL & World Cups" },
      { name: "description", content: "Browse cricket teams across major leagues and international series." },
      { property: "og:title", content: "Cricket Teams" },
      { property: "og:description", content: "Squads across major leagues and international series." },
      { property: "og:url", content: "https://allsportslive.lovable.app/cricket/teams" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/cricket/teams" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "Teams", path: "/cricket/teams" }]))],
  }),
  component: TeamsIndex,
});

function TeamsIndex() {
  const fn = useServerFn(getCricketTeamsForLeague);
  const queries = useQueries({
    queries: CRICKET_LEAGUES.map((l) => ({
      queryKey: ["cricket", "teams", l.id],
      queryFn: () => fn({ data: { leagueId: l.id } }),
      staleTime: 10 * 60_000,
    })),
  });

  const [query, setQuery] = useState("");
  const [leagueId, setLeagueId] = useState<string>("any");

  const allTeams = useMemo(() => {
    const seen = new Map<string, CricketTeamSummary & { leagueIds: string[] }>();
    queries.forEach((q, i) => {
      const lid = CRICKET_LEAGUES[i].id;
      for (const t of q.data?.teams ?? []) {
        const ex = seen.get(t.id);
        if (ex) {
          if (!ex.leagueIds.includes(lid)) ex.leagueIds.push(lid);
        } else {
          seen.set(t.id, { ...t, leagueIds: [lid] });
        }
      }
    });
    return Array.from(seen.values());
  }, [queries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTeams
      .filter((t) => leagueId === "any" || t.leagueIds.includes(leagueId))
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.abbr.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTeams, query, leagueId]);

  const loading = queries.some((q) => q.isLoading);

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-sky-950/40 via-background to-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-sky-500/15 ring-1 ring-sky-500/30 grid place-items-center text-2xl">🛡️</div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-sky-300 font-bold">Cricket</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Teams</h1>
              <p className="text-xs text-muted-foreground mt-1">{allTeams.length} teams across {CRICKET_LEAGUES.length} series.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setLeagueId("any")} className={chip(leagueId === "any")}>All</button>
            {CRICKET_LEAGUES.map((l) => (
              <button key={l.id} onClick={() => setLeagueId(l.id)} className={chip(leagueId === l.id)}>
                <span className="mr-1">{l.emoji}</span>{l.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-900/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-muted-foreground">
            No teams found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((t) => (
              <Link
                key={t.id}
                to="/cricket/series/$id"
                params={{ id: t.leagueIds[0] }}
                className="group rounded-2xl border border-white/10 bg-gray-900/60 hover:bg-gray-900 hover:-translate-y-0.5 transition p-4 flex items-center gap-3"
                style={t.color ? { boxShadow: `inset 0 0 0 1px ${t.color}33` } : undefined}
              >
                <TeamCrest src={t.logo} abbr={t.abbr} name={t.name} className="size-10 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight truncate">{t.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.abbr}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return [
    "px-3 py-1 rounded-full text-[11px] font-bold ring-1 transition",
    active ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white ring-white/20" : "bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10",
  ].join(" ");
}
