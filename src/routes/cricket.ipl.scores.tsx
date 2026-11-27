import { createFileRoute, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { toCricketMatch } from "@/components/ipl/toCricketMatch";
import { getIplSeason, IPL_SEASON_IDS, type IplMatchLite } from "@/lib/ipl.functions";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
const searchSchema = z.object({
  year: z.union([z.literal("current"), z.coerce.number()]).default("current"),
  status: z.enum(["all", "live", "upcoming", "finished"]).default("all"),
});

const qo = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "season", String(year)],
    queryFn: () => getIplSeason({ data: { year } }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

export const Route = createFileRoute("/cricket/ipl/scores")({
  head: () => ({
    meta: [
      { title: "IPL Scores — Live, Upcoming & Results" },
      {
        name: "description",
        content: "Live IPL scores, upcoming fixtures and full results for every season.",
      },
      { property: "og:title", content: "IPL Scores & Fixtures" },
      {
        property: "og:description",
        content: "Every IPL fixture and result, filterable by season and status.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/scores" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL Scores — Live, Upcoming & Results" },
      {
        name: "twitter:description",
        content: "Live IPL scores, upcoming fixtures and full results for every season.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/scores" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "IPL", path: "/cricket/ipl" },
          { name: "Scores", path: "/cricket/ipl/scores" },
        ]),
      ),
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [stripSearchParams({ year: "current", status: "all" })],
  },
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(qo(deps.year)),
  component: withHubLinks(ScoresPage, { sport: "ipl", currentPath: "/cricket/ipl/scores" }),
});

function ScoresPage() {
  const { year, status } = Route.useSearch();
  const navigate = useNavigate({ from: "/cricket/ipl/scores" });
  const seasonQuery = useSuspenseQuery(qo(year));
  const data = seasonQuery.data;

  const filtered = filterByStatus(data.matches, status);

  return (
    <IplPageShell
      title="Scores & Fixtures"
      subtitle={`${data.matches.length} matches · season ${String(year)}`}
      right={
        <SeasonPicker
          year={year}
          onChange={(y) =>
            navigate({ search: (p: z.infer<typeof searchSchema>) => ({ ...p, year: y }) })
          }
        />
      }
    >
      <FilterChips
        value={status}
        onChange={(s) =>
          navigate({ search: (p: z.infer<typeof searchSchema>) => ({ ...p, status: s }) })
        }
        counts={{
          all: data.matches.length,
          live: data.matches.filter((m) => m.status === "in").length,
          upcoming: data.matches.filter((m) => m.status === "pre").length,
          finished: data.matches.filter((m) => m.status === "post").length,
        }}
      />

      {data.error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          <span>Unable to reach the live feed right now — try refreshing in a moment.</span>
          <button
            type="button"
            onClick={() => void seasonQuery.refetch()}
            className="inline-flex min-h-10 items-center rounded-full border border-amber-400/40 px-3 text-xs font-bold text-amber-100 hover:bg-amber-500/20"
          >
            Retry
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-white/50">
        Showing {filtered.length} of {data.matches.length} matches
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No matches in this view"
          description="Try another season or clear the status filter."
          action={
            status !== "all" ? (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    search: (p: z.infer<typeof searchSchema>) => ({ ...p, status: "all" }),
                  })
                }
                className="inline-flex min-h-11 items-center rounded-full bg-amber-500/15 px-4 text-sm font-bold text-amber-200 ring-1 ring-amber-500/30"
              >
                Show all matches
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <CricketMatchCard key={m.id} match={toCricketMatch(m, data.seasonId, "IPL")} />
          ))}
        </div>
      )}
    </IplPageShell>
  );
}

function filterByStatus(ms: IplMatchLite[], s: string) {
  if (s === "live") return ms.filter((m) => m.status === "in");
  if (s === "upcoming") return ms.filter((m) => m.status === "pre");
  if (s === "finished") return ms.filter((m) => m.status === "post").reverse();
  return ms;
}

function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: string;
  onChange: (s: "all" | "live" | "upcoming" | "finished") => void;
  counts: Record<string, number>;
}) {
  const items: { id: "all" | "live" | "upcoming" | "finished"; label: string; cls: string }[] = [
    { id: "all", label: "All", cls: "from-slate-500 to-slate-600" },
    { id: "live", label: "Live", cls: "from-rose-500 to-red-500" },
    { id: "upcoming", label: "Upcoming", cls: "from-amber-500 to-orange-500" },
    { id: "finished", label: "Results", cls: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(it.id)}
            className={[
              "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 transition sm:min-h-8",
              active
                ? `bg-gradient-to-r ${it.cls} text-white ring-white/20`
                : "bg-white/[0.04] text-white/70 ring-white/10 hover:bg-white/10",
            ].join(" ")}
          >
            {it.label}
            <span className="rounded-full bg-black/30 px-1.5 text-[10px] font-black">
              {counts[it.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SeasonPicker({
  year,
  onChange,
}: {
  year: "current" | number;
  onChange: (y: "current" | number) => void;
}) {
  return (
    <select
      aria-label="IPL season"
      value={String(year)}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "current" ? "current" : Number(v));
      }}
      className="min-h-11 rounded-full border border-white/10 bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
    >
      {IPL_SEASON_IDS.map((s) => (
        <option key={String(s.year)} value={String(s.year)} className="bg-gray-900">
          {s.year === "current" ? "Current season" : s.year}
        </option>
      ))}
    </select>
  );
}
