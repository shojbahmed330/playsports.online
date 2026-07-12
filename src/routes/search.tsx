import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { listTeams, listPlayers } from "@/lib/seo/programmatic";
import { WC_TOURNAMENTS } from "@/data/wc_tournaments";
import { canonical } from "@/lib/seo/canonical";
import { flagOf } from "@/lib/flags";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => {
    const title = "Search — PlaySports";
    const desc = "Search for any FIFA World Cup country, player, tournament or year.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical("/search") },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: canonical("/search") }],
    };
  },
  component: SearchPage,
});

type Result = {
  kind: "country" | "player" | "tournament";
  name: string;
  score: number;
  href: string;
  linkProps: Record<string, unknown>;
  meta?: string;
  flag?: string;
};

function fuzzyScore(q: string, target: string): number {
  const t = target.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  // simple char-inclusion
  let idx = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, idx);
    if (found === -1) return 0;
    idx = found + 1;
  }
  return 20;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const query = q.trim().toLowerCase();

  const results = useMemo<Result[]>(() => {
    if (!query) return [];
    const out: Result[] = [];

    // year-only shortcut: "1994", "world cup 2018"
    const yearMatch = query.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const y = Number(yearMatch[0]);
      const tour = WC_TOURNAMENTS.find((t) => t.year === y);
      if (tour) out.push({
        kind: "tournament",
        name: `${tour.year} FIFA World Cup — ${tour.host}`,
        score: 95,
        href: `/football/tournaments/${tour.year}`,
        linkProps: { to: "/football/tournaments/$year", params: { year: String(tour.year) } },
        meta: `Champion: ${tour.champion}`,
      });
    }

    for (const team of listTeams()) {
      const s = fuzzyScore(query, team.name);
      if (s > 0) out.push({
        kind: "country",
        name: team.name,
        score: s,
        href: `/football/teams/${team.slug}`,
        linkProps: { to: "/football/teams/$slug", params: { slug: team.slug } },
        flag: flagOf(team.name),
      });
    }

    for (const p of listPlayers().slice(0, 3000)) {
      const s = fuzzyScore(query, p.name);
      if (s >= 60) out.push({
        kind: "player",
        name: p.name,
        score: s - 5,
        href: `/football/players/${p.slug}`,
        linkProps: { to: "/football/players/$slug", params: { slug: p.slug } },
        meta: p.team,
      });
    }

    for (const t of WC_TOURNAMENTS) {
      const label = `${t.year} World Cup`;
      const s = fuzzyScore(query, label) + fuzzyScore(query, t.host);
      if (s > 40) out.push({
        kind: "tournament",
        name: label,
        score: s / 2,
        href: `/football/tournaments/${t.year}`,
        linkProps: { to: "/football/tournaments/$year", params: { year: String(t.year) } },
        meta: `Host: ${t.host}`,
      });
    }

    return out.sort((a, b) => b.score - a.score).slice(0, 40);
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-black text-white mb-3">Search PlaySports</h1>
          <form method="get" action="/search">
            <input
              name="q"
              defaultValue={q}
              placeholder="Try: Argentina, Messi, 1998, world cup 2022…"
              className="w-full rounded-xl px-4 py-3 text-base bg-white/95 text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/40"
              autoFocus
            />
          </form>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 pt-6">
        {!query && (
          <p className="text-muted-foreground text-sm">Enter a country, player, year, or tournament to see matching pages.</p>
        )}
        {query && results.length === 0 && (
          <p className="text-muted-foreground">No results for "{q}". Try a country or player name.</p>
        )}
        {results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-3">{results.length} results for "{q}"</p>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.name}-${i}`}>
                  <Link
                    {...(r.linkProps as { to: string })}
                    className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/60 hover:shadow-md transition"
                  >
                    {r.flag && <span className="text-2xl">{r.flag}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold group-hover:text-primary">{r.name}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {r.kind}{r.meta ? ` · ${r.meta}` : ""}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
