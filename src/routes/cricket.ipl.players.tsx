import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { OrangePurpleCap } from "@/components/ipl/OrangePurpleCap";
import { PlayerLink } from "@/components/cricket/PlayerLink";

import { getIplLeaders, getIplHistory, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
const searchSchema = z.object({
  year: z.union([z.literal("current"), z.coerce.number()]).default("current"),
});

const orangeQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "runs", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "runs", year } }),
    staleTime: 5 * 60_000,
  });
const purpleQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "wickets", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "wickets", year } }),
    staleTime: 5 * 60_000,
  });
const sixesQO = (year: "current" | number) =>
  queryOptions({
    queryKey: ["ipl", "leaders", "sixes", String(year)],
    queryFn: () => getIplLeaders({ data: { metric: "sixes", year } }),
    staleTime: 5 * 60_000,
  });
const historyQO = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl/players")({
  head: () => ({
    meta: [
      { title: "IPL Players — Orange Cap, Purple Cap & Six-hitters" },
      { name: "description", content: "IPL player leaderboards: most runs (Orange Cap), most wickets (Purple Cap), most sixes — by season." },
      { property: "og:title", content: "IPL Player Leaderboards" },
      { property: "og:description", content: "Orange Cap, Purple Cap and six-hitting leaders per season." },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/players" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL Players — Orange Cap, Purple Cap & Six-hitters" },
      { name: "twitter:description", content: "IPL player leaderboards: most runs (Orange Cap), most wickets (Purple Cap), most sixes — by season." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/players" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "IPL", path: "/cricket/ipl" }, { name: "Players", path: "/cricket/ipl/players" }]))],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(orangeQO(deps.year)),
      context.queryClient.ensureQueryData(purpleQO(deps.year)),
      context.queryClient.ensureQueryData(sixesQO(deps.year)),
      context.queryClient.ensureQueryData(historyQO),
    ]),
  component: withHubLinks(PlayersPage, { sport: "ipl", currentPath: "/cricket/ipl/players" }),
});

function PlayersPage() {
  const { year } = Route.useSearch();
  const navigate = useNavigate({ from: "/cricket/ipl/players" });
  const { data: orange } = useSuspenseQuery(orangeQO(year));
  const { data: purple } = useSuspenseQuery(purpleQO(year));
  const { data: sixes } = useSuspenseQuery(sixesQO(year));
  const { data: hist } = useSuspenseQuery(historyQO);

  // Use the historical winner for that exact season (or latest) as a
  // visual fallback when the leaderboard fetch produced nothing.
  const histYear = year === "current" ? hist.seasons[0]?.year : year;
  const histRow = hist.seasons.find((s) => s.year === histYear) ?? hist.seasons[0];

  return (
    <IplPageShell
      title="IPL Player Leaders"
      subtitle="Orange Cap (runs), Purple Cap (wickets) and six-hitters"
      right={
        <select
          value={String(year)}
          onChange={(e) => {
            const v = e.target.value;
            navigate({ search: (p: z.infer<typeof searchSchema>) => ({ ...p, year: v === "current" ? "current" : Number(v) }) });
          }}
          className="rounded-full border border-white/10 bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
        >
          {IPL_SEASON_IDS.map((s) => (
            <option key={String(s.year)} value={String(s.year)} className="bg-gray-900">
              {s.year === "current" ? "Current season" : s.year}
            </option>
          ))}
        </select>
      }
    >
      <OrangePurpleCap
        seasonYear={year}
        orange={orange.leaders}
        purple={purple.leaders}
        fallbackOrange={histRow?.orangeCap ?? null}
        fallbackPurple={histRow?.purpleCap ?? null}
      />

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Most sixes — this season</h2>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Six-Hitters</span>
        </div>
        {sixes.leaders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center text-sm text-white/60">
            Live six-hitting leaderboard appears once matches start.
          </div>
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/5 bg-gray-900/60">
            {sixes.leaders.map((p) => (
              <li key={p.athleteId} className="grid grid-cols-[28px_44px_minmax(0,1fr)_60px_56px] items-center gap-2 px-3 py-2 text-sm">
                <span className="text-center text-[11px] font-black text-white/50">{p.rank}</span>
                {p.headshot ? (
                  <img src={p.headshot} alt="" className="h-9 w-9 rounded-full object-cover bg-gray-800 ring-1 ring-white/10" loading="lazy" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gray-800 text-xs font-black text-white/70 ring-1 ring-white/10">
                    {p.athleteName.slice(0, 1)}
                  </span>
                )}
                <PlayerLink name={p.athleteName} athleteId={p.athleteId} className="min-w-0 truncate font-semibold text-white">{p.athleteName}</PlayerLink>
                <span className="text-[11px] text-white/60">{p.teamAbbr}</span>
                <span className="text-right font-black text-white">{p.value} 6s</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </IplPageShell>
  );
}
