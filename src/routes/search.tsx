import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@/lib/zod-validator";
import { z } from "zod";
import { useMemo } from "react";
import { Search } from "lucide-react";
import { listTeams, listPlayers } from "@/lib/seo/programmatic";
import { WC_TOURNAMENTS } from "@/data/wc_tournaments";
import { canonical } from "@/lib/seo/canonical";
import { flagOf } from "@/lib/flags";
import { EmptyState } from "@/components/ui/state";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => {
    const title = "Search the World Cup Archive — PlaySports";
    const desc = "Search for any FIFA World Cup country, player, tournament or year.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical("/search") },
        { property: "og:image", content: "https://www.playsports.online/og-default.png" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "robots", content: "noindex, follow" },
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
      if (tour)
        out.push({
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
      if (s > 0)
        out.push({
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
      if (s >= 60)
        out.push({
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
      if (s > 40)
        out.push({
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
      <header className="border-b border-border bg-gradient-to-br from-primary/20 via-background to-background py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-black text-foreground mb-3">Search the World Cup archive</h1>
          <form method="get" action="/search" className="flex gap-2">
            <label htmlFor="site-search" className="sr-only">
              Search countries, players, years or tournaments
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Try: Argentina, Messi, 1998, world cup 2022…"
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 pt-6">
        {!query && (
          <>
            <EmptyState
              title="Find a World Cup page"
              description="Enter a country, player, year or tournament to see matching pages."
              icon={<Search className="size-5" aria-hidden="true" />}
            />
            <nav aria-label="Popular searches" className="mt-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Popular searches
              </h2>
              <ul className="flex flex-wrap gap-2">
                {["Argentina", "Brazil", "Messi", "2022", "France", "World Cup 1998"].map(
                  (term) => (
                    <li key={term}>
                      <Link
                        to="/search"
                        search={{ q: term }}
                        className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {term}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          </>
        )}
        {query && results.length === 0 && (
          <EmptyState
            title={`No results for “${q}”`}
            description="Try a country or player name, a four-digit year, or “world cup” and a host."
            action={
              <Link
                to="/football"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse the football archive
              </Link>
            }
          />
        )}
        {results.length > 0 && (
          <>
            <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
              {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
            </p>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.name}-${i}`}>
                  <Link
                    {...(r.linkProps as { to: string })}
                    className="group flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {r.flag && (
                      <span className="text-2xl" aria-hidden="true">
                        {r.flag}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold group-hover:text-primary">{r.name}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {r.kind === "country" ? "Team" : r.kind}
                        {r.meta ? (
                          <>
                            <span aria-hidden="true"> · </span>
                            {r.meta}
                          </>
                        ) : null}
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
