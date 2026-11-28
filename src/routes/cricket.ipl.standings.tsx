import { createFileRoute, Link, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { getIplSeason, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
const searchSchema = z.object({
  year: z.union([z.literal("current"), z.coerce.number()]).default("current"),
});

const qo = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "season", String(year)],
    queryFn: () => getIplSeason({ data: { year } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const Route = createFileRoute("/cricket/ipl/standings")({
  search: {
    middlewares: [stripSearchParams({ year: "current" })],
  },
  head: () => ({
    meta: [
      { title: "IPL Standings — Points Table & Form Guide" },
      {
        name: "description",
        content:
          "Live IPL points table with wins, losses, points and recent form for every franchise.",
      },
      { property: "og:title", content: "IPL Points Table" },
      { property: "og:description", content: "Live IPL standings with form guide for every team." },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/standings" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL Standings — Points Table & Form Guide" },
      {
        name: "twitter:description",
        content:
          "Live IPL points table with wins, losses, points and recent form for every franchise.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/standings" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "IPL", path: "/cricket/ipl" },
          { name: "Standings", path: "/cricket/ipl/standings" },
        ]),
      ),
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(qo(deps.year)),
  component: withHubLinks(StandingsPage, { sport: "ipl", currentPath: "/cricket/ipl/standings" }),
});

function StandingsPage() {
  const { year } = Route.useSearch();
  const navigate = useNavigate({ from: "/cricket/ipl/standings" });
  const standingsQuery = useSuspenseQuery(qo(year));
  const data = standingsQuery.data;

  return (
    <IplPageShell
      title="Points Table"
      subtitle={`${year === "current" ? "Current season" : year} · Top 4 advance to the playoffs`}
      right={
        <select
          aria-label="IPL season"
          value={String(year)}
          onChange={(e) => {
            const v = e.target.value;
            navigate({
              search: (p: z.infer<typeof searchSchema>) => ({
                ...p,
                year: v === "current" ? "current" : Number(v),
              }),
            });
          }}
          className="min-h-11 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-mlb)]/40"
        >
          {IPL_SEASON_IDS.map((s) => (
            <option key={String(s.year)} value={String(s.year)} className="bg-background">
              {s.year === "current" ? "Current season" : s.year}
            </option>
          ))}
        </select>
      }
    >
      {data.error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-4 py-3 text-sm text-[var(--color-gold)]"
        >
          <span>The IPL standings feed is temporarily unavailable.</span>
          <button
            type="button"
            onClick={() => void standingsQuery.refetch()}
            className="inline-flex min-h-10 items-center rounded-full border border-[var(--color-gold)]/40 px-3 text-xs font-bold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20"
          >
            Retry
          </button>
        </div>
      )}

      {data.standings.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No completed matches yet"
          description="The points table fills in as the season progresses."
        />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[680px] text-sm">
            <caption className="sr-only">
              IPL points table for {year === "current" ? "the current season" : year}
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted text-[10px] font-black uppercase tracking-widest text-foreground">
                <th scope="col" className="py-2 pl-3 text-left">
                  #
                </th>
                <th scope="col" className="py-2 text-left">
                  Team
                </th>
                <th scope="col" className="py-2 text-right">
                  P
                </th>
                <th scope="col" className="py-2 text-right">
                  W
                </th>
                <th scope="col" className="py-2 text-right">
                  L
                </th>
                <th scope="col" className="py-2 text-right">
                  T
                </th>
                <th scope="col" className="py-2 text-right">
                  NRR
                </th>
                <th scope="col" className="py-2 text-right pr-2">
                  Pts
                </th>
                <th scope="col" className="py-2 pr-3 text-right">
                  Form
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.standings.map((r, i) => {
                const playoff = i < 4;
                return (
                  <tr key={r.teamId} className={playoff ? "bg-[var(--color-accent-cricket)]/5" : ""}>
                    <td className="py-2.5 pl-3 font-black text-foreground">{i + 1}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamCrest
                          src={r.logo}
                          abbr={r.teamName}
                          name={r.teamName}
                          className="h-6 w-6 shrink-0"
                        />
                        <Link
                          to="/cricket/ipl/teams/$teamId"
                          params={{ teamId: r.teamId }}
                          className="truncate font-semibold text-foreground hover:underline"
                        >
                          {r.teamName}
                        </Link>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-foreground">{r.played}</td>
                    <td className="py-2.5 text-right text-[var(--color-accent-cricket)] font-bold">{r.wins}</td>
                    <td className="py-2.5 text-right text-[var(--color-live)] font-bold">{r.losses}</td>
                    <td className="py-2.5 text-right text-foreground">{r.ties}</td>
                    <td className="py-2.5 text-right text-foreground">{r.nrr.toFixed(2)}</td>
                    <td className="py-2.5 text-right pr-2 font-black text-foreground">{r.points}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <div className="inline-flex gap-0.5">
                        {r.form.length === 0 ? (
                          <span className="text-foreground">—</span>
                        ) : (
                          r.form
                            .slice()
                            .reverse()
                            .map((f, idx) => (
                              <span
                                key={idx}
                                className={[
                                  "inline-grid h-5 w-5 place-items-center rounded text-[10px] font-black",
                                  f === "W"
                                    ? "bg-[var(--color-accent-cricket)]/20 text-[var(--color-accent-cricket)]"
                                    : f === "L"
                                      ? "bg-[var(--color-live)]/20 text-[var(--color-live)]"
                                      : "bg-muted text-foreground",
                                ].join(" ")}
                              >
                                {f}
                              </span>
                            ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 px-1 text-[11px] text-foreground">
        Highlighted rows = current playoff positions (top 4). NRR is approximate when matches are in
        progress.
      </p>
    </IplPageShell>
  );
}
