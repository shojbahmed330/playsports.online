import { errorMessage } from "@/lib/error-message";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getStageBySlug, WC2026_STAGES } from "@/lib/seo/entities";
import { computeLeaderboard, getLeaderboard } from "@/lib/seo/leaderboards";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsEvent, itemList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";

function formatDate(value?: string): string {
  if (!value) return "TBD";
  const d = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "group-stage":
    "12 groups of 4 teams play a round-robin. The top two from each group plus the eight best third-placed teams advance to the Round of 32.",
  "round-of-32":
    "32 teams enter a single-elimination knockout. Winners progress to the Round of 16.",
  "round-of-16": "16 teams play knockout matches. Winners advance to the Quarter-finals.",
  "quarter-finals": "The final eight play knockout matches for a place in the Semi-finals.",
  "semi-finals": "The final four battle for a spot in the FIFA World Cup Final.",
  "third-place": "The two Semi-final losers meet in a play-off for third place.",
  final: "The FIFA World Cup 2026 Final decides the world champion.",
};

export const Route = createFileRoute("/tournaments/fifa-world-cup-2026/$stage")({
  loader: ({ params }) => {
    const stage = getStageBySlug(params.stage);
    if (stage) return { kind: "stage" as const, stage };
    // `/tournaments/fifa-world-cup-2026/<slug>` also owns the leaderboard URL
    // shape. Serve known boards here instead of letting the stage route 404.
    const board = getLeaderboard(params.stage);
    if (board) {
      const rows = computeLeaderboard("fifa-world-cup-2026", board.slug, 50);
      return { kind: "board" as const, board, rows };
    }
    throw notFound();
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Stage not found" }, { name: "robots", content: "noindex" }] };
    }
    if (loaderData.kind === "board") {
      const { board, rows } = loaderData;
      const path = `/tournaments/fifa-world-cup-2026/${params.stage}`;
      const title = `FIFA World Cup 2026 ${board.name} — Full List | PlaySports`;
      const desc = rows.length
        ? `${board.name} at the FIFA World Cup 2026. ${rows[0].name} leads with ${rows[0].count} ${board.metric.toLowerCase()}. Full ranked list.`
        : `FIFA World Cup 2026 ${board.name.toLowerCase()}. The 2026 leaderboard updates as matches are played; browse the all-time list in the meantime.`;
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
            breadcrumbList([
              { name: "Home", path: "/" },
              { name: "Football", path: "/football" },
              { name: "FIFA World Cup 2026", path: "/football" },
              { name: board.name, path },
            ]),
          ),
        ],
      };
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
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
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
            {
              q: `When does the ${stage.name} take place?`,
              a: `${stage.name} runs from ${stage.startDate} to ${stage.endDate}.`,
            },
            {
              q: `How many matches are in the ${stage.name}?`,
              a: `${stage.matches.length} match${stage.matches.length === 1 ? "" : "es"}.`,
            },
            { q: `How does the ${stage.name} work?`, a: STAGE_DESCRIPTIONS[stage.slug] },
          ]),
        ),
      ],
    };
  },
  component: StagePage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load this stage" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState
        title="Stage not found"
        description="This World Cup 2026 stage is not in the archive."
        action={
          <Link
            to="/football"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Football hub
          </Link>
        }
      />
    </div>
  ),
});

function StagePage() {
  const data = Route.useLoaderData();
  if (data.kind === "board") return <BoardPage board={data.board} rows={data.rows} />;
  const { stage } = data;
  const idx = WC2026_STAGES.findIndex((s) => s.slug === stage.slug);
  const prev = idx > 0 ? WC2026_STAGES[idx - 1] : null;
  const next = idx < WC2026_STAGES.length - 1 ? WC2026_STAGES[idx + 1] : null;
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center text-xs text-muted-foreground"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/football"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Football
        </Link>
        <span aria-hidden="true"> / </span>
        <span>FIFA World Cup 2026</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground" aria-current="page">
          {stage.name}
        </span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">FIFA World Cup 2026 — {stage.name}</h1>
      <p className="text-muted-foreground mb-6">
        {stage.matches.length} match{stage.matches.length === 1 ? "" : "es"} ·{" "}
        {formatDate(stage.startDate)} – {formatDate(stage.endDate)}
      </p>

      <section className="mb-6 prose dark:prose-invert max-w-none">
        <p>{STAGE_DESCRIPTIONS[stage.slug]}</p>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">Matches in this stage</h2>
        {stage.matches.length === 0 ? (
          <EmptyState
            title="No matches scheduled"
            description="Fixtures for this stage are not available yet."
          />
        ) : (
          <ul className="divide-y rounded-xl border border-border bg-card/40">
            {stage.matches.map(
              (m: { matchNo: number; dateISO?: string; stadium?: string; city?: string }) => (
                <li key={m.matchNo} className="flex justify-between items-center px-4 py-2">
                  <Link
                    to="/football/match/$id"
                    params={{ id: String(m.matchNo) }}
                    className="inline-flex min-h-11 items-center text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Match {m.matchNo}
                    {m.stadium ? ` · ${m.stadium}${m.city ? ", " + m.city : ""}` : ""}
                  </Link>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(m.dateISO)}
                  </span>
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked</h2>
        <div className="space-y-3">
          {[
            {
              q: `When does the ${stage.name} take place?`,
              a: `${stage.startDate} to ${stage.endDate}.`,
            },
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
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/tournaments/fifa-world-cup-2026/$stage"
            params={{ stage: next.slug }}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All stages</h2>
        <div className="flex flex-wrap gap-2">
          {WC2026_STAGES.map((s) => (
            <Link
              key={s.slug}
              to="/tournaments/fifa-world-cup-2026/$stage"
              params={{ stage: s.slug }}
              className="inline-flex min-h-11 items-center rounded-full bg-muted px-3 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

type BoardRow = {
  rank: number;
  name: string;
  team: string;
  count: number;
};

function BoardPage({
  board,
  rows,
}: {
  board: { slug: string; name: string; metric: string };
  rows: BoardRow[];
}) {
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center text-xs text-muted-foreground"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/football"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Football
        </Link>
        <span aria-hidden="true"> / </span>
        <span>FIFA World Cup 2026</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground" aria-current="page">
          {board.name}
        </span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">FIFA World Cup 2026 — {board.name}</h1>
      <p className="text-muted-foreground mb-6">
        {rows.length
          ? `${rows[0].name} leads with ${rows[0].count} ${board.metric.toLowerCase()}.`
          : "The 2026 leaderboard updates as matches are played."}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="2026 leaderboard not available yet"
          description={`No ${board.metric.toLowerCase()} recorded for the 2026 tournament so far. Browse the all-time list in the meantime.`}
          action={
            <Link
              to="/tournaments/$tournament/$leaderboard"
              params={{ tournament: "fifa-world-cup-all-time", leaderboard: board.slug }}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              All-time {board.name.toLowerCase()}
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">FIFA World Cup 2026 {board.name}</caption>
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Player
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Team
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  {board.metric}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.name}`} className="border-t border-border">
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.rank}</td>
                  <td className="px-3 py-2 font-semibold">{row.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.team}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/tournaments/$tournament/$leaderboard"
          params={{ tournament: "fifa-world-cup-2022", leaderboard: board.slug }}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          2022 {board.name}
        </Link>
        <Link
          to="/tournaments/$tournament/$leaderboard"
          params={{ tournament: "fifa-world-cup-all-time", leaderboard: board.slug }}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All-time {board.name}
        </Link>
      </nav>
    </div>
  );
}
