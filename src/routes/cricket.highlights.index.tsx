// Phase 2.1 (cricket) — highlights index/hub.
import { createFileRoute, Link } from "@tanstack/react-router";
import { listCricketHighlights } from "@/lib/seo/cricket-entities";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { EmptyState } from "@/components/ui/state";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const Route = createFileRoute("/cricket/highlights/")({
  head: () => {
    const url = canonical("/cricket/highlights");
    const list = listCricketHighlights();
    return {
      meta: [
        { title: "Cricket Highlights — World Cup, T20 WC, IPL Finals & Classics" },
        {
          name: "description",
          content:
            "Watch highlights from cricket's most iconic matches: ICC Cricket World Cup finals, T20 World Cup finals, Champions Trophy, IPL finals and classic Test matches.",
        },
        { property: "og:title", content: "Cricket Highlights — PlaySports" },
        {
          property: "og:description",
          content:
            "Full match highlights from every major ICC final, IPL final and classic Test match.",
        },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Cricket Highlights — World Cup, T20 WC, IPL Finals & Classics",
        },
        {
          name: "twitter:description",
          content:
            "Watch highlights from cricket's most iconic matches: ICC Cricket World Cup finals, T20 World Cup finals, Champions Trophy, IPL finals and classic Test matches.",
        },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          collectionPage({
            name: "Cricket Highlights",
            description:
              "Full match highlights from every major ICC final, IPL final and classic Test match.",
            path: "/cricket/highlights",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Highlights", path: "/cricket/highlights" },
          ]),
        ),
        ldScript(
          itemList({
            name: "Cricket Highlights",
            path: "/cricket/highlights",
            items: list.map((h) => ({
              name: `${h.teamA} vs ${h.teamB} — ${h.tournament} ${h.stage}`,
              path: `/cricket/highlights/${h.slug}`,
            })),
          }),
        ),
      ],
    };
  },
  component: HighlightsHub,
});

function HighlightsHub() {
  const list = listCricketHighlights();
  const groups = new Map<string, typeof list>();
  for (const h of list) {
    const key = h.tournament;
    const arr = groups.get(key) ?? [];
    arr.push(h);
    groups.set(key, arr);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">Highlights</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cricket Highlights</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Full-match highlights from every major ICC final, IPL final and classic Test match.
        </p>

        {groups.size === 0 && (
          <EmptyState
            title="No highlights available"
            description="Classic match highlights will appear here as they are added."
          />
        )}

        {Array.from(groups.entries()).map(([tournament, items]) => (
          <section key={tournament} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{tournament}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {items
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((h) => (
                  <Link
                    key={h.slug}
                    to="/cricket/highlights/$slug"
                    params={{ slug: h.slug }}
                    className="rounded-lg border border-border bg-card p-4 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <h3 className="font-medium">
                      {h.teamA} vs {h.teamB}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {h.stage} · {h.venue} · {formatDate(h.date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{h.result}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
