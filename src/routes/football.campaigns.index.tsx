import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaignSlugs } from "@/lib/seo/programmatic-pages";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
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
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
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
  const years = useMemo(() => Array.from(new Set(all.map((c) => c.year))).sort((a, b) => b - a), [all]);
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
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> / Campaigns
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">FIFA World Cup Team Campaigns</h1>
      <p className="mb-6 text-muted-foreground">
        Every nation&apos;s campaign at every FIFA World Cup — results, goalscorers, and finishing round.
      </p>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={String(year)}
          onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search team…"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <span className="text-xs text-muted-foreground">{filtered.length} campaigns</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            to="/football/campaigns/$slug"
            params={{ slug: c.slug }}
            className="rounded-lg border border-border bg-card p-3 text-sm hover:border-gold hover:bg-gold/5"
          >
            <div className="font-semibold">{c.team}</div>
            <div className="text-xs text-muted-foreground">World Cup {c.year}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
