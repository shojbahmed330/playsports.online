import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { getMlbLeaders, searchMlbPlayers } from "@/lib/mlb.functions";
import { currentSeason } from "@/lib/tournament-config";
import { LeaderBoard } from "@/components/mlb/LeaderBoard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mlb/players")({
  head: () => ({
    meta: [
      { title: "MLB Leaders & Player Search — Batting · Pitching" },
      { name: "description", content: "MLB batting and pitching leaders by season with Top 10/25 toggles, plus player search across the league." },
      { property: "og:title", content: "MLB Leaders & Player Search" },
      { property: "og:description", content: "Batting and pitching leaders by season, plus player search." },
      { property: "og:url", content: "https://allsportslive.lovable.app/mlb/players" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/mlb/players" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }, { name: "Players", path: "/mlb/players" }]))],
  }),
  component: LeadersPage,
});

function LeadersPage() {
  const leadersFn = useServerFn(getMlbLeaders);
  const searchFn = useServerFn(searchMlbPlayers);

  const [season, setSeason] = useState(currentSeason("mlb"));
  const [group, setGroup] = useState<"batting" | "pitching">("batting");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [topN, setTopN] = useState<10 | 25>(10);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const leadersQ = useQuery({
    queryKey: ["mlb", "leaders", season],
    queryFn: () => leadersFn({ data: { season } }),
    staleTime: 60 * 60_000,
  });

  const searchQ = useQuery({
    queryKey: ["mlb", "search", debounced],
    queryFn: () => searchFn({ data: { q: debounced } }),
    enabled: debounced.length >= 2,
    staleTime: 5 * 60_000,
  });

  const cats = group === "batting" ? (leadersQ.data?.batting ?? []) : (leadersQ.data?.pitching ?? []);
  const filtered = useMemo(() => {
    if (!filter.trim()) return cats;
    const f = filter.toLowerCase();
    return cats.filter((c) => c.label.toLowerCase().includes(f));
  }, [cats, filter]);

  const years = [season, season - 1, season - 2, season - 3];
  const showingSearch = debounced.length >= 2;

  return (
    <div className="space-y-5 pb-16">
      {/* Search bar */}
      <div className="rounded-2xl bg-card ring-1 ring-border p-3 sm:p-4">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
            Player search
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MLB players (e.g. Ohtani, Judge, Soto)…"
              className="flex-1 bg-transparent border-0 outline-0 text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </label>
      </div>

      {showingSearch ? (
        <SearchResults
          loading={searchQ.isLoading}
          hits={searchQ.data?.hits ?? []}
          query={debounced}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight">
                League Leaders · {leadersQ.data?.season ?? season}
              </h2>
              <div className="text-[11px] text-muted-foreground">
                {group === "batting" ? "Batting" : "Pitching"} leaderboards · Top {topN}
                {leadersQ.data && leadersQ.data.season !== season ? (
                  <span className="ml-2 text-amber-400">
                    · {season} not started yet — showing {leadersQ.data.season}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter categories…"
                className="bg-card ring-1 ring-border rounded-full px-3 py-1.5 text-xs w-44"
              />
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="bg-card ring-1 ring-border rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <div className="flex rounded-full bg-card ring-1 ring-border p-0.5">
                <button
                  onClick={() => setTopN(10)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    topN === 10 ? "bg-white/10 text-white" : "text-muted-foreground"
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setTopN(25)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    topN === 25 ? "bg-white/10 text-white" : "text-muted-foreground"
                  }`}
                >
                  Top 25
                </button>
              </div>
              <div className="flex rounded-full bg-card ring-1 ring-border p-0.5">
                <button
                  onClick={() => setGroup("batting")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    group === "batting"
                      ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  Batting
                </button>
                <button
                  onClick={() => setGroup("pitching")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    group === "pitching"
                      ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  Pitching
                </button>
              </div>
            </div>
          </div>

          {leadersQ.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-card ring-1 ring-border animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {filter ? "No categories match that filter." : "No leader data for this season yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <LeaderBoard key={c.key} category={{ ...c, entries: c.entries.slice(0, topN) }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchResults({
  loading,
  hits,
  query,
}: {
  loading: boolean;
  hits: ReadonlyArray<{
    id: string;
    name: string;
    position: string | null;
    teamName: string | null;
    teamAbbr: string | null;
    teamLogo: string | null;
    headshot: string | null;
  }>;
  query: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-card ring-1 ring-border animate-pulse" />
        ))}
      </div>
    );
  }
  if (hits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No players found for "{query}".
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
        {hits.length} result{hits.length === 1 ? "" : "s"} for "{query}"
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {hits.map((h) => (
          <Link
            key={h.id}
            to="/mlb/player/$id"
            params={{ id: h.id }}
            className="flex items-center gap-3 rounded-xl bg-card hover:bg-white/[0.05] ring-1 ring-border p-3"
          >
            {h.headshot ? (
              <img
                src={h.headshot}
                alt=""
                className="size-12 rounded-full object-cover bg-white/10 shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="size-12 rounded-full bg-white/10 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{h.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                {h.teamLogo && <img src={h.teamLogo} alt="" className="size-3.5 object-contain" />}
                <span className="truncate">{h.teamName ?? h.teamAbbr ?? "Free Agent"}</span>
                {h.position && <span>· {h.position}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
