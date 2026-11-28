import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { zodValidator, fallback } from "@/lib/zod-validator";
import { z } from "zod";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import rankings from "@/data/cricket/rankings.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
const search = z.object({
  cat: fallback(z.enum(["teams", "batters", "bowlers", "allrounders"]), "teams").default("teams"),
  fmt: fallback(z.enum(["t20i", "odi", "test"]), "t20i").default("t20i"),
});

export const Route = createFileRoute("/cricket/rankings")({
  validateSearch: zodValidator(search),
  search: {
    middlewares: [stripSearchParams({ cat: "teams", fmt: "t20i" })],
  },
  head: () => ({
    meta: [
      { title: "ICC Cricket Rankings — Player & Team Rankings" },
      { name: "description", content: "Official ICC rankings across T20I, ODI and Test." },
      { property: "og:title", content: "ICC Cricket Rankings" },
      {
        property: "og:description",
        content: "Team and player rankings across T20I, ODI and Test.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/rankings" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ICC Cricket Rankings — Player & Team Rankings" },
      { name: "twitter:description", content: "Official ICC rankings across T20I, ODI and Test." },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/rankings" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Rankings", path: "/cricket/rankings" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(RankingsPage, { sport: "cricket", currentPath: "/cricket/rankings" }),
});

type Cat = "teams" | "batters" | "bowlers" | "allrounders";
type Fmt = "t20i" | "odi" | "test";

const CATS: { id: Cat; label: string; emoji: string; grad: string }[] = [
  { id: "teams", label: "Teams", emoji: "🛡️", grad: "from-[var(--color-accent-mlb)] to-[var(--color-accent-mlb)]" },
  { id: "batters", label: "Batters", emoji: "🏏", grad: "from-[var(--color-gold)] to-[var(--color-gold)]" },
  { id: "bowlers", label: "Bowlers", emoji: "🎯", grad: "from-[var(--color-live)] to-[var(--color-live)]" },
  { id: "allrounders", label: "All-rounders", emoji: "⚡", grad: "from-[var(--color-accent-nhl)] to-[var(--color-accent-nhl)]" },
];

const FORMATS: { id: Fmt; label: string }[] = [
  { id: "t20i", label: "T20I" },
  { id: "odi", label: "ODI" },
  { id: "test", label: "Test" },
];

type RankingRow = {
  rank: number;
  team: string;
  code: string;
  flag: string;
  rating: number;
  trend?: number;
  player?: string;
};
type RankingsData = {
  updatedAt: string;
  source: string;
} & Record<Cat, Record<Fmt, RankingRow[]>>;

const rankingsData = rankings as RankingsData;

function RankingsPage() {
  const { cat, fmt } = Route.useSearch() as { cat: Cat; fmt: Fmt };
  const navigate = Route.useNavigate();
  const setCat = (c: Cat) =>
    navigate({ search: (p: { cat: Cat; fmt: Fmt }) => ({ ...p, cat: c }), replace: true });
  const setFmt = (f: Fmt) =>
    navigate({ search: (p: { cat: Cat; fmt: Fmt }) => ({ ...p, fmt: f }), replace: true });

  const data: RankingRow[] = rankingsData[cat]?.[fmt] ?? [];

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-[var(--color-accent-nhl)]/40 via-background to-[var(--color-accent-nhl)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[var(--color-accent-nhl)]/15 ring-1 ring-[var(--color-accent-nhl)]/30 grid place-items-center text-2xl">
              📊
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent-nhl)] font-bold">
                ICC Rankings
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Cricket Rankings</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Bundled snapshot: {rankingsData.updatedAt}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={[
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition sm:min-h-8",
                  cat === c.id
                    ? `bg-gradient-to-r ${c.grad} text-foreground ring-border`
                    : "bg-muted text-foreground ring-border hover:bg-muted",
                ].join(" ")}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1 bg-muted ring-1 ring-border rounded-full p-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={fmt === f.id}
                onClick={() => setFmt(f.id)}
                className={[
                  "min-h-11 rounded-full px-3 py-1 text-[11px] font-bold transition sm:min-h-8",
                  fmt === f.id ? "bg-muted text-muted-foreground" : "text-foreground hover:text-foreground",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <caption className="sr-only">
              ICC {cat === "teams" ? "team" : cat} rankings, {fmt.toUpperCase()}, bundled{" "}
              {rankingsData.updatedAt}
            </caption>
            <thead className="sticky top-0 bg-background text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
              <tr>
                <th className="text-left px-3 py-2.5 w-12">#</th>
                <th className="text-left px-3 py-2.5">{cat === "teams" ? "Team" : "Player"}</th>
                {cat !== "teams" && (
                  <th className="text-left px-3 py-2.5 hidden sm:table-cell">Team</th>
                )}
                <th className="text-right px-3 py-2.5">Rating</th>
                <th className="text-right px-3 py-2.5 w-16">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((r) => (
                <tr key={r.rank} className="hover:bg-muted transition">
                  <td className="px-3 py-3 tabular-nums">
                    <span
                      className={[
                        "inline-grid place-items-center size-7 rounded-full text-xs font-extrabold",
                        r.rank === 1
                          ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40"
                          : r.rank === 2
                            ? "bg-muted text-foreground ring-1 ring-border"
                            : r.rank === 3
                              ? "bg-[var(--color-gold)]/30 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40"
                              : "bg-muted text-foreground ring-1 ring-border",
                      ].join(" ")}
                    >
                      {r.rank}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">{r.flag}</span>
                      {cat === "teams" ? (
                        <span className="font-bold truncate">{r.team}</span>
                      ) : (
                        <PlayerLink name={r.player} className="font-bold truncate block">
                          {r.player}
                        </PlayerLink>
                      )}
                    </div>
                  </td>

                  {cat !== "teams" && (
                    <td className="px-3 py-3 hidden sm:table-cell text-xs text-foreground font-mono">
                      {r.team}
                    </td>
                  )}
                  <td className="px-3 py-3 text-right tabular-nums font-extrabold text-[var(--color-accent-cricket)]">
                    {r.rating}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <TrendBadge t={Number(r.trend ?? 0)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <EmptyState
              title="No rankings for this combination"
              description="Choose another category or format. The rankings are a bundled snapshot, not a live ICC feed."
            />
          )}
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Bundled snapshot from {rankingsData.updatedAt}; it may lag the latest ICC update. Source:{" "}
          {rankingsData.source}
        </p>
      </div>
    </div>
  );
}

function TrendBadge({ t }: { t: number }) {
  if (t > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[var(--color-accent-cricket)] text-xs font-bold tabular-nums">
        <TrendingUp className="size-3" />+{t}
      </span>
    );
  if (t < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[var(--color-live)] text-xs font-bold tabular-nums">
        <TrendingDown className="size-3" />
        {t}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="size-3" />
    </span>
  );
}
