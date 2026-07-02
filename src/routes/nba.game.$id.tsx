import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Radio } from "lucide-react";
import { getNbaGame } from "@/lib/nba.functions";
import { NbaLinescore } from "@/components/nba/NbaLinescore";
import { NbaBoxScore } from "@/components/nba/NbaBoxScore";
import { NbaPlayByPlay } from "@/components/nba/NbaPlayByPlay";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/game/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `NBA Game ${params.id} — Box Score & Play-by-Play` },
      { name: "description", content: "Live box score, scoring plays, and full play-by-play for this NBA game." },
    ],
    links: [{ rel: "canonical", href: `https://www.playsports.online/nba/game/${params.id}` }],
    scripts: [ldScript(breadcrumbList([
      { name: "Home", path: "/" }, { name: "NBA", path: "/nba" }, { name: "Scores", path: "/nba/scores" }, { name: params.id, path: `/nba/game/${params.id}` },
    ]))],
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["nba", "game", params.id],
      queryFn: () => getNbaGame({ data: { id: params.id } }),
      staleTime: 15_000,
    }).catch(() => null);
    return null;
  },
  component: NbaGame,
});

type Tab = "summary" | "box" | "pbp";

function NbaGame() {
  const { id } = Route.useParams();
  const fn = useServerFn(getNbaGame);
  const q = useQuery({
    queryKey: ["nba", "game", id],
    queryFn: () => fn({ data: { id } }),
    staleTime: 15_000,
    refetchInterval: (qq) => {
      const d = qq.state.data as any;
      return d?.summary?.status === "in" ? 15_000 : false;
    },
  });
  const [tab, setTab] = useState<Tab>("summary");

  if (q.isLoading) return <div className="h-64 rounded-2xl ring-1 ring-border bg-card animate-pulse" />;
  const s = q.data?.summary;
  if (!s) return <div className="text-sm text-muted-foreground">Game not found.</div>;

  const live = s.status === "in";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-3xl ring-1 ring-border bg-card overflow-hidden">
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#17408b]/25 via-transparent to-[#f58426]/15">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-orange-300 font-bold">{s.shortDetail || s.statusDetail}</div>
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40">
                <Radio className="size-3 nba-live-pulse rounded-full" /> LIVE
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            <TeamSide team={s.away} />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.venue.name ?? ""}</div>
              <div className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums mt-1">
                {s.away.score ?? "–"} <span className="text-muted-foreground mx-2">·</span> {s.home.score ?? "–"}
              </div>
              {s.broadcast && <div className="text-[10px] mt-1 text-muted-foreground">{s.broadcast}</div>}
            </div>
            <TeamSide team={s.home} align="right" />
          </div>
        </div>
      </div>

      <NbaLinescore home={s.home} away={s.away} periodCount={s.periodCount} />

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1 flex-wrap">
        <TabBtn active={tab === "summary"} onClick={() => setTab("summary")}>Summary</TabBtn>
        <TabBtn active={tab === "box"} onClick={() => setTab("box")}>Box Score</TabBtn>
        <TabBtn active={tab === "pbp"} onClick={() => setTab("pbp")}>Play-by-Play</TabBtn>
      </div>

      {tab === "summary" && (
        <div className="space-y-5 tab-slide">
          {/* Leaders */}
          {s.leaders.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-2">Game leaders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {s.leaders.slice(0, 12).map((l, i) => (
                  <Link key={i} to="/nba/player/$id" params={{ id: l.athleteId }} className="rounded-xl ring-1 ring-border bg-card p-3 flex items-center gap-3 hover:ring-orange-400/40 transition">
                    {l.headshot && <img src={l.headshot} alt="" className="size-10 rounded-full object-cover bg-muted" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-orange-300/80 font-bold">{l.teamAbbr} · {l.label}</div>
                      <div className="text-sm font-bold text-white truncate">{l.name}</div>
                    </div>
                    <div className="text-base font-extrabold tabular-nums text-orange-300">{l.displayValue}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {/* Scoring plays summary */}
          {s.scoringPlays.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-white mb-2">Scoring summary</h3>
              <ol className="rounded-2xl ring-1 ring-border bg-card divide-y divide-border overflow-hidden">
                {s.scoringPlays.slice(0, 30).map((p) => (
                  <li key={p.id} className="px-3 py-2 flex items-start gap-3 text-sm">
                    <div className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground font-bold min-w-[3.5rem]">{p.period} {p.clock}</div>
                    <div className="flex-1 text-gray-100">{p.text}</div>
                    {p.awayScore != null && p.homeScore != null && (
                      <div className="text-[11px] font-bold tabular-nums text-orange-300">{p.awayScore} – {p.homeScore}</div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {s.odds && (
            <section className="text-xs text-muted-foreground">
              Odds: <span className="text-white">{s.odds.details ?? "—"}</span>
              {s.odds.overUnder != null && <span className="ml-2">O/U {s.odds.overUnder}</span>}
              {s.odds.provider && <span className="ml-2">· {s.odds.provider}</span>}
            </section>
          )}
        </div>
      )}

      {tab === "box" && <div className="tab-slide"><NbaBoxScore groups={s.boxscore} /></div>}
      {tab === "pbp" && <div className="tab-slide"><NbaPlayByPlay plays={s.plays} /></div>}
    </div>
  );
}

function TeamSide({ team, align = "left" }: { team: any; align?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-3 min-w-0 ${align === "right" ? "justify-end" : ""}`}>
      {align === "left" && team.logo && <img src={team.logo} alt="" className="size-12 sm:size-16 object-contain" />}
      <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
        <Link to="/nba/team/$id" params={{ id: team.id }} className="text-base sm:text-xl font-bold text-white truncate block hover:text-orange-300 transition">
          {team.shortName || team.name}
        </Link>
        {team.record && <div className="text-[11px] text-muted-foreground">{team.record}</div>}
      </div>
      {align === "right" && team.logo && <img src={team.logo} alt="" className="size-12 sm:size-16 object-contain" />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40" : "text-muted-foreground hover:text-white"
      }`}
    >{children}</button>
  );
}
