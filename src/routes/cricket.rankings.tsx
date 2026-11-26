import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import rankings from "@/data/cricket/rankings.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

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
  { id: "teams", label: "Teams", emoji: "🛡️", grad: "from-sky-500 to-blue-600" },
  { id: "batters", label: "Batters", emoji: "🏏", grad: "from-amber-500 to-orange-500" },
  { id: "bowlers", label: "Bowlers", emoji: "🎯", grad: "from-red-500 to-rose-500" },
  { id: "allrounders", label: "All-rounders", emoji: "⚡", grad: "from-fuchsia-500 to-purple-500" },
];

const FORMATS: { id: Fmt; label: string }[] = [
  { id: "t20i", label: "T20I" },
  { id: "odi", label: "ODI" },
  { id: "test", label: "Test" },
];

function RankingsPage() {
  const { cat, fmt } = Route.useSearch() as { cat: Cat; fmt: Fmt };
  const navigate = Route.useNavigate();
  const setCat = (c: Cat) =>
    navigate({ search: (p: { cat: Cat; fmt: Fmt }) => ({ ...p, cat: c }), replace: true });
  const setFmt = (f: Fmt) =>
    navigate({ search: (p: { cat: Cat; fmt: Fmt }) => ({ ...p, fmt: f }), replace: true });

  const data: any[] =
    (rankings as any)[cat]?.[cat === "teams" && fmt === "test" ? "test" : fmt] ?? [];

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-indigo-950/40 via-background to-violet-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/30 grid place-items-center text-2xl">
              📊
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-300 font-bold">
                ICC Rankings
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Cricket Rankings</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Updated {(rankings as any).updatedAt}.
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
                onClick={() => setCat(c.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-[11px] font-bold ring-1 transition inline-flex items-center gap-1.5",
                  cat === c.id
                    ? `bg-gradient-to-r ${c.grad} text-white ring-white/20`
                    : "bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10",
                ].join(" ")}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1 bg-white/5 ring-1 ring-white/10 rounded-full p-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFmt(f.id)}
                className={[
                  "px-3 py-1 rounded-full text-[11px] font-bold transition",
                  fmt === f.id ? "bg-white text-slate-900" : "text-gray-300 hover:text-white",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/80 text-[10px] uppercase tracking-wider text-gray-400">
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
            <tbody className="divide-y divide-gray-800">
              {data.map((r) => (
                <tr key={r.rank} className="hover:bg-white/[0.03] transition">
                  <td className="px-3 py-3 tabular-nums">
                    <span
                      className={[
                        "inline-grid place-items-center size-7 rounded-full text-xs font-extrabold",
                        r.rank === 1
                          ? "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40"
                          : r.rank === 2
                            ? "bg-gray-400/20 text-gray-200 ring-1 ring-gray-400/40"
                            : r.rank === 3
                              ? "bg-amber-700/30 text-amber-300 ring-1 ring-amber-700/40"
                              : "bg-white/5 text-gray-400 ring-1 ring-white/10",
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
                    <td className="px-3 py-3 hidden sm:table-cell text-xs text-gray-400 font-mono">
                      {r.team}
                    </td>
                  )}
                  <td className="px-3 py-3 text-right tabular-nums font-extrabold text-emerald-300">
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
            <div className="p-8 text-center text-xs text-muted-foreground">
              No data for this combination.
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-500 text-center">Source: {(rankings as any).source}</p>
      </div>
    </div>
  );
}

function TrendBadge({ t }: { t: number }) {
  if (t > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-bold tabular-nums">
        <TrendingUp className="size-3" />+{t}
      </span>
    );
  if (t < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-bold tabular-nums">
        <TrendingDown className="size-3" />
        {t}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-gray-500 text-xs">
      <Minus className="size-3" />
    </span>
  );
}
