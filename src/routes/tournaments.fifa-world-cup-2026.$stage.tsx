import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getStageBySlug, WC2026_STAGES } from "@/lib/seo/entities";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsEvent, itemList, faqPage, ldScript } from "@/lib/seo/jsonld";

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "group-stage": "12 groups of 4 teams play a round-robin. The top two from each group plus the eight best third-placed teams advance to the Round of 32.",
  "round-of-32": "32 teams enter a single-elimination knockout. Winners progress to the Round of 16.",
  "round-of-16": "16 teams play knockout matches. Winners advance to the Quarter-finals.",
  "quarter-finals": "The final eight play knockout matches for a place in the Semi-finals.",
  "semi-finals": "The final four battle for a spot in the FIFA World Cup Final.",
  "third-place": "The two Semi-final losers meet in a play-off for third place.",
  "final": "The FIFA World Cup 2026 Final decides the world champion.",
};

export const Route = createFileRoute("/tournaments/fifa-world-cup-2026/$stage")({
  loader: ({ params }) => {
    const stage = getStageBySlug(params.stage);
    if (!stage) throw notFound();
    return { stage };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Stage not found" }, { name: "robots", content: "noindex" }] };
    }
    const { stage } = loaderData;
    const path = `/tournaments/fifa-world-cup-2026/${params.stage}`;
    const title = `FIFA World Cup 2026 — ${stage.name}: Fixtures, Dates & Results | PlaySports`;
    const desc = `${stage.name} of the FIFA World Cup 2026: ${stage.matches.length} matches from ${stage.startDate} to ${stage.endDate}. ${STAGE_DESCRIPTIONS[stage.slug]}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          sportsEvent({
            name: `FIFA World Cup 2026 — ${stage.name}`,
            path,
            sport: "Football",
            startDate: stage.startDate,
            status: "scheduled",
          }),
        ),
        ldScript(
          itemList({
            name: `${stage.name} matches`,
            path,
            items: stage.matches.map((m) => ({
              name: `Match ${m.matchNo}${m.dateISO ? ` — ${m.dateISO.slice(0, 10)}` : ""}`,
              path: `/football/match/${m.matchNo}`,
            })),
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "FIFA World Cup 2026", path: "/football" },
            { name: stage.name, path },
          ]),
        ),
        ldScript(
          faqPage([
            { q: `When does the ${stage.name} take place?`, a: `${stage.name} runs from ${stage.startDate} to ${stage.endDate}.` },
            { q: `How many matches are in the ${stage.name}?`, a: `${stage.matches.length} match${stage.matches.length === 1 ? "" : "es"}.` },
            { q: `How does the ${stage.name} work?`, a: STAGE_DESCRIPTIONS[stage.slug] },
          ]),
        ),
      ],
    };
  },
  component: StagePage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Stage not found.</div>,
});

function StagePage() {
  const { stage } = Route.useLoaderData();
  const idx = WC2026_STAGES.findIndex((s) => s.slug === stage.slug);
  const prev = idx > 0 ? WC2026_STAGES[idx - 1] : null;
  const next = idx < WC2026_STAGES.length - 1 ? WC2026_STAGES[idx + 1] : null;
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <span>FIFA World Cup 2026</span> / <span>{stage.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">FIFA World Cup 2026 — {stage.name}</h1>
      <p className="text-muted-foreground mb-6">
        {stage.matches.length} match{stage.matches.length === 1 ? "" : "es"} · {stage.startDate} – {stage.endDate}
      </p>

      <section className="mb-6 prose dark:prose-invert max-w-none">
        <p>{STAGE_DESCRIPTIONS[stage.slug]}</p>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">Matches in this stage</h2>
        <ul className="divide-y rounded-lg border">
          {stage.matches.map((m) => (
            <li key={m.matchNo} className="flex justify-between items-center px-4 py-2">
              <Link
                to="/football/match/$id"
                params={{ id: String(m.matchNo) }}
                className="hover:underline text-sm"
              >
                Match {m.matchNo}
                {m.stadium ? ` · ${m.stadium}${m.city ? ", " + m.city : ""}` : ""}
              </Link>
              <span className="text-xs text-muted-foreground font-mono">
                {m.dateISO ? m.dateISO.slice(0, 10) : "TBD"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked</h2>
        <div className="space-y-3">
          {[
            { q: `When does the ${stage.name} take place?`, a: `${stage.startDate} to ${stage.endDate}.` },
            { q: `How many matches are in the ${stage.name}?`, a: `${stage.matches.length}.` },
            { q: `How does the ${stage.name} work?`, a: STAGE_DESCRIPTIONS[stage.slug] },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border px-4 py-3">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="mt-10 flex justify-between text-sm">
        {prev ? (
          <Link
            to="/tournaments/fifa-world-cup-2026/$stage"
            params={{ stage: prev.slug }}
            className="rounded-lg border px-4 py-2 hover:bg-accent"
          >
            ← {prev.name}
          </Link>
        ) : <span />}
        {next ? (
          <Link
            to="/tournaments/fifa-world-cup-2026/$stage"
            params={{ stage: next.slug }}
            className="rounded-lg border px-4 py-2 hover:bg-accent"
          >
            {next.name} →
          </Link>
        ) : <span />}
      </nav>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All stages</h2>
        <div className="flex flex-wrap gap-2">
          {WC2026_STAGES.map((s) => (
            <Link
              key={s.slug}
              to="/tournaments/fifa-world-cup-2026/$stage"
              params={{ stage: s.slug }}
              className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
