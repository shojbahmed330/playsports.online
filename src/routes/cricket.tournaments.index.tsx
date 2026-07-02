// Phase 2.1 (cricket) — tournaments hub, links to per-tournament landing pages.
import { createFileRoute, Link } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import {
  breadcrumbList,
  collectionPage,
  itemList,
  ldScript,
} from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { listCricketTournaments } from "@/lib/seo/cricket-entities";

export const Route = createFileRoute("/cricket/tournaments/")({
  head: () => {
    const url = canonical("/cricket/tournaments");
    const list = listCricketTournaments();
    return {
      meta: [
        { title: "Cricket Tournaments — IPL, World Cup, T20 WC & more" },
        {
          name: "description",
          content:
            "Every major cricket tournament: full champions list, top scorers, wicket-takers and fixtures. IPL, ICC World Cup, T20 WC, BBL, PSL and more.",
        },
        { property: "og:title", content: "Cricket Tournaments — Champions & Records" },
        {
          property: "og:description",
          content: "All-time champions, top scorers and wicket-takers across every major cricket tournament.",
        },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          collectionPage({
            name: "Cricket Tournaments",
            description: "All-time champions, top scorers and wicket-takers across every major cricket tournament.",
            path: "/cricket/tournaments",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Tournaments", path: "/cricket/tournaments" },
          ]),
        ),
        ldScript(
          itemList({
            name: "Cricket Tournaments",
            path: "/cricket/tournaments",
            items: list.map((t) => ({
              name: t.longName,
              path: `/cricket/tournaments/${t.slug}`,
            })),
          }),
        ),
      ],
    };
  },
  component: TournamentsHub,
});

function TournamentsHub() {
  const list = listCricketTournaments();
  const international = list.filter((t) => t.group === "international");
  const franchise = list.filter((t) => t.group === "franchise");
  const domestic = list.filter((t) => t.group === "domestic");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">Cricket</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">Tournaments</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cricket Tournaments</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Champions, top scorers and wicket-takers for every major cricket competition.
        </p>

        {[
          { label: "International", items: international },
          { label: "Franchise leagues", items: franchise },
          { label: "Domestic", items: domestic },
        ].map((section) =>
          section.items.length ? (
            <section key={section.label} className="mb-8">
              <h2 className="text-lg font-semibold mb-3">{section.label}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {section.items.map((t) => (
                  <Link
                    key={t.slug}
                    to="/cricket/tournaments/$slug"
                    params={{ slug: t.slug }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/60"
                  >
                    <span className="text-2xl" aria-hidden>{t.emoji}</span>
                    <div>
                      <p className="font-medium">{t.longName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.format.toUpperCase()}
                        {t.totalEditions ? ` · ${t.totalEditions} editions` : ""}
                        {t.latestChampion ? ` · Latest: ${t.latestChampion}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null,
        )}
      </main>
    </div>
  );
}
