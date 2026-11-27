import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaignSlugs } from "@/lib/seo/programmatic-pages";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/football/campaigns/")({
  head: () => {
    const path = "/football/campaigns";
    const title = "FIFA World Cup Campaigns — Every Team, Every Tournament | PlaySports";
    const desc =
      "Browse every national team's FIFA World Cup campaign — results, top scorers, and how far they went, tournament by tournament.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          collectionPage({
            name: "FIFA World Cup Campaigns",
            description: desc,
            path,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Campaigns", path },
          ]),
        ),
      ],
    };
  },
  component: CampaignsIndex,
});

function CampaignsIndex() {
  const all = listCampaignSlugs();
  const years = useMemo(
    () => Array.from(new Set(all.map((c) => c.year))).sort((a, b) => b - a),
    [all],
  );
  const [year, setYear] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (year !== "all" && c.year !== year) return false;
      if (q && !c.team.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [all, year, q]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 pb-20">
      <nav className="mb-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link to="/football" className="hover:underline">
          Football
        </Link>{" "}
        <span aria-hidden="true">/</span> Campaigns
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">FIFA World Cup Team Campaigns</h1>
      <p className="mb-6 text-muted-foreground">
        Every nation&apos;s campaign at every FIFA World Cup — results, goalscorers, and finishing
        round.
      </p>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          aria-label="Filter by World Cup year"
          value={String(year)}
          onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="min-h-11 rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search teams"
          placeholder="Search team…"
          className="min-h-11 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="text-xs text-muted-foreground">{filtered.length} campaigns</span>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title="No campaigns match your filters"
          description="Try another year or clear the team search."
          action={
            <button
              type="button"
              onClick={() => {
                setYear("all");
                setQ("");
              }}
              className="inline-flex min-h-11 items-center rounded-full bg-gold/15 px-4 text-sm font-bold text-gold ring-1 ring-gold/30"
            >
              Clear filters
            </button>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            to="/football/campaigns/$slug"
            params={{ slug: c.slug }}
            className="rounded-lg border border-border bg-card p-3 text-sm hover:border-gold hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="font-semibold">{c.team}</div>
            <div className="text-xs text-muted-foreground">World Cup {c.year}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
