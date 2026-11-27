import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import rankings from "@/data/cricket/rankings.json";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/cricket/players/")({
  head: () => ({
    meta: [
      { title: "Cricket Players — Top batters, bowlers & all-rounders" },
      {
        name: "description",
        content: "Top-ranked cricket players across T20I, ODI and Test formats.",
      },
      { property: "og:title", content: "Cricket Players — Top Performers" },
      {
        property: "og:description",
        content: "Top-ranked batters, bowlers and all-rounders across formats.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/players" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cricket Players — Top batters, bowlers & all-rounders" },
      {
        name: "twitter:description",
        content: "Top-ranked cricket players across T20I, ODI and Test formats.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/players" }],
    scripts: [
      ldScript(
        collectionPage({
          name: "Cricket Players — Top Performers",
          description: "Top-ranked cricket batters, bowlers and all-rounders across formats.",
          path: "/cricket/players",
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Players", path: "/cricket/players" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(PlayersPage, { sport: "cricket", currentPath: "/cricket/players" }),
});

type Fmt = "t20i" | "odi" | "test";
type RankingRow = {
  rank: number;
  player: string;
  team: string;
  flag: string;
  rating: number;
  trend?: number;
};
type RankingsData = {
  updatedAt: string;
  batters: Record<Fmt, RankingRow[]>;
  bowlers: Record<Fmt, RankingRow[]>;
  allrounders: Record<Fmt, RankingRow[]>;
};
const rankingsData = rankings as RankingsData;

type Row = RankingRow & { role: string; format: Fmt };

function PlayersPage() {
  const all = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const cats = ["batters", "bowlers", "allrounders"] as const;
    const fmts = ["t20i", "odi", "test"] as const;
    for (const c of cats) {
      for (const f of fmts) {
        const arr = rankingsData[c]?.[f] ?? [];
        for (const r of arr) {
          out.push({ ...r, role: c, format: f });
        }
      }
    }
    return out;
  }, []);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<"any" | "batters" | "bowlers" | "allrounders">("any");
  const [fmt, setFmt] = useState<"any" | "t20i" | "odi" | "test">("any");

  const filtered = useMemo(() => {
    const lc = q.trim().toLowerCase();
    return all
      .filter((r) => role === "any" || r.role === role)
      .filter((r) => fmt === "any" || r.format === fmt)
      .filter(
        (r) => !lc || r.player.toLowerCase().includes(lc) || r.team.toLowerCase().includes(lc),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 60);
  }, [all, q, role, fmt]);

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-fuchsia-950/40 via-background to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-fuchsia-500/15 ring-1 ring-fuchsia-500/30 grid place-items-center text-2xl">
              👤
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-300 font-bold">
                Cricket
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">International Cricket Players</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Top-ranked players across all formats · snapshot {rankingsData.updatedAt}
              </p>
            </div>
            <Link
              to="/cricket/rankings"
              className="ml-auto inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-bold text-fuchsia-200 hover:bg-white/5"
            >
              Full rankings →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search players…"
              type="search"
              aria-label="Search cricket players"
              className="min-h-11 w-full rounded-full bg-white/5 py-2 pl-9 pr-3 text-sm outline-none ring-1 ring-white/10 focus:ring-fuchsia-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["any", "batters", "bowlers", "allrounders"] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
                className={chip(role === r, "fuchsia")}
              >
                {r === "any" ? "All roles" : cap(r)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/5 ring-1 ring-white/10 rounded-full p-1">
            {(["any", "t20i", "odi", "test"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={fmt === f}
                onClick={() => setFmt(f)}
                className={[
                  "min-h-11 rounded-full px-3 py-1 text-[11px] font-bold transition sm:min-h-8",
                  fmt === f ? "bg-white text-slate-900" : "text-gray-300 hover:text-white",
                ].join(" ")}
              >
                {f === "any" ? "All" : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {all.length}
          </span>
          <span>Ratings are format-specific; filter by format to compare like with like.</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<User className="size-5" aria-hidden="true" />}
            title="No players match your filters"
            description="Try another spelling, role or format."
            action={
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setRole("any");
                  setFmt("any");
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-fuchsia-500/15 px-4 text-sm font-bold text-fuchsia-200 ring-1 ring-fuchsia-500/30"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((r, i) => (
              <div
                key={`${r.role}-${r.format}-${r.player}-${i}`}
                className="rounded-2xl border border-white/10 bg-gray-900/60 hover:bg-gray-900 transition p-4 flex items-center gap-3"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 ring-1 ring-fuchsia-500/30 grid place-items-center text-2xl shrink-0">
                  {r.flag}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                    <span className="text-fuchsia-300">{cap(r.role)}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">{r.format.toUpperCase()}</span>
                  </div>
                  <PlayerLink
                    name={r.player}
                    className="font-extrabold leading-tight truncate block"
                  >
                    {r.player}
                  </PlayerLink>
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {r.team}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</div>
                  <div className="text-lg font-extrabold tabular-nums text-emerald-300">
                    {r.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
function chip(active: boolean, _color: "fuchsia") {
  return [
    "inline-flex min-h-11 items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition sm:min-h-8",
    active
      ? "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white ring-white/20"
      : "bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10",
  ].join(" ");
}
