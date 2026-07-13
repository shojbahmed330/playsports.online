import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { getIplSeason, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

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
  head: () => ({
    meta: [
      { title: "IPL Standings — Points Table & Form Guide" },
      { name: "description", content: "Live IPL points table with wins, losses, points and recent form for every franchise." },
      { property: "og:title", content: "IPL Points Table" },
      { property: "og:description", content: "Live IPL standings with form guide for every team." },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/standings" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL Standings — Points Table & Form Guide" },
      { name: "twitter:description", content: "Live IPL points table with wins, losses, points and recent form for every franchise." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/standings" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "IPL", path: "/cricket/ipl" }, { name: "Standings", path: "/cricket/ipl/standings" }]))],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(qo(deps.year)),
  component: withHubLinks(StandingsPage, { sport: "ipl", currentPath: "/cricket/ipl/standings" }),
});

function StandingsPage() {
  const { year } = Route.useSearch();
  const navigate = useNavigate({ from: "/cricket/ipl/standings" });
  const { data } = useSuspenseQuery(qo(year));

  return (
    <IplPageShell
      title="Points Table"
      subtitle="Top 4 advance to the playoffs"
      right={
        <select
          value={String(year)}
          onChange={(e) => {
            const v = e.target.value;
            navigate({ search: (p: z.infer<typeof searchSchema>) => ({ ...p, year: v === "current" ? "current" : Number(v) }) });
          }}
          className="rounded-full border border-white/10 bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          {IPL_SEASON_IDS.map((s) => (
            <option key={String(s.year)} value={String(s.year)} className="bg-gray-900">
              {s.year === "current" ? "Current season" : s.year}
            </option>
          ))}
        </select>
      }
    >
      {data.standings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-white/60">
          No completed matches yet — the points table fills in as the season progresses.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-gray-900/60">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-white/50">
                <th className="py-2 pl-3 text-left">#</th>
                <th className="py-2 text-left">Team</th>
                <th className="py-2 text-right">P</th>
                <th className="py-2 text-right">W</th>
                <th className="py-2 text-right">L</th>
                <th className="py-2 text-right">T</th>
                <th className="py-2 text-right">NRR</th>
                <th className="py-2 text-right pr-2">Pts</th>
                <th className="py-2 pr-3 text-right">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.standings.map((r, i) => {
                const playoff = i < 4;
                return (
                  <tr key={r.teamId} className={playoff ? "bg-emerald-500/5" : ""}>
                    <td className="py-2.5 pl-3 font-black text-white/70">{i + 1}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamCrest src={r.logo} abbr={r.teamName} name={r.teamName} className="h-6 w-6 shrink-0" />
                        <span className="truncate font-semibold text-white">{r.teamName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-white/80">{r.played}</td>
                    <td className="py-2.5 text-right text-emerald-300 font-bold">{r.wins}</td>
                    <td className="py-2.5 text-right text-rose-300 font-bold">{r.losses}</td>
                    <td className="py-2.5 text-right text-white/70">{r.ties}</td>
                    <td className="py-2.5 text-right text-white/70">{r.nrr.toFixed(2)}</td>
                    <td className="py-2.5 text-right pr-2 font-black text-white">{r.points}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <div className="inline-flex gap-0.5">
                        {r.form.length === 0
                          ? <span className="text-white/30">—</span>
                          : r.form.slice().reverse().map((f, idx) => (
                              <span
                                key={idx}
                                className={[
                                  "inline-grid h-5 w-5 place-items-center rounded text-[10px] font-black",
                                  f === "W" ? "bg-emerald-500/20 text-emerald-300"
                                  : f === "L" ? "bg-rose-500/20 text-rose-300"
                                  : "bg-white/10 text-white/70",
                                ].join(" ")}
                              >{f}</span>
                            ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 px-1 text-[11px] text-white/40">
        Highlighted rows = current playoff positions (top 4). NRR is approximate when matches are in progress.
      </p>
    </IplPageShell>
  );
}
