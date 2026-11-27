import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionRecords, type RecordCategoryKey } from "@/data/competition-records";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

const CATEGORY_LABELS: Record<RecordCategoryKey, { label: string; blurb: string }> = {
  "top-scorers-all-time": {
    label: "Top Scorers (All-Time)",
    blurb: "Career goals across every edition of this competition.",
  },
  "most-titles": {
    label: "Most Titles",
    blurb: "Nations and clubs ranked by trophies won.",
  },
  "most-appearances": {
    label: "Most Appearances",
    blurb: "Players with the most matches played.",
  },
  "records-and-firsts": {
    label: "Records & Firsts",
    blurb: "Youngest scorer, biggest win, historic firsts.",
  },
  "iconic-moments": {
    label: "Iconic Moments",
    blurb: "The goals, saves and stories that defined the competition.",
  },
};

const VALID_KEYS = Object.keys(CATEGORY_LABELS) as RecordCategoryKey[];

export const Route = createFileRoute("/football/$comp/records/$category")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    if (!VALID_KEYS.includes(params.category as RecordCategoryKey)) throw notFound();
    return { comp, category: params.category as RecordCategoryKey };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp || !loaderData) {
      return { meta: [{ title: "Records" }, { name: "robots", content: "noindex" }] };
    }
    const meta = CATEGORY_LABELS[loaderData.category];
    return buildCompetitionHead({
      comp,
      section: meta.label,
      path: `/football/${comp.slug}/records/${loaderData.category}`,
      descriptionOverride: `${comp.name} — ${meta.label.toLowerCase()}. ${meta.blurb}`,
    });
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Records page not found"
        description="That record category does not exist for this competition."
        action={
          <Link
            to="/football"
            className="inline-flex min-h-11 items-center rounded-full bg-primary/15 px-4 text-sm font-bold text-primary ring-1 ring-primary/30"
          >
            Back to football
          </Link>
        }
      />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this record category"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  component: RecordsCategoryPage,
});

function RecordsCategoryPage() {
  const data = Route.useLoaderData();
  const comp = requireCompetition(data.comp.slug);
  const category = data.category as RecordCategoryKey;
  const meta = CATEGORY_LABELS[category];
  const rows = getCompetitionRecords(comp.slug)[category] ?? [];

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-6">
        <Link
          to="/football/$comp/records"
          params={{ comp: comp.slug }}
          className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All {comp.shortName} records
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
          {comp.shortName} — {meta.label}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{meta.blurb}</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Records being finalised"
          description={`Scoped ${comp.shortName} records land in the next update.`}
        />
      ) : (
        <ol className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {rows.map((r, i) => (
            <li key={`${r.title}-${i}`} className="flex items-center gap-4 px-4 py-3">
              <span className="w-8 shrink-0 text-right tabular-nums text-sm text-muted-foreground">
                {r.rank ?? i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.title}</div>
                {r.context && (
                  <div className="text-xs text-muted-foreground truncate">{r.context}</div>
                )}
              </div>
              <div className="shrink-0 font-bold tabular-nums text-sm sm:text-base">{r.value}</div>
            </li>
          ))}
        </ol>
      )}
    </CompetitionPageShell>
  );
}
